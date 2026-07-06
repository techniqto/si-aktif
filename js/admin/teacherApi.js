/**
 * SI-AKTIF Teacher API Client (GitHub Pages / Static Version)
 * 
 * Uses window.DB data layer instead of direct HTTP calls to Express server.
 * All CRUD operations go through localStorage-backed storage.
 */

window.TeacherApi = {
    /**
     * Get all teachers with optional search query.
     * Implements server-side-equivalent filtering client-side.
     * @param {string} search - Optional search term
     * @returns {Promise<{success: boolean, data: Array, total: number, message: string}>}
     */
    getAll: async (search = '') => {
        try {
            const users = await window.DB.getUsers();
            let teachers = users.filter(u => u.role !== 'admin');

            // Client-side search (replaces server-side search)
            const term = (search || '').toLowerCase().trim();
            if (term) {
                teachers = teachers.filter(t => {
                    return (t.name || '').toLowerCase().includes(term) ||
                           (t.kodeGuru || '').toLowerCase().includes(term) ||
                           (t.nip || '').toLowerCase().includes(term) ||
                           (t.subjects || []).some(s => s.toLowerCase().includes(term)) ||
                           (t.tugasTambahan || '').toLowerCase().includes(term);
                });
            }

            return {
                success: true,
                data: teachers,
                total: teachers.length,
                message: 'Data guru berhasil diambil.'
            };
        } catch (error) {
            console.error('TeacherApi.getAll error:', error);
            return { success: false, data: [], total: 0, message: 'Gagal mengambil data guru.' };
        }
    },

    /**
     * Get a single teacher by ID.
     * @param {string} id
     * @returns {Promise<{success: boolean, data: Object, message: string}>}
     */
    getById: async (id) => {
        try {
            const users = await window.DB.getUsers();
            const teacher = users.find(u => u.id === id && u.role !== 'admin');

            if (!teacher) {
                return { success: false, data: null, message: 'Guru tidak ditemukan.' };
            }

            return { success: true, data: teacher, message: 'Data guru ditemukan.' };
        } catch (error) {
            console.error('TeacherApi.getById error:', error);
            return { success: false, data: null, message: 'Gagal mengambil data guru.' };
        }
    },

    /**
     * Create a new teacher with client-side validation.
     * @param {Object} data - Teacher data
     * @returns {Promise<{success: boolean, data: Object, message: string, errors: Array}>}
     */
    create: async (data) => {
        try {
            // Client-side validation (replaces server middleware)
            const errors = window.TeacherApi._validate(data, false);
            if (errors.length > 0) {
                return {
                    success: false,
                    message: 'Validasi gagal. Periksa kembali data Anda.',
                    errors
                };
            }

            const users = await window.DB._getData('users');

            const newTeacher = {
                id: data.id || 'user_' + Date.now(),
                kodeGuru: data.kodeGuru.trim(),
                username: (data.username || data.kodeGuru).toLowerCase().trim(),
                password: data.password || 'guru123',
                name: data.name.trim(),
                role: 'guru',
                subjects: data.subjects || [],
                isWaliKelas: data.isWaliKelas || false,
                waliKelasId: data.waliKelasId || null,
                teachingClasses: data.teachingClasses || [],
                nip: (data.nip || '').trim(),
                tugasTambahan: data.tugasTambahan || '-'
            };

            users.push(newTeacher);
            window.DB._setLocal('users', users);
            window.DB.cache.users = null;

            return {
                success: true,
                data: newTeacher,
                message: `Guru "${data.name}" berhasil ditambahkan.`
            };
        } catch (error) {
            console.error('TeacherApi.create error:', error);
            return { success: false, message: 'Gagal menyimpan data guru.', errors: [] };
        }
    },

    /**
     * Update an existing teacher.
     * @param {string} id
     * @param {Object} data - Updated teacher data
     * @returns {Promise<{success: boolean, data: Object, message: string, errors: Array}>}
     */
    update: async (id, data) => {
        try {
            // Client-side validation
            const errors = window.TeacherApi._validate(data, true, id);
            if (errors.length > 0) {
                return {
                    success: false,
                    message: 'Validasi gagal. Periksa kembali data Anda.',
                    errors
                };
            }

            const users = await window.DB._getData('users');
            const idx = users.findIndex(u => u.id === id);

            if (idx < 0) {
                return { success: false, message: 'Guru tidak ditemukan.', errors: [] };
            }

            const originalPassword = users[idx].password || 'guru123';
            users[idx] = {
                ...users[idx],
                name: data.name.trim(),
                nip: (data.nip || '').trim(),
                kodeGuru: data.kodeGuru.trim(),
                username: (data.username || data.kodeGuru).toLowerCase().trim(),
                subjects: data.subjects || users[idx].subjects,
                isWaliKelas: data.isWaliKelas !== undefined ? data.isWaliKelas : users[idx].isWaliKelas,
                waliKelasId: data.waliKelasId !== undefined ? data.waliKelasId : users[idx].waliKelasId,
                teachingClasses: data.teachingClasses || users[idx].teachingClasses,
                tugasTambahan: data.tugasTambahan || users[idx].tugasTambahan,
                password: data.password || originalPassword
            };

            window.DB._setLocal('users', users);
            window.DB.cache.users = null;

            return {
                success: true,
                data: users[idx],
                message: `Data guru "${data.name}" berhasil diperbarui.`
            };
        } catch (error) {
            console.error('TeacherApi.update error:', error);
            return { success: false, message: 'Gagal memperbarui data guru.', errors: [] };
        }
    },

    /**
     * Delete a teacher by ID.
     * @param {string} id
     * @returns {Promise<{success: boolean, message: string}>}
     */
    delete: async (id) => {
        try {
            const users = await window.DB._getData('users');
            const teacher = users.find(u => u.id === id);

            if (!teacher) {
                return { success: false, message: 'Guru tidak ditemukan.' };
            }

            const filtered = users.filter(u => u.id !== id);
            window.DB._setLocal('users', filtered);
            window.DB.cache.users = null;

            return {
                success: true,
                data: null,
                message: `Guru "${teacher.name}" berhasil dihapus.`
            };
        } catch (error) {
            console.error('TeacherApi.delete error:', error);
            return { success: false, message: 'Gagal menghapus data guru.' };
        }
    },

    /**
     * Client-side validation (mirrors backend middleware/validate.js logic).
     * @param {Object} data - Teacher form data
     * @param {boolean} isEdit - Whether this is an update operation
     * @param {string} editId - The ID being edited (for uniqueness checks)
     * @returns {Array} Array of error objects
     */
    _validate: (data, isEdit = false, editId = null) => {
        const errors = [];
        const { name, nip, kodeGuru, subjects } = data;

        if (!name || name.trim().length === 0) {
            errors.push({ field: 'name', message: 'Nama guru wajib diisi.' });
        }

        if (nip && !/^\d+$/.test(nip)) {
            errors.push({ field: 'nip', message: 'NIP harus berupa angka.' });
        }

        // NIP uniqueness — uses synchronous check from cache
        if (nip && nip.trim().length > 0 && window.DB.cache.users) {
            const duplicate = window.DB.cache.users.find(u => u.nip === nip && u.id !== editId);
            if (duplicate) {
                errors.push({ field: 'nip', message: `NIP "${nip}" sudah digunakan oleh ${duplicate.name}.` });
            }
        }

        if (!kodeGuru || kodeGuru.trim().length === 0) {
            errors.push({ field: 'kodeGuru', message: 'Kode guru wajib diisi.' });
        }

        // KodeGuru uniqueness (only on create)
        if (!isEdit && kodeGuru && kodeGuru.trim().length > 0 && window.DB.cache.users) {
            const duplicate = window.DB.cache.users.find(u => u.kodeGuru === kodeGuru);
            if (duplicate) {
                errors.push({ field: 'kodeGuru', message: `Kode guru "${kodeGuru}" sudah digunakan.` });
            }
        }

        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
            errors.push({ field: 'subjects', message: 'Mata pelajaran wajib diisi minimal satu.' });
        }

        return errors;
    }
};
