/**
 * SI-AKTIF Teacher API Client
 * Dedicated API layer for teacher CRUD operations using versioned endpoints.
 */

window.TeacherApi = {
    BASE: 'http://localhost:3000/api/v1',

    /**
     * Get all teachers with optional search query.
     * @param {string} search - Optional search term
     * @returns {Promise<{success: boolean, data: Array, total: number, message: string}>}
     */
    getAll: async (search = '') => {
        try {
            const params = search ? `?search=${encodeURIComponent(search)}` : '';
            const response = await fetch(`${window.TeacherApi.BASE}/teachers${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
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
            const response = await fetch(`${window.TeacherApi.BASE}/teachers/${id}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('TeacherApi.getById error:', error);
            return { success: false, data: null, message: 'Gagal mengambil data guru.' };
        }
    },

    /**
     * Create a new teacher.
     * @param {Object} data - Teacher data
     * @returns {Promise<{success: boolean, data: Object, message: string, errors: Array}>}
     */
    create: async (data) => {
        try {
            const response = await fetch(`${window.TeacherApi.BASE}/teachers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            return result;
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
            const response = await fetch(`${window.TeacherApi.BASE}/teachers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            return result;
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
            const response = await fetch(`${window.TeacherApi.BASE}/teachers/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('TeacherApi.delete error:', error);
            return { success: false, message: 'Gagal menghapus data guru.' };
        }
    }
};
