/**
 * SI-AKTIF Authentication Logic
 */

const SESSION_KEY = 'siaktif_session';

window.Auth = {
    login: async (username, password) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            
            if (data.success) {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
                return { success: true, user: data.user };
            }
            
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Gagal terhubung ke server backend' };
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
