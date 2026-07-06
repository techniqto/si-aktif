/**
 * SI-AKTIF Student API Client (GitHub Pages / Static Version)
 * 
 * Uses window.DB data layer instead of direct HTTP calls to Express server.
 * All CRUD operations go through localStorage-backed storage.
 */

window.StudentApi = {
    /**
     * Get all students with optional search and class filter.
     * @param {string} search - Optional search term
     * @param {string} classId - Optional class filter
     * @returns {Promise<{success: boolean, data: Array, total: number, message: string}>}
     */
    getAll: async (search = '', classId = '') => {
        try {
            let students = await window.DB.getStudents();

            // Filter by class
            if (classId) {
                students = students.filter(s => s.classId === classId);
            }

            // Client-side search
            const term = (search || '').toLowerCase().trim();
            if (term) {
                students = students.filter(s => {
                    return (s.name || '').toLowerCase().includes(term) ||
                           (s.nis || '').toLowerCase().includes(term) ||
                           (s.classId || '').toLowerCase().includes(term);
                });
            }

            return {
                success: true,
                data: students,
                total: students.length,
                message: 'Data siswa berhasil diambil.'
            };
        } catch (error) {
            console.error('StudentApi.getAll error:', error);
            return { success: false, data: [], total: 0, message: 'Gagal mengambil data siswa.' };
        }
    },

    /**
     * Create a new student with client-side validation.
     */
    create: async (data) => {
        try {
            const errors = window.StudentApi._validate(data);
            if (errors.length > 0) {
                return {
                    success: false,
                    message: 'Validasi gagal. Periksa kembali data Anda.',
                    errors
                };
            }

            const students = await window.DB._getData('students');

            const newStudent = {
                id: data.id || 'stu_' + Date.now(),
                nis: data.nis.trim(),
                name: data.name.trim(),
                gender: (data.gender || 'L').toUpperCase(),
                classId: data.classId.trim()
            };

            students.push(newStudent);
            window.DB._setLocal('students', students);
            window.DB.cache.students = null;

            return {
                success: true,
                data: newStudent,
                message: `Siswa "${data.name}" berhasil ditambahkan.`
            };
        } catch (error) {
            console.error('StudentApi.create error:', error);
            return { success: false, message: 'Gagal menyimpan data siswa.', errors: [] };
        }
    },

    /**
     * Update an existing student.
     */
    update: async (id, data) => {
        try {
            const errors = window.StudentApi._validate(data, id);
            if (errors.length > 0) {
                return {
                    success: false,
                    message: 'Validasi gagal. Periksa kembali data Anda.',
                    errors
                };
            }

            const students = await window.DB._getData('students');
            const idx = students.findIndex(s => s.id === id);

            if (idx < 0) {
                return { success: false, message: 'Siswa tidak ditemukan.', errors: [] };
            }

            students[idx] = {
                ...students[idx],
                nis: data.nis.trim(),
                name: data.name.trim(),
                gender: (data.gender || students[idx].gender).toUpperCase(),
                classId: data.classId.trim()
            };

            window.DB._setLocal('students', students);
            window.DB.cache.students = null;

            return {
                success: true,
                data: students[idx],
                message: `Data siswa "${data.name}" berhasil diperbarui.`
            };
        } catch (error) {
            console.error('StudentApi.update error:', error);
            return { success: false, message: 'Gagal memperbarui data siswa.', errors: [] };
        }
    },

    /**
     * Delete a student by ID.
     */
    delete: async (id) => {
        try {
            const students = await window.DB._getData('students');
            const student = students.find(s => s.id === id);

            if (!student) {
                return { success: false, message: 'Siswa tidak ditemukan.' };
            }

            const filtered = students.filter(s => s.id !== id);
            window.DB._setLocal('students', filtered);
            window.DB.cache.students = null;

            return {
                success: true,
                data: null,
                message: `Siswa "${student.name}" berhasil dihapus.`
            };
        } catch (error) {
            console.error('StudentApi.delete error:', error);
            return { success: false, message: 'Gagal menghapus data siswa.' };
        }
    },

    /**
     * Import students via CSV file (client-side parsing).
     * @param {File} file - CSV file to process
     */
    importCSV: async (file) => {
        try {
            const csvContent = await file.text();
            const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            if (lines.length < 2) {
                return {
                    success: false,
                    message: 'File CSV kosong atau hanya memiliki header.',
                    errors: []
                };
            }

            const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
            const nisIdx = headers.indexOf('nis');
            const nameIdx = headers.indexOf('name');
            const genderIdx = headers.indexOf('gender');
            const classIdx = headers.indexOf('classid');

            if (nisIdx === -1 || nameIdx === -1 || genderIdx === -1 || classIdx === -1) {
                return {
                    success: false,
                    message: 'Header CSV tidak valid. Wajib memiliki: nis, name, gender, classId',
                    errors: [{ field: 'csvFile', message: 'Header kolom tidak sesuai format.' }]
                };
            }

            const existingStudents = await window.DB._getData('students');
            const existingNIS = new Set(existingStudents.map(s => s.nis));
            const imported = [];
            const skipped = [];

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                if (cols.length < 4) continue;

                const nis = cols[nisIdx];
                const name = cols[nameIdx];
                const gender = cols[genderIdx].toUpperCase();
                const classId = cols[classIdx];

                if (!nis || !name || !classId) continue;

                if (existingNIS.has(nis)) {
                    skipped.push({ nis, name, reason: 'NIS sudah terdaftar.' });
                    continue;
                }

                const newStudent = {
                    id: 'stu_' + Date.now() + '_' + i,
                    nis, name, gender, classId
                };

                existingStudents.push(newStudent);
                existingNIS.add(nis);
                imported.push(newStudent);
            }

            window.DB._setLocal('students', existingStudents);
            window.DB.cache.students = null;

            return {
                success: true,
                data: {
                    imported: imported.length,
                    skipped: skipped.length,
                    skippedDetails: skipped
                },
                message: `Berhasil mengimpor ${imported.length} siswa. ${skipped.length} data dilewati (duplikat).`
            };
        } catch (err) {
            console.error('CSV import error:', err);
            return {
                success: false,
                message: 'Gagal memproses file CSV.',
                errors: [{ field: 'csvFile', message: err.message }]
            };
        }
    },

    /**
     * Client-side validation (mirrors backend middleware logic).
     * @param {Object} data - Student form data
     * @param {string} editId - The ID being edited (for uniqueness checks)
     * @returns {Array} Array of error objects
     */
    _validate: (data, editId = null) => {
        const errors = [];
        const { nis, name, classId, gender } = data;

        if (!nis || nis.trim().length === 0) {
            errors.push({ field: 'nis', message: 'NIS/NISN wajib diisi.' });
        } else if (!/^\d+$/.test(nis)) {
            errors.push({ field: 'nis', message: 'NIS/NISN harus berupa angka.' });
        }

        // NIS uniqueness check
        if (nis && nis.trim().length > 0 && window.DB.cache.students) {
            const duplicate = window.DB.cache.students.find(s => s.nis === nis && s.id !== editId);
            if (duplicate) {
                errors.push({ field: 'nis', message: `NIS "${nis}" sudah digunakan oleh ${duplicate.name}.` });
            }
        }

        if (!name || name.trim().length === 0) {
            errors.push({ field: 'name', message: 'Nama siswa wajib diisi.' });
        }

        if (!classId || classId.trim().length === 0) {
            errors.push({ field: 'classId', message: 'Kelas wajib dipilih.' });
        }

        if (gender && !['L', 'P'].includes(gender.toUpperCase())) {
            errors.push({ field: 'gender', message: 'Jenis kelamin harus L atau P.' });
        }

        return errors;
    }
};
