/**
 * SI-AKTIF Admin Logic
 */

window.Admin = {
    renderDashboard: async () => {
        const container = document.getElementById('page-admin-dashboard');
        
        const classes = await window.DB.getClasses();
        const students = await window.DB.getStudents();
        const allUsers = await window.DB.getUsers();
        const users = allUsers.filter(u => u.role !== 'admin');
        const dailyAtt = await window.DB.getAttendanceDaily();

        // Calculate today's attendance average
        const today = new Date().toISOString().split('T')[0];
        const todaysRecords = dailyAtt.filter(d => d.date === today);
        let totalHadir = 0;
        let totalTerlambat = 0;
        let totalAbsen = 0;
        
        if (todaysRecords.length > 0) {
            todaysRecords.forEach(record => {
                totalHadir += record.records.filter(r => r.status === 'hadir').length;
                totalAbsen += record.records.filter(r => r.status === 'alfa' || r.status === 'sakit' || r.status === 'izin').length;
            });
        } else {
            // Simulated fallback values
            totalHadir = Math.round(students.length * 0.94);
            totalTerlambat = 12;
            totalAbsen = students.length - totalHadir - totalTerlambat;
        }

        let html = `
            <!-- Time filters and control row -->
            <div class="d-flex justify-between align-center" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div class="d-flex gap-2" style="background: white; border: 1px solid var(--color-border); border-radius: 99px; padding: 0.25rem;">
                    <button class="btn btn-outline active-pill" style="border: none; border-radius: 99px; padding: 0.35rem 1.25rem; font-size: 0.75rem; background: var(--color-primary); color: white; font-weight: 700;">Years</button>
                    <button class="btn btn-outline" style="border: none; border-radius: 99px; padding: 0.35rem 1.25rem; font-size: 0.75rem; color: var(--color-text-light); font-weight: 600;">Month</button>
                    <button class="btn btn-outline" style="border: none; border-radius: 99px; padding: 0.35rem 1.25rem; font-size: 0.75rem; color: var(--color-text-light); font-weight: 600;">Week</button>
                    <button class="btn btn-outline" style="border: none; border-radius: 99px; padding: 0.35rem 1.25rem; font-size: 0.75rem; color: var(--color-text-light); font-weight: 600;">Day</button>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline" style="border-radius: 10px; font-weight: 600; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem; background: white;"><i data-lucide="calendar" style="width:16px;"></i> Select Dates</button>
                    <button class="btn btn-outline" style="border-radius: 10px; font-weight: 600; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem; background: white;"><i data-lucide="filter" style="width:16px;"></i> Filter</button>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-card-icon green">
                            <i data-lucide="check-circle" style="width: 20px; height: 20px;"></i>
                        </div>
                        <i data-lucide="more-vertical" style="color: var(--color-text-lighter); width: 18px; cursor: pointer;"></i>
                    </div>
                    <div class="stat-card-title">On Time (Siswa Hadir)</div>
                    <div class="stat-card-value">${totalHadir} <span style="font-size: 0.875rem; font-weight: 500; color: var(--color-text-light);">Siswa</span></div>
                    <div class="stat-card-trend up">
                        <span>12% <i data-lucide="arrow-up" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i></span> compared to last week
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-card-icon blue">
                            <i data-lucide="clock" style="width: 20px; height: 20px;"></i>
                        </div>
                        <i data-lucide="more-vertical" style="color: var(--color-text-lighter); width: 18px; cursor: pointer;"></i>
                    </div>
                    <div class="stat-card-title">Late (Siswa Terlambat)</div>
                    <div class="stat-card-value">${totalTerlambat} <span style="font-size: 0.875rem; font-weight: 500; color: var(--color-text-light);">Siswa</span></div>
                    <div class="stat-card-trend up" style="color: var(--color-terlambat);">
                        <span style="background: rgba(249, 115, 22, 0.08); color: var(--color-terlambat);">2% <i data-lucide="arrow-up" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i></span> compared to last week
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-card-icon red">
                            <i data-lucide="user-x" style="width: 20px; height: 20px;"></i>
                        </div>
                        <i data-lucide="more-vertical" style="color: var(--color-text-lighter); width: 18px; cursor: pointer;"></i>
                    </div>
                    <div class="stat-card-title">Absent (Siswa Tidak Hadir)</div>
                    <div class="stat-card-value">${totalAbsen} <span style="font-size: 0.875rem; font-weight: 500; color: var(--color-text-light);">Siswa</span></div>
                    <div class="stat-card-trend down">
                        <span>5% <i data-lucide="arrow-down" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i></span> compared to last week
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid Row 2 (Chart + Attendance list) -->
            <div class="dashboard-grid" style="margin-bottom: 2rem;">
                <!-- Left: Attendance Status Chart -->
                <div class="card" style="display: flex; flex-direction: column;">
                    <div class="d-flex justify-between align-center" style="margin-bottom: 1.5rem;">
                        <h3 class="font-heading" style="font-size: 1.15rem; margin: 0;">Attendance Status</h3>
                        <div style="display: flex; gap: 1rem; font-size: 0.75rem; font-weight: 600; color: var(--color-text-light);">
                            <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); display: inline-block;"></span> On time</span>
                            <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary-light); display: inline-block;"></span> Late</span>
                            <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; display: inline-block;"></span> Absent</span>
                        </div>
                    </div>
                    <div class="chart-container" style="flex: 1; min-height: 250px;">
                        <canvas id="adminTrendChart"></canvas>
                    </div>
                </div>

                <!-- Right: Attendance log of teachers -->
                <div class="card" style="display: flex; flex-direction: column;">
                    <div class="d-flex justify-between align-center" style="margin-bottom: 1rem;">
                        <h3 class="font-heading" style="font-size: 1.15rem; margin: 0;">Attendance Log</h3>
                        <a href="#rekap" style="font-size: 0.875rem; font-weight: 600;">See all</a>
                    </div>
                    <div style="display: flex; gap: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.75rem; margin-bottom: 1rem; font-size: 0.875rem; font-weight: 600; color: var(--color-text-light);">
                        <span style="color: var(--color-primary); border-bottom: 2px solid var(--color-primary); padding-bottom: 0.75rem; cursor: pointer;">Guru Absen</span>
                        <span style="cursor: pointer;">Siswa</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; max-height: 280px; padding-right: 0.25rem;">
                        ${users.slice(0, 6).map((u, i) => {
                            const statuses = ['On time', 'Late', 'On time', 'On time', 'Late', 'On time'];
                            const isLate = statuses[i] === 'Late';
                            const times = ['06:45 AM', '07:15 AM', '06:50 AM', '06:30 AM', '07:22 AM', '06:55 AM'];
                            return `
                                <div class="d-flex align-center justify-between" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; font-size: 0.875rem;">
                                    <div class="d-flex align-center gap-4">
                                        <div class="avatar" style="width: 36px; height: 36px; font-size: 0.875rem; background: ${isLate ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #3b82f6, #0061ff)'};">${u.name.charAt(0)}</div>
                                        <div>
                                            <div style="font-weight: 700; color: var(--color-navy);">${u.name}</div>
                                            <div style="font-size: 0.75rem; color: var(--color-text-light);">${u.subjects[0] || 'Guru Mapel'} | Kelas ${u.waliKelasId || 'Mapel'}</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <span class="status-badge ${isLate ? 'status-terlambat' : 'status-izin'}" style="font-size: 0.7rem; padding: 0.125rem 0.5rem; margin-bottom: 0.25rem;">${statuses[i]}</span>
                                        <div style="font-size: 0.75rem; color: var(--color-text-lighter); font-weight: 500;">Clock In - ${times[i]}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid Row 3 (Department / Kelas overview) -->
            <div class="card" style="margin-bottom: 1.5rem;">
                <div class="d-flex justify-between align-center" style="margin-bottom: 1.5rem;">
                    <h3 class="font-heading" style="font-size: 1.15rem; margin: 0;">Department Overview</h3>
                    <div style="font-size: 0.875rem; color: var(--color-text-light); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; background: var(--color-bg); padding: 0.25rem 0.75rem; border-radius: 8px; border: 1px solid var(--color-border);">
                        <i data-lucide="calendar" style="width: 14px; color: var(--color-primary);"></i> 12 June, 2026
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
                    ${classes.slice(0, 8).map(c => {
                        const totalStudents = students.filter(s => s.classId === c.id).length;
                        const hadir = Math.round(totalStudents * 0.93);
                        const absen = totalStudents - hadir;
                        return `
                            <div style="background: #f8fafc; border: 1px solid var(--color-border); border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; margin-bottom: 0.25rem;">${c.name}</div>
                                    <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-navy); font-family: var(--font-heading);">${totalStudents} <span style="font-size: 0.75rem; font-weight: 500; color: var(--color-text-light);">Siswa</span></div>
                                </div>
                                <div class="text-right" style="font-size: 0.725rem; font-weight: 600; color: var(--color-text-light); line-height: 1.4;">
                                    <div>On Time <span style="color: var(--color-hadir); margin-left: 0.5rem; font-weight: 700;">${hadir}</span></div>
                                    <div>Late <span style="color: var(--color-terlambat); margin-left: 0.5rem; font-weight: 700;">0</span></div>
                                    <div>Absent <span style="color: var(--color-alfa); margin-left: 0.5rem; font-weight: 700;">${absen}</span></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        if (window.lucide) lucide.createIcons({ root: container });

        // Initialize Bar Chart for Admin
        const ctx = document.getElementById('adminTrendChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 Jun', '2 Jun', '3 Jun', '4 Jun', '5 Jun', '6 Jun', '7 Jun'],
                datasets: [
                    {
                        label: 'On time',
                        data: [92, 94, 91, 95, 93, 89, 94],
                        backgroundColor: '#0061ff',
                        borderRadius: 4,
                        barPercentage: 0.45,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Late',
                        data: [5, 4, 6, 3, 5, 8, 4],
                        backgroundColor: '#3b82f6',
                        borderRadius: 4,
                        barPercentage: 0.45,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Absent',
                        data: [3, 2, 3, 2, 2, 3, 2],
                        backgroundColor: '#e2e8f0',
                        borderRadius: 4,
                        barPercentage: 0.45,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { display: false, drawBorder: false },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 }, callback: v => v + '%' }
                    },
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
                    }
                },
                plugins: {
                    legend: { display: false } // Custom legend is already drawn in HTML header
                }
            }
        });
    },

    /**
     * Delegate to modular TeacherTable component.
     */
    renderManajemenGuru: async () => {
        const container = document.getElementById('page-admin-guru');
        if (!container) return;
        await window.TeacherTable.render(container);
    },

    /**
     * Delegate to modular StudentTable component.
     */
    renderManajemenSiswa: async () => {
        const container = document.getElementById('page-admin-siswa');
        if (!container) return;
        await window.StudentTable.render(container);
    },

    renderManajemenKelas: async () => {
        let container = document.getElementById('page-admin-kelas');
        if (!container) return;

        const classes = await window.DB.getClasses();
        const users = await window.DB.getUsers();
        
        let html = `
            <div class="card">
                <div class="d-flex justify-between align-center" style="margin-bottom: 1.5rem;">
                    <h2 class="font-heading">Manajemen Kelas</h2>
                    <button class="btn btn-primary" onclick="window.Admin.openKelasModal()"><i data-lucide="plus"></i> Tambah Kelas</button>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Nama Kelas</th>
                                <th>Tingkat</th>
                                <th>Tahun Ajaran</th>
                                <th>Wali Kelas</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${classes.map(c => {
                                const wali = users.find(u => u.waliKelasId === c.id);
                                return `
                                <tr>
                                    <td><strong>${c.name}</strong></td>
                                    <td>Kelas ${c.grade}</td>
                                    <td>${c.academicYear}</td>
                                    <td>${wali ? wali.name : '<span class="text-light">Belum diatur</span>'}</td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <button class="btn-icon" style="color: var(--color-primary)" title="Edit" onclick='window.Admin.openKelasModal(${JSON.stringify(c)})'><i data-lucide="edit-2"></i></button>
                                            <button class="btn-icon" style="color: var(--color-alfa)" title="Hapus" onclick='window.Admin.deleteItem("classes", "${c.id}")'><i data-lucide="trash-2"></i></button>
                                        </div>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;
        if (window.lucide) lucide.createIcons({ root: container });
    },

    openKelasModal: async (data = null) => {
        const modal = document.getElementById('crud-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const saveBtn = document.getElementById('modal-save-btn');

        const isEdit = data !== null;
        modal.style.display = 'flex';
        title.textContent = isEdit ? 'Edit Kelas' : 'Tambah Kelas';
        saveBtn.textContent = 'Simpan';
        saveBtn.disabled = false;

        body.innerHTML = `
            <input type="hidden" id="form-kelas-id" value="${isEdit ? data.id : ''}">
            <div class="form-group">
                <label>ID / Kode Kelas (misal: X-1)</label>
                <input type="text" id="form-kelas-kode" class="form-control" style="border-radius:10px;" value="${isEdit ? data.id : ''}" ${isEdit ? 'readonly' : ''}>
            </div>
            <div class="form-group">
                <label>Nama Kelas</label>
                <input type="text" id="form-kelas-name" class="form-control" style="border-radius:10px;" value="${isEdit ? data.name : ''}">
            </div>
            <div class="form-group">
                <label>Tingkat</label>
                <select id="form-kelas-grade" class="form-control" style="border-radius:10px;">
                    <option value="10" ${isEdit && data.grade == 10 ? 'selected' : ''}>10 (X)</option>
                    <option value="11" ${isEdit && data.grade == 11 ? 'selected' : ''}>11 (XI)</option>
                    <option value="12" ${isEdit && data.grade == 12 ? 'selected' : ''}>12 (XII)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Tahun Ajaran</label>
                <input type="text" id="form-kelas-year" class="form-control" style="border-radius:10px;" value="${isEdit ? data.academicYear : '2025/2026'}">
            </div>
        `;

        saveBtn.onclick = async () => {
            const record = {
                id: isEdit ? data.id : document.getElementById('form-kelas-kode').value,
                isEdit: isEdit,
                name: document.getElementById('form-kelas-name').value,
                grade: parseInt(document.getElementById('form-kelas-grade').value),
                academicYear: document.getElementById('form-kelas-year').value
            };
            await window.DB.saveClass(record);
            modal.style.display = 'none';
            window.Admin.renderManajemenKelas();
        };
    },

    /**
     * Render a placeholder page for unimplemented features.
     */
    renderPlaceholder: (hash) => {
        const name = hash.replace('#admin-', '').replace(/-/g, ' ');
        const container = document.getElementById(`page-${hash.slice(1)}`);
        if (!container) return;
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 4rem 2rem;">
                <i data-lucide="construction" style="width: 48px; height: 48px; color: var(--color-text-lighter); margin: 0 auto 1rem; display: block;"></i>
                <h3 class="font-heading" style="margin-bottom: 0.5rem;">Halaman ${name}</h3>
                <p style="color: var(--color-text-light);">Fitur ini masih dalam tahap pengembangan.</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons({ root: container });
    },

    /**
     * Custom delete confirmation modal.
     */
    confirmDelete: (message, onConfirm) => {
        const modal = document.getElementById('delete-confirm-modal');
        const msgEl = document.getElementById('delete-confirm-message');
        const confirmBtn = document.getElementById('delete-confirm-btn');
        const cancelBtn = document.getElementById('delete-cancel-btn');

        if (!modal) {
            if (confirm(message)) onConfirm();
            return;
        }

        msgEl.textContent = message;
        modal.style.display = 'flex';

        // Clone buttons to clear old listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        newConfirmBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            onConfirm();
        });

        newCancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    },

    /**
     * Delete an item with confirmation (for legacy kelas management).
     */
    deleteItem: async (type, id) => {
        let name = '';
        if (type === 'classes') {
            const allClasses = await window.DB.getClasses();
            const c = allClasses.find(cls => cls.id === id);
            name = c ? c.name : 'kelas';
        }

        const msg = `Apakah Anda yakin ingin menghapus data [${name}]? Data yang dihapus tidak dapat dikembalikan.`;
        
        window.Admin.confirmDelete(msg, async () => {
            if (type === 'classes') {
                await window.DB.deleteClass(id);
                window.Admin.renderManajemenKelas();
            }
        });
    }
};
