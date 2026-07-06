/**
 * SI-AKTIF Authentication Logic (GitHub Pages / Static Version)
 * 
 * Performs login by fetching users data via window.DB and matching
 * username + password client-side. Session stored in sessionStorage.
 */

const SESSION_KEY = 'siaktif_session';

window.Auth = {
    login: async (username, password) => {
        try {
            // Get users from the data layer (static JSON + localStorage)
            const users = await window.DB._getData('users');
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                const sessionData = { ...user };
                delete sessionData.password;
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
                return { success: true, user: sessionData };
            }

            return { success: false, message: 'Username atau password salah' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Gagal memproses login' };
        }
    },

    logout: () => {
        sessionStorage.removeItem(SESSION_KEY);
        window.DB.clearCache();
        window.location.hash = '#login';
    },

    getCurrentUser: () => {
        const data = sessionStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    },

    isAuthenticated: () => {
        return !!sessionStorage.getItem(SESSION_KEY);
    },

    requireAuth: () => {
        if (!window.Auth.isAuthenticated()) {
            window.location.hash = '#login';
            return false;
        }
        return true;
    }
};
