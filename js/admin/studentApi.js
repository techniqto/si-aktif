/**
 * SI-AKTIF Student API Client
 * Dedicated API layer for student CRUD operations using versioned endpoints.
 */

window.StudentApi = {
    BASE: 'http://localhost:3000/api/v1',

    /**
     * Get all students with optional search and class filter.
     * @param {string} search - Optional search term
     * @param {string} classId - Optional class filter
     * @returns {Promise<{success: boolean, data: Array, total: number, message: string}>}
     */
    getAll: async (search = '', classId = '') => {
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (classId) params.set('classId', classId);
            const qs = params.toString() ? `?${params.toString()}` : '';

            const response = await fetch(`${window.StudentApi.BASE}/students${qs}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('StudentApi.getAll error:', error);
            return { success: false, data: [], total: 0, message: 'Gagal mengambil data siswa.' };
        }
    },

    /**
     * Create a new student.
     */
    create: async (data) => {
        try {
            const response = await fetch(`${window.StudentApi.BASE}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
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
            const response = await fetch(`${window.StudentApi.BASE}/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
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
            const response = await fetch(`${window.StudentApi.BASE}/students/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('StudentApi.delete error:', error);
            return { success: false, message: 'Gagal menghapus data siswa.' };
        }
    },

    /**
     * Import students via CSV file upload.
     * @param {File} file - CSV file to upload
     */
    importCSV: async (file) => {
        try {
            const formData = new FormData();
            formData.append('csvFile', file);

            const response = await fetch(`${window.StudentApi.BASE}/students/import-csv`, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('StudentApi.importCSV error:', error);
            return { success: false, message: 'Gagal mengimpor file CSV.', errors: [] };
        }
    }
};
