/**
 * SI-AKTIF Main Application & SPA Router
 */

const App = {
    simulatedDate: new Date(),

    exportToCSV: (filename, headers, rows) => {
        let csvContent = "";
        csvContent += "\uFEFF"; // UTF-8 BOM
        csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";
        
        rows.forEach(row => {
            csvContent += row.map(cell => {
                const str = String(cell === null || cell === undefined ? "" : cell);
                return `"${str.replace(/"/g, '""')}"`;
            }).join(",") + "\r\n";
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    exportToExcel: (filename, title, headers, rows) => {
        // Prepare data array
        const wsData = [
            [title],
            [],
            headers,
            ...rows
        ];
        
        // Create workbook and sheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Add merging for the title row to center it across columns
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
        ];
        
        // Set column widths dynamically
        const colWidths = headers.map((h, i) => {
            let maxLen = h.length;
            rows.forEach(r => {
                const val = String(r[i] || '');
                if (val.length > maxLen) maxLen = val.length;
            });
            return { wch: maxLen + 3 };
        });
        ws['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Absensi");
        
        // Write native .xlsx file
        XLSX.writeFile(wb, `${filename}.xlsx`);
    },

    exportToWord: (filename, title, headers, rows) => {
        // Office Open XML Word document envelope to preserve layouts and open cleanly
        let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">';
        html += '<head><meta charset="utf-8">';
        html += '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->';
        html += '<style>';
        html += 'body { font-family: "Arial", sans-serif; margin: 2in 1.5in 2in 1.5in; color: #1e293b; }';
        html += 'h2 { text-align: center; color: #0f172a; font-family: "Arial", sans-serif; margin-bottom: 5px; font-size: 18pt; }';
        html += '.subtitle { text-align: center; color: #64748b; font-size: 10pt; margin-bottom: 25px; }';
        html += 'table { width: 100%; border-collapse: collapse; margin-top: 15px; }';
        html += 'th, td { border: 1px solid #cbd5e1; padding: 10px; font-size: 10pt; text-align: left; }';
        html += 'th { background-color: #f8fafc; color: #0f172a; font-weight: bold; }';
        html += 'tr { page-break-inside: avoid; }';
        html += '</style></head><body>';
        
        html += `<h2>${title}</h2>`;
        html += '<div class="subtitle">SMAN 47 Jakarta - Sistem Absensi SI-AKTIF</div>';
        html += '<table><thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';
        rows.forEach(r => {
            html += '<tr>';
            r.forEach(c => html += `<td>${c}</td>`);
            html += '</tr>';
        });
        html += '</tbody></table></body></html>';

        // Blob with correct Word Application mime type
        const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.doc`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    exportToPDF: (title, headers, rows) => {
        const printWindow = window.open('', '_blank');
        let html = `
            <html>
            <head>
                <meta charset="utf-8">
                <title>${title}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 2rem; color: #1e293b; }
                    h2 { text-align: center; font-family: 'Outfit', sans-serif; margin-bottom: 0.5rem; }
                    .subtitle { text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; }
                    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 0.875rem; }
                    th { background-color: #f8fafc; font-weight: bold; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <h2>${title}</h2>
                <div class="subtitle">SMAN 47 Jakarta - Sistem Absensi SI-AKTIF</div>
                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => `
                            <tr>
                                ${r.map(c => `<td>${c}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    },

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

        // Global Export Button
        const btnExport = document.getElementById('btn-global-export');
        if (btnExport) {
            btnExport.addEventListener('click', async () => {
                const hash = window.location.hash || '#login';
                
                if (hash === '#login') {
                    window.App.showToast('Silakan login terlebih dahulu', 'warning');
                    return;
                }
                
                let exportData = null;
                const pageTitle = document.getElementById('page-title').textContent.trim();
                const dateNow = new Date().toISOString().split('T')[0];
                
                // 1. Special handler for Calendar
                if (hash === '#calendar') {
                    if (!window.Calendar || !window.Calendar.selectedDate) {
                        window.App.showToast('Data kalender belum siap', 'warning');
                        return;
                    }
                    const dateStr = window.Calendar.selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    const dateISO = window.Calendar.selectedDate.toISOString().split('T')[0];
                    const items = document.querySelectorAll('.calendar-event-item');
                    if (items.length === 0) {
                        window.App.showToast('Tidak ada data absensi untuk diexport pada tanggal ini', 'warning');
                        return;
                    }
                    
                    const headers = ['No.', 'Tanggal', 'Jenis Absensi', 'Kelas', 'Guru/Wali Kelas', 'Informasi Tambahan'];
                    const rows = Array.from(items).map((item, idx) => {
                        const type = item.querySelector('h4').textContent.trim();
                        const pTags = Array.from(item.querySelectorAll('p')).map(p => p.textContent.trim());
                        let cls = "", teacher = "", info = "";
                        pTags.forEach(txt => {
                            if (txt.startsWith("Kelas:")) cls = txt.replace("Kelas:", "").trim();
                            else if (txt.startsWith("Oleh Guru:")) teacher = txt.replace("Oleh Guru:", "").trim();
                            else info += txt + " ";
                        });
                        return [idx + 1, dateStr, type, cls, teacher, info.trim()];
                    });
                    
                    exportData = {
                        filename: `SMAN47_Kalender_Absensi_${dateISO}`,
                        title: `Laporan Kalender Absensi SMAN 47 Jakarta - ${dateStr}`,
                        headers,
                        rows
                    };
                }
                
                // 2. Special handler for Grafik/Charts
                else if (hash === '#grafik') {
                    const studentSelect = document.getElementById('chart-student');
                    if (!studentSelect || !studentSelect.value) {
                        window.App.showToast('Pilih siswa terlebih dahulu untuk mengexport data', 'warning');
                        return;
                    }
                    const studentName = studentSelect.options[studentSelect.selectedIndex].text;
                    const classId = document.getElementById('chart-class').value;
                    const studentId = studentSelect.value;
                    
                    const allDaily = await window.DB.getAttendanceDaily();
                    const dailyData = allDaily.filter(d => d.classId === classId);
                    
                    const allMapel = await window.DB.getAttendanceSubject();
                    const mapelData = allMapel.filter(d => d.classId === classId);
                    
                    const dates = Array.from(new Set([...dailyData.map(d => d.date), ...mapelData.map(d => d.date)])).sort();
                    
                    const headers = ['No.', 'Tanggal', 'Absensi Harian (Wali Kelas)', 'Absensi Mapel (Guru)'];
                    const rows = dates.map((date, idx) => {
                        const dRecord = dailyData.find(d => d.date === date);
                        const mRecord = mapelData.filter(d => d.date === date);
                        
                        let dailyStatus = 'BELUM DIABSEN';
                        if (dRecord) {
                            const r = dRecord.records.find(rec => rec.studentId === studentId);
                            if (r) dailyStatus = r.status.toUpperCase();
                        }
                        
                        let mapelStatus = 'BELUM DIABSEN';
                        if (mRecord.length > 0) {
                            const statuses = [];
                            mRecord.forEach(m => {
                                const r = m.records.find(rec => rec.studentId === studentId);
                                if (r) statuses.push(`${m.subject} (${r.status.toUpperCase()})`);
                            });
                            if (statuses.length > 0) mapelStatus = statuses.join('; ');
                        }
                        
                        return [idx + 1, date, dailyStatus, mapelStatus];
                    });
                    
                    const cleanStudentName = studentName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
                    exportData = {
                        filename: `SMAN47_Tren_Kehadiran_${classId}_${cleanStudentName}`,
                        title: `Laporan Tren Kehadiran Siswa: ${studentName} - Kelas ${classId}`,
                        headers,
                        rows
                    };
                }
                
                // 3. Rekap handler — detect active tab and class
                else if (hash === '#rekap') {
                    const activePage = document.querySelector('.page.active');
                    if (!activePage) { window.App.showToast('Halaman belum siap', 'warning'); return; }

                    const activeTab = activePage.querySelector('.tab-content.active');
                    const isMapel = activeTab && activeTab.id === 'tab-mapel';
                    const tabLabel = isMapel ? 'Mapel' : 'Harian';
                    
                    // Get class from the active tab's select
                    const selectId = isMapel ? 'rekap-kelas-mapel' : 'rekap-kelas-harian';
                    const classSelect = document.getElementById(selectId);
                    const classId = classSelect ? classSelect.value : '';
                    
                    const table = activeTab ? activeTab.querySelector('table') : activePage.querySelector('table');
                    if (table) {
                        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
                        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
                            return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n/g, ' '));
                        });
                        
                        exportData = {
                            filename: `SMAN47_Rekap_${tabLabel}_Kelas_${classId}_${dateNow}`,
                            title: `Rekapitulasi Kehadiran ${tabLabel} - Kelas ${classId} - SMAN 47 Jakarta`,
                            headers,
                            rows
                        };
                    }
                }
                
                // 4. Generic handler for other pages with tables
                else {
                    const activePage = document.querySelector('.page.active');
                    if (activePage) {
                        let table = activePage.querySelector('.tab-content.active table');
                        if (!table) table = activePage.querySelector('table');
                        
                        if (table) {
                            const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
                            const actionColIdx = headers.findIndex(h => h.toLowerCase() === 'aksi' || h.toLowerCase() === 'action');
                            
                            const cleanHeaders = actionColIdx !== -1 ? headers.filter((_, idx) => idx !== actionColIdx) : headers;
                            
                            const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
                                const cells = Array.from(tr.querySelectorAll('td'));
                                const cleanCells = actionColIdx !== -1 ? cells.filter((_, idx) => idx !== actionColIdx) : cells;
                                return cleanCells.map(td => td.innerText.trim().replace(/\n/g, ' '));
                            });
                            
                            const cleanTitle = pageTitle.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_&]/g, '');
                            exportData = {
                                filename: `SMAN47_${cleanTitle}_${dateNow}`,
                                title: `${pageTitle} - SMAN 47 Jakarta`,
                                headers: cleanHeaders,
                                rows
                            };
                        }
                    }
                }
                
                if (exportData) {
                    window.App.tempExportData = exportData;
                    document.getElementById('export-format-modal').style.display = 'flex';
                    if (window.lucide) lucide.createIcons({ root: document.getElementById('export-format-modal') });
                } else {
                    window.App.showToast('Tidak ada data tabel/konten yang dapat diexport di halaman ini', 'info');
                }
            });
        }

        // Export Modal Format Button Handlers
        const btnExcel = document.getElementById('export-btn-excel');
        if (btnExcel) {
            btnExcel.addEventListener('click', () => {
                const data = window.App.tempExportData;
                if (data) {
                    window.App.exportToExcel(data.filename, data.title, data.headers, data.rows);
                    window.App.showToast('Berhasil diexport ke Excel', 'success');
                }
                document.getElementById('export-format-modal').style.display = 'none';
            });
        }

        const btnWord = document.getElementById('export-btn-word');
        if (btnWord) {
            btnWord.addEventListener('click', () => {
                const data = window.App.tempExportData;
                if (data) {
                    window.App.exportToWord(data.filename, data.title, data.headers, data.rows);
                    window.App.showToast('Berhasil diexport ke Word', 'success');
                }
                document.getElementById('export-format-modal').style.display = 'none';
            });
        }

        const btnPDF = document.getElementById('export-btn-pdf');
        if (btnPDF) {
            btnPDF.addEventListener('click', () => {
                const data = window.App.tempExportData;
                if (data) {
                    window.App.exportToPDF(data.title, data.headers, data.rows);
                    window.App.showToast('Membuka dialog cetak PDF', 'success');
                }
                document.getElementById('export-format-modal').style.display = 'none';
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

// Expose App globally
window.App = App;

// Start App when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);

