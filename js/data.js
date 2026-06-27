/**
 * SI-AKTIF API Data Layer
 */

const API_BASE = 'http://localhost:3000/api';

window.DB = {
    // --- Data Caching ---
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

    // --- Fetchers ---
    fetchFromAPI: async (endpoint) => {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            window.App.showToast('Gagal mengambil data dari server', 'error');
            return [];
        }
    },

    postToAPI: async (endpoint, data) => {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Post error:', error);
            window.App.showToast('Gagal menyimpan data ke server', 'error');
            return { success: false };
        }
    },

    putToAPI: async (endpoint, data) => {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Put error:', error);
            window.App.showToast('Gagal update data ke server', 'error');
            return { success: false };
        }
    },

    deleteFromAPI: async (endpoint) => {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Delete error:', error);
            window.App.showToast('Gagal hapus data dari server', 'error');
            return { success: false };
        }
    },

    // --- Getters (Async) ---
    getUsers: async () => {
        if (!window.DB.cache.users) window.DB.cache.users = await window.DB.fetchFromAPI('/users');
        return window.DB.cache.users;
    },
    
    getClasses: async () => {
        if (!window.DB.cache.classes) window.DB.cache.classes = await window.DB.fetchFromAPI('/classes');
        return window.DB.cache.classes;
    },
    
    getStudents: async () => {
        if (!window.DB.cache.students) window.DB.cache.students = await window.DB.fetchFromAPI('/students');
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
        if (!window.DB.cache.schedules) window.DB.cache.schedules = await window.DB.fetchFromAPI('/schedules');
        return window.DB.cache.schedules;
    },
    
    getAttendanceDaily: async () => {
        // Always fetch fresh data for attendance to ensure realtime sync
        return await window.DB.fetchFromAPI('/attendance-daily');
    },
    
    getAttendanceSubject: async () => {
        return await window.DB.fetchFromAPI('/attendance-subject');
    },
    
    // --- Savers (Async) ---
    saveAttendanceDaily: async (record) => {
        const result = await window.DB.postToAPI('/attendance-daily', record);
        if (result.success) {
            window.App.showToast('Absensi harian berhasil disimpan', 'success');
        }
        return result;
    },

    saveAttendanceSubject: async (record) => {
        const result = await window.DB.postToAPI('/attendance-subject', record);
        if (result.success) {
            window.App.showToast('Absensi mata pelajaran berhasil disimpan', 'success');
        }
        return result;
    },

    // --- Admin CRUD (Users) ---
    saveUser: async (record) => {
        const result = record.isEdit ? await window.DB.putToAPI(`/users/${record.id}`, record) : await window.DB.postToAPI('/users', record);
        if (result.success) {
            window.DB.cache.users = null; // Invalidate cache
            window.App.showToast('Data guru berhasil disimpan', 'success');
        }
        return result;
    },
    deleteUser: async (id) => {
        const result = await window.DB.deleteFromAPI(`/users/${id}`);
        if (result.success) {
            window.DB.cache.users = null;
            window.App.showToast('Data guru berhasil dihapus', 'success');
        }
        return result;
    },

    // --- Admin CRUD (Classes) ---
    saveClass: async (record) => {
        const result = record.isEdit ? await window.DB.putToAPI(`/classes/${record.id}`, record) : await window.DB.postToAPI('/classes', record);
        if (result.success) {
            window.DB.cache.classes = null;
            window.App.showToast('Data kelas berhasil disimpan', 'success');
        }
        return result;
    },
    deleteClass: async (id) => {
        const result = await window.DB.deleteFromAPI(`/classes/${id}`);
        if (result.success) {
            window.DB.cache.classes = null;
            window.App.showToast('Data kelas berhasil dihapus', 'success');
        }
        return result;
    },

    // --- Admin CRUD (Students) ---
    saveStudent: async (record) => {
        const result = record.isEdit ? await window.DB.putToAPI(`/students/${record.id}`, record) : await window.DB.postToAPI('/students', record);
        if (result.success) {
            window.DB.cache.students = null;
            window.App.showToast('Data siswa berhasil disimpan', 'success');
        }
        return result;
    },
    deleteStudent: async (id) => {
        const result = await window.DB.deleteFromAPI(`/students/${id}`);
        if (result.success) {
            window.DB.cache.students = null;
            window.App.showToast('Data siswa berhasil dihapus', 'success');
        }
        return result;
    }
};
