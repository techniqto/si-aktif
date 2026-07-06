/**
 * SI-AKTIF Data Layer (GitHub Pages / Static Version)
 * 
 * Architecture:
 *   READ:  Fetch static .json files from /api/ folder → merge with localStorage overrides
 *   WRITE: Save to localStorage (browser-local persistence)
 * 
 * localStorage keys: siaktif_<collection>  (e.g. siaktif_users, siaktif_students)
 */

// Base path for static JSON files — relative so it works on GitHub Pages
const API_BASE = './api';

// localStorage prefix
const LS_PREFIX = 'siaktif_';

// Version of the static data schema to force reset on new deployment
const DB_VERSION = '3';

// Check version and clear cache if mismatch
if (localStorage.getItem(`${LS_PREFIX}db_version`) !== DB_VERSION) {
    const collections = ['users', 'classes', 'students', 'schedules', 'attendance_daily', 'attendance_subject', 'settings'];
    for (const col of collections) {
        localStorage.removeItem(`${LS_PREFIX}${col}`);
    }
    localStorage.setItem(`${LS_PREFIX}db_version`, DB_VERSION);
    console.log('SI-AKTIF: Data version updated, localStorage cleared.');
}

window.DB = {
    // --- Internal Helpers ---

    /**
     * Get data from localStorage for a given collection.
     * Returns null if nothing stored yet (first visit).
     */
    _getLocal: (collection) => {
        const raw = localStorage.getItem(`${LS_PREFIX}${collection}`);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    /**
     * Save data to localStorage for a given collection.
     */
    _setLocal: (collection, data) => {
        localStorage.setItem(`${LS_PREFIX}${collection}`, JSON.stringify(data));
    },

    /**
     * Fetch static JSON from the api/ folder.
     * This is the "seed" / default data from the repository.
     */
    _fetchStatic: async (filename) => {
        try {
            const response = await fetch(`${API_BASE}/${filename}.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch ${filename}.json:`, error);
            return [];
        }
    },

    /**
     * Get data for a collection. Priority:
     * 1. localStorage (user's modified data)
     * 2. Static JSON file (seed/default data) — and cache to localStorage on first load
     */
    _getData: async (collection) => {
        // Check localStorage first
        const local = window.DB._getLocal(collection);
        if (local !== null) return local;

        // First visit: fetch from static JSON and store in localStorage
        const data = await window.DB._fetchStatic(collection);
        window.DB._setLocal(collection, data);
        return data;
    },

    // --- Data Caching (in-memory for current session) ---
    cache: {
        users: null,
        classes: null,
        students: null,
        schedules: null,
        attendance_daily: null,
        attendance_subject: null
    },

    clearCache: () => {
        window.DB.cache = {
            users: null,
            classes: null,
            students: null,
            schedules: null,
            attendance_daily: null,
            attendance_subject: null
        };
    },

    /**
     * Reset all data back to defaults (re-fetch from static JSON).
     * Useful for "factory reset" of demo data.
     */
    resetToDefaults: async () => {
        const collections = ['users', 'classes', 'students', 'schedules', 'attendance_daily', 'attendance_subject', 'settings'];
        for (const col of collections) {
            localStorage.removeItem(`${LS_PREFIX}${col}`);
        }
        window.DB.clearCache();
        console.log('SI-AKTIF: All data reset to defaults.');
    },

    // --- Getters (Async) ---
    getUsers: async () => {
        if (!window.DB.cache.users) {
            window.DB.cache.users = await window.DB._getData('users');
        }
        return window.DB.cache.users;
    },

    getClasses: async () => {
        if (!window.DB.cache.classes) {
            window.DB.cache.classes = await window.DB._getData('classes');
        }
        return window.DB.cache.classes;
    },

    getStudents: async () => {
        if (!window.DB.cache.students) {
            window.DB.cache.students = await window.DB._getData('students');
        }
        return window.DB.cache.students;
    },

    getStudentsByClass: async (classId) => {
        const students = await window.DB.getStudents();
        const classStudents = students.filter(s => s.classId === classId);
        // Sort alphabetically by name for consistent nomor absen ordering
        classStudents.sort((a, b) => a.name.localeCompare(b.name, 'id'));
        // Assign noAbsen if not already present
        classStudents.forEach((s, idx) => {
            if (!s.noAbsen) s.noAbsen = idx + 1;
        });
        return classStudents;
    },

    getSchedule: async () => {
        if (!window.DB.cache.schedules) {
            window.DB.cache.schedules = await window.DB._getData('schedules');
        }
        return window.DB.cache.schedules;
    },

    getAttendanceDaily: async () => {
        // Always fetch fresh from localStorage (no in-memory cache for attendance)
        return await window.DB._getData('attendance_daily');
    },

    getAttendanceSubject: async () => {
        return await window.DB._getData('attendance_subject');
    },

    // --- Generic fetch/post wrappers (for backward compatibility) ---
    fetchFromAPI: async (endpoint) => {
        // Map legacy endpoint paths to collection names
        const mapping = {
            '/users': 'users',
            '/classes': 'classes',
            '/students': 'students',
            '/schedules': 'schedules',
            '/attendance-daily': 'attendance_daily',
            '/attendance-subject': 'attendance_subject'
        };
        const collection = mapping[endpoint];
        if (collection) {
            return await window.DB._getData(collection);
        }
        console.warn('Unknown endpoint:', endpoint);
        return [];
    },

    postToAPI: async (endpoint, data) => {
        // Route to the appropriate save function
        if (endpoint === '/attendance-daily') {
            return await window.DB.saveAttendanceDaily(data);
        }
        if (endpoint === '/attendance-subject') {
            return await window.DB.saveAttendanceSubject(data);
        }
        // Generic collection post
        const mapping = {
            '/users': 'users',
            '/classes': 'classes',
            '/students': 'students'
        };
        const collection = mapping[endpoint];
        if (collection) {
            const allData = await window.DB._getData(collection);
            allData.push(data);
            window.DB._setLocal(collection, allData);
            window.DB.cache[collection] = null;
            return { success: true };
        }
        return { success: false };
    },

    putToAPI: async (endpoint, data) => {
        // Parse endpoint to extract collection and id: e.g. /users/admin
        const match = endpoint.match(/^\/(users|classes|students)\/(.+)$/);
        if (match) {
            const collection = match[1];
            const id = match[2];
            const allData = await window.DB._getData(collection);
            const idx = allData.findIndex(item => item.id === id);
            if (idx >= 0) {
                if (collection === 'users') {
                    const originalPassword = allData[idx].password || 'guru123';
                    allData[idx] = { ...allData[idx], ...data, password: data.password || originalPassword };
                } else {
                    allData[idx] = { ...allData[idx], ...data };
                }
                window.DB._setLocal(collection, allData);
                window.DB.cache[collection] = null;
                return { success: true };
            }
        }
        return { success: false };
    },

    deleteFromAPI: async (endpoint) => {
        const match = endpoint.match(/^\/(users|classes|students)\/(.+)$/);
        if (match) {
            const collection = match[1];
            const id = match[2];
            const allData = await window.DB._getData(collection);
            const filtered = allData.filter(item => item.id !== id);
            window.DB._setLocal(collection, filtered);
            window.DB.cache[collection] = null;
            return { success: true };
        }
        return { success: false };
    },

    // --- Savers (Async) ---
    saveAttendanceDaily: async (record) => {
        const data = await window.DB._getData('attendance_daily');
        const existingIdx = data.findIndex(d => d.id === record.id);
        if (existingIdx >= 0) {
            data[existingIdx] = record;
        } else {
            data.push(record);
        }
        window.DB._setLocal('attendance_daily', data);
        if (window.App && window.App.showToast) {
            window.App.showToast('Absensi harian berhasil disimpan', 'success');
        }
        return { success: true, message: 'Absensi harian berhasil disimpan' };
    },

    saveAttendanceSubject: async (record) => {
        const data = await window.DB._getData('attendance_subject');
        const existingIdx = data.findIndex(d => d.id === record.id);
        if (existingIdx >= 0) {
            data[existingIdx] = record;
        } else {
            data.push(record);
        }
        window.DB._setLocal('attendance_subject', data);
        if (window.App && window.App.showToast) {
            window.App.showToast('Absensi mata pelajaran berhasil disimpan', 'success');
        }
        return { success: true, message: 'Absensi mapel berhasil disimpan' };
    },

    // --- Admin CRUD (Users) ---
    saveUser: async (record) => {
        const data = await window.DB._getData('users');
        if (record.isEdit) {
            const idx = data.findIndex(u => u.id === record.id);
            if (idx >= 0) {
                const originalPassword = data[idx].password || 'guru123';
                data[idx] = { ...data[idx], ...record, password: record.password || originalPassword };
            }
        } else {
            data.push(record);
        }
        window.DB._setLocal('users', data);
        window.DB.cache.users = null;
        if (window.App && window.App.showToast) {
            window.App.showToast('Data guru berhasil disimpan', 'success');
        }
        return { success: true };
    },

    deleteUser: async (id) => {
        const data = await window.DB._getData('users');
        const filtered = data.filter(u => u.id !== id);
        window.DB._setLocal('users', filtered);
        window.DB.cache.users = null;
        if (window.App && window.App.showToast) {
            window.App.showToast('Data guru berhasil dihapus', 'success');
        }
        return { success: true };
    },

    // --- Admin CRUD (Classes) ---
    saveClass: async (record) => {
        const data = await window.DB._getData('classes');
        if (record.isEdit) {
            const idx = data.findIndex(c => c.id === record.id);
            if (idx >= 0) data[idx] = record;
        } else {
            data.push(record);
        }
        window.DB._setLocal('classes', data);
        window.DB.cache.classes = null;
        if (window.App && window.App.showToast) {
            window.App.showToast('Data kelas berhasil disimpan', 'success');
        }
        return { success: true };
    },

    deleteClass: async (id) => {
        const data = await window.DB._getData('classes');
        const filtered = data.filter(c => c.id !== id);
        window.DB._setLocal('classes', filtered);
        window.DB.cache.classes = null;
        if (window.App && window.App.showToast) {
            window.App.showToast('Data kelas berhasil dihapus', 'success');
        }
        return { success: true };
    },

    // --- Admin CRUD (Students) ---
    saveStudent: async (record) => {
        const data = await window.DB._getData('students');
        if (record.isEdit) {
            const idx = data.findIndex(s => s.id === record.id);
            if (idx >= 0) data[idx] = record;
        } else {
            data.push(record);
        }
        window.DB._setLocal('students', data);
        window.DB.cache.students = null;
        if (window.App && window.App.showToast) {
            window.App.showToast('Data siswa berhasil disimpan', 'success');
        }
        return { success: true };
    },

    deleteStudent: async (id) => {
        const data = await window.DB._getData('students');
        const filtered = data.filter(s => s.id !== id);
        window.DB._setLocal('students', filtered);
        window.DB.cache.students = null;
        if (window.App && window.App.showToast) {
            window.App.showToast('Data siswa berhasil dihapus', 'success');
        }
        return { success: true };
    }
};
