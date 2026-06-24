/**
 * SI-AKTIF Main Application & SPA Router
 */

const App = {
    simulatedDate: new Date(),

    init: () => {
        App.bindEvents();
        App.handleRoute();
        App.initDatePicker();
        
        // Listen to hash changes for SPA routing
        window.addEventListener('hashchange', App.handleRoute);
    },

    bindEvents: () => {
        // Login Form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const user = document.getElementById('username').value;
                const pass = document.getElementById('password').value;
                
                // Show loading state on button
                const btn = loginForm.querySelector('button');
                const oldText = btn.innerHTML;
                btn.innerHTML = 'Memproses...';
                btn.disabled = true;

                const res = await window.Auth.login(user, pass);
                
                btn.innerHTML = oldText;
                btn.disabled = false;

                if (res.success) {
                    App.showToast('Login berhasil', 'success');
                    // Route based on role
                    if (res.user.role === 'admin') {
                        window.location.hash = '#admin-dashboard';
                    } else {
                        window.location.hash = '#teacher-dashboard';
                    }
                } else {
                    App.showToast(res.message, 'error');
                }
            });
        }

        // Logout Button
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                window.Auth.logout();
                App.showToast('Berhasil logout', 'success');
            });
        }

        // Mobile Menu
        const btnMobileMenu = document.getElementById('btn-mobile-menu');
        if (btnMobileMenu) {
            btnMobileMenu.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('open');
            });
        }
    },

    handleRoute: () => {
        let hash = window.location.hash || '#login';
        
        // Hide all views and pages
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        if (hash === '#login') {
            if (window.Auth.isAuthenticated()) {
                const user = window.Auth.getCurrentUser();
                window.location.hash = user.role === 'admin' ? '#admin-dashboard' : '#teacher-dashboard';
                return;
            }
            document.getElementById('view-login').classList.add('active');
            return;
        }

        // Protected Routes
        if (!window.Auth.requireAuth()) return;
        
        const user = window.Auth.getCurrentUser();
        
        // Setup App Shell for logged in user
        document.getElementById('view-app').classList.add('active');
        App.renderSidebar(user);
        
        // Set profile info
        document.getElementById('sidebar-user-name').textContent = user.name;
        
        let roleText = 'Administrator';
        if (user.role !== 'admin') {
            const subjectText = (user.subjects && user.subjects.length > 0) ? user.subjects.join(', ') : '';
            if (user.isWaliKelas) {
                roleText = subjectText ? `Wali Kelas / Guru ${subjectText}` : 'Wali Kelas / Guru Mapel';
            } else {
                roleText = subjectText ? `Guru Mapel - ${subjectText}` : 'Guru Mapel';
            }
        }
        document.getElementById('sidebar-user-role').textContent = roleText;
        
        document.getElementById('sidebar-avatar').textContent = user.name.charAt(0).toUpperCase();

        // Close mobile sidebar on route change
        document.getElementById('sidebar').classList.remove('open');

        // Route matching
        const pageId = hash.replace('#', 'page-');
        const targetPage = document.getElementById(pageId);
        
        if (targetPage) {
            targetPage.classList.add('active');
            App.updateSidebarActive(hash);
            
            // Show loading placeholder if available, or just proceed
            App.dispatchPageLogic(hash, user);
        } else {
            // 404 fallback
            window.location.hash = user.role === 'admin' ? '#admin-dashboard' : '#teacher-dashboard';
        }
    },

    renderSidebar: (user) => {
        const nav = document.getElementById('sidebar-nav');
        let html = '';

        if (user.role === 'admin') {
            html += `
                <a href="#admin-dashboard" class="nav-item"><i data-lucide="layout-dashboard"></i> <span>Dashboard Admin</span></a>
                
                <div class="sidebar-dropdown" id="dropdown-manajemen-pengguna">
                    <div class="nav-item dropdown-toggle" onclick="App.toggleDropdown('dropdown-manajemen-pengguna')">
                        <div style="display: flex; align-items: center; gap: 0.875rem;">
                            <i data-lucide="users-2"></i> <span>Manajemen Pengguna</span>
                        </div>
                        <i data-lucide="chevron-down" class="dropdown-chevron"></i>
                    </div>
                    <div class="dropdown-menu">
                        <a href="#admin-guru" class="nav-item sub-item"><i data-lucide="users"></i> <span>Guru</span></a>
                        <a href="#admin-siswa" class="nav-item sub-item"><i data-lucide="graduation-cap"></i> <span>Siswa</span></a>
                    </div>
                </div>

                <a href="#admin-kelas" class="nav-item"><i data-lucide="school"></i> <span>Manajemen Kelas</span></a>
                <a href="#jadwal-mengajar" class="nav-item"><i data-lucide="clock"></i> <span>Jadwal Mengajar</span></a>
                <a href="#calendar" class="nav-item"><i data-lucide="calendar"></i> <span>Kalender Absensi</span></a>
                <a href="#rekap" class="nav-item"><i data-lucide="clipboard-list"></i> <span>Rekap Absensi</span></a>
                <a href="#grafik" class="nav-item"><i data-lucide="bar-chart-2"></i> <span>Grafik & Analitik</span></a>
                <a href="#pengaturan" class="nav-item"><i data-lucide="settings"></i> <span>Pengaturan</span></a>
            `;
        } else {
            html += `
                <a href="#teacher-dashboard" class="nav-item"><i data-lucide="layout-dashboard"></i> <span>Dashboard</span></a>
            `;
            
            if (user.isWaliKelas) {
                html += `
                    <a href="#absensi-wali" class="nav-item">
                        <i data-lucide="sun" class="text-emerald"></i> 
                        <span>Absensi Wali Kelas</span>
                    </a>
                `;
            }
            
            html += `
                <a href="#absensi-mapel" class="nav-item">
                    <i data-lucide="book-open" class="text-indigo"></i> 
                    <span>Absensi Mapel</span>
                </a>
                <a href="#jadwal-mengajar" class="nav-item"><i data-lucide="clock"></i> <span>Jadwal Mengajar</span></a>
                <a href="#rekap" class="nav-item"><i data-lucide="clipboard-list"></i> <span>Rekap Absensi</span></a>
                <a href="#grafik" class="nav-item"><i data-lucide="bar-chart-2"></i> <span>Grafik Kehadiran</span></a>
                <a href="#calendar" class="nav-item"><i data-lucide="calendar"></i> <span>Kalender Absensi</span></a>
            `;
        }
        
        nav.innerHTML = html;
        if(window.lucide) lucide.createIcons();
    },

    toggleDropdown: (id) => {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.classList.toggle('open');
        }
    },

    updateSidebarActive: (hash) => {
        // Remove active from all nav items
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('href') === hash) {
                el.classList.add('active');
                
                // If it is a sub-item, auto-open the parent dropdown
                const parentDropdown = el.closest('.sidebar-dropdown');
                if (parentDropdown) {
                    parentDropdown.classList.add('open');
                }
            }
        });
    },

    dispatchPageLogic: async (hash, user) => {
        // Update Title
        const titles = {
            '#admin-dashboard': 'Dashboard Admin',
            '#teacher-dashboard': 'Dashboard Guru',
            '#absensi-wali': 'Input Absensi Wali Kelas (Harian)',
            '#absensi-mapel': 'Input Absensi Guru Mapel (Per Sesi)',
            '#rekap': 'Rekapitulasi Kehadiran',
            '#grafik': 'Grafik & Analitik',
            '#calendar': 'Kalender Absensi',
            '#jadwal-mengajar': 'Jadwal Mengajar',
            '#admin-guru': 'Manajemen Guru',
            '#admin-kelas': 'Manajemen Kelas',
            '#admin-siswa': 'Manajemen Siswa'
        };
        const pageTitle = titles[hash] || 'SI-AKTIF';
        document.getElementById('page-title').textContent = pageTitle;
        const bc = document.getElementById('breadcrumb-current');
        if (bc) bc.textContent = pageTitle;

        // Call specific modules based on route
        if (hash === '#admin-dashboard') {
            if(window.Admin) await window.Admin.renderDashboard();
        } else if (hash === '#teacher-dashboard') {
            if(window.Teacher) await window.Teacher.renderDashboard(user);
        } else if (hash === '#absensi-wali') {
            if(window.Teacher) await window.Teacher.renderAbsensiWali(user);
        } else if (hash === '#absensi-mapel') {
            if(window.Teacher) await window.Teacher.renderAbsensiMapel(user);
        } else if (hash === '#rekap') {
            if(window.Teacher) await window.Teacher.renderRekap(user);
        } else if (hash === '#grafik') {
            if(window.ChartsObj) await window.ChartsObj.renderGrafik(user);
        } else if (hash === '#calendar') {
            if(window.Calendar) await window.Calendar.renderCalendar(user);
        } else if (hash === '#jadwal-mengajar') {
            if(window.Jadwal) await window.Jadwal.renderJadwal(user);
        } else if (hash.startsWith('#admin-')) {
             if(window.Admin) {
                 if (hash === '#admin-guru') await window.Admin.renderManajemenGuru();
                 else if (hash === '#admin-kelas') await window.Admin.renderManajemenKelas();
                 else if (hash === '#admin-siswa') await window.Admin.renderManajemenSiswa();
                 else window.Admin.renderPlaceholder(hash);
             }
        }
    },

    initDatePicker: () => {
        const picker = document.getElementById('global-date-picker');
        if (picker) {
            picker.innerHTML = '';
            
            const today = new Date();
            const dayOfWeek = today.getDay(); 
            const monday = new Date(today);
            monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            
            let html = '';
            for(let i=0; i<6; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const val = `${yyyy}-${mm}-${dd}`;
                
                const text = d.toLocaleDateString('id-ID', options);
                const isSelected = (d.toDateString() === today.toDateString()) ? 'selected' : '';
                
                html += `<option value="${val}" ${isSelected}>${text}</option>`;
            }
            
            picker.innerHTML = html;

            if(picker.value) {
                App.simulatedDate = new Date(picker.value);
            } else {
                App.simulatedDate = today;
            }

            picker.addEventListener('change', (e) => {
                if (e.target.value) {
                    App.simulatedDate = new Date(e.target.value);
                    const user = window.Auth.getCurrentUser();
                    App.dispatchPageLogic(window.location.hash || '#login', user);
                }
            });
        }
    },

    showToast: (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'alert-circle';
        if (type === 'warning') icon = 'alert-triangle';

        toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        if(window.lucide) lucide.createIcons({root: toast});

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    toggleDropdown: (dropdownId) => {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;
        
        // Close other dropdowns first
        document.querySelectorAll('.sidebar-dropdown.open').forEach(d => {
            if (d.id !== dropdownId) d.classList.remove('open');
        });

        dropdown.classList.toggle('open');
    }
};

// Start App when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
