/**
 * SI-AKTIF Teacher & Wali Kelas Logic
 */

window.Teacher = {
    // Current attendance state
    currentAttendanceData: {},

    renderDashboard: async (user) => {
        const container = document.getElementById('page-teacher-dashboard');
        
        // Use simulated date from the global picker
        const dateObj = window.App.simulatedDate || new Date();
        const todayStr = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'][dateObj.getDay()];
        
        const schedule = await window.DB.getSchedule();
        
        // Find schedules where this teacher teaches today
        const myScheduleToday = schedule.filter(s => s.day === todayStr)
            .flatMap(s => (s.slots || []).map(slot => ({ classId: s.classId, ...slot })))
            .filter(slot => {
                if (!slot.teacherId) return false;
                if (slot.teacherId === user.id) return true;
                if (user.kodeGuru && slot.teacherId === user.kodeGuru) return true;

                // Support for combined teacher codes
                const combinedCodes = {
                    'A3': ['A3', 'Pn3'], 'Pn3': ['A3', 'Pn3'],
                    'K2': ['K2', 'Pw1'], 'Pw1': ['K2', 'Pw1'],
                    'Pw2': ['Pw2', 'Bi3'], 'Bi3': ['Pw2', 'Bi3'],
                    'E3': ['E3', 'Pw3'], 'Pw3': ['E3', 'Pw3'],
                    'F3': ['F3', 'Sj3'], 'Sj3': ['F3', 'Sj3'],
                    'F4': ['F4', 'Sj4'], 'Sj4': ['F4', 'Sj4'],
                    'S2': ['S2', 'Sj5'], 'Sj5': ['S2', 'Sj5'],
                    'Bg2': ['Bg2', 'Bi4'], 'Bi4': ['Bg2', 'Bi4']
                };

                const myCodes = combinedCodes[user.kodeGuru] || [user.kodeGuru];
                if (myCodes.includes(slot.teacherId)) return true;

                return false;
            })
            .sort((a, b) => a.jamKe - b.jamKe);

        let html = `
            <div class="dashboard-grid">
                <div class="main-column" style="display: flex; flex-direction: column; gap: 1.5rem;">
        `;

        if (user.isWaliKelas) {
            const classes = await window.DB.getClasses();
            const myClass = classes.find(c => c.id === user.waliKelasId);
            html += `
                <div class="card" style="background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary)); color: white; border: none; padding: 2rem;">
                    <div class="d-flex justify-between align-center" style="margin-bottom: 1.5rem;">
                        <div>
                            <h2 style="color: white; margin-bottom: 0.35rem; font-size: 1.5rem;">Wali Kelas ${myClass?.name || user.waliKelasId}</h2>
                            <p style="opacity: 0.9; font-size: 0.875rem; font-weight: 500;">Tugas Harian Absensi Pagi Siswa</p>
                        </div>
                        <i data-lucide="sun" style="width: 44px; height: 44px; opacity: 0.9;"></i>
                    </div>
                    <button class="btn" style="background: white; color: var(--color-primary); font-weight: 700; border-radius: 10px; padding: 0.625rem 1.25rem; box-shadow: 0 4px 10px rgba(0,0,0,0.05);" onclick="window.location.hash='#absensi-wali'">
                        Input Absensi Pagi Hari Ini <i data-lucide="arrow-right" style="width:16px;"></i>
                    </button>
                </div>
            `;
        }

        html += `
                    <div class="card">
                        <div class="d-flex justify-between align-center" style="margin-bottom: 1.5rem;">
                            <h3 class="font-heading" style="font-size: 1.15rem; margin: 0;">Jadwal Mengajar Hari Ini</h3>
                            <span style="font-size: 0.75rem; color: var(--color-text-light); font-weight: 700; background: var(--color-bg); padding: 0.25rem 0.5rem; border-radius: 6px; text-transform: uppercase;">${todayStr}</span>
                        </div>
                        ${myScheduleToday.length === 0 ? `
                            <p class="text-light text-center" style="padding: 3rem 1rem; color: var(--color-text-lighter); font-size: 0.875rem;">Tidak ada jadwal mengajar hari ini.</p>
                        ` : `
                            <div class="schedule-list">
                                ${myScheduleToday.map(slot => `
                                    <div class="schedule-item">
                                        <div class="schedule-time">Jam ke-${slot.jamKe}<br><small style="color: var(--color-text-light); font-weight: 500;">${slot.time}</small></div>
                                        <div class="schedule-details">
                                            <div class="schedule-class">Kelas ${slot.classId}</div>
                                            <div class="schedule-subject" style="font-weight: 500;">${slot.subject}</div>
                                        </div>
                                        <button class="btn btn-indigo" style="border-radius: 10px; font-weight: 700;" onclick="window.location.hash='#absensi-mapel?class=${slot.classId}&jam=${slot.jamKe}&subject=${encodeURIComponent(slot.subject)}'">
                                            Absen
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
                
                <div class="side-column">
                    <div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
                        <h3 class="font-heading" style="font-size: 1.15rem; margin: 0;">Quick Actions</h3>
                        <div class="d-flex" style="flex-direction: column; gap: 0.75rem;">
                            <button class="btn btn-outline w-100" style="justify-content: flex-start; border-radius: 12px; padding: 0.75rem 1rem; font-weight: 600;" onclick="window.location.hash='#rekap'">
                                <i data-lucide="clipboard-list" style="color: var(--color-primary); width: 18px;"></i> Lihat Rekap Kelas
                            </button>
                            <button class="btn btn-outline w-100" style="justify-content: flex-start; border-radius: 12px; padding: 0.75rem 1rem; font-weight: 600;" onclick="window.location.hash='#grafik'">
                                <i data-lucide="bar-chart-2" style="color: #6366f1; width: 18px;"></i> Grafik Tren Kehadiran
                            </button>
                            <button class="btn btn-outline w-100" style="justify-content: flex-start; border-radius: 12px; padding: 0.75rem 1rem; font-weight: 600;" onclick="window.location.hash='#calendar'">
                                <i data-lucide="calendar" style="color: var(--color-hadir); width: 18px;"></i> Kalender Absensi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        if (window.lucide) lucide.createIcons({ root: container });
    },

    renderAbsensiWali: async (user) => {
        const container = document.getElementById('page-absensi-wali');
        const classId = user.waliKelasId;
        const students = await window.DB.getStudentsByClass(classId);
        
        // Initialize state
        window.Teacher.currentAttendanceData = {};
        students.forEach(s => {
            window.Teacher.currentAttendanceData[s.id] = 'belum';
        });

        const dateObj = window.App.simulatedDate || new Date();
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        let html = `
            <div class="card" style="margin-bottom: 1.5rem;">
                <div class="attendance-header">
                    <div>
                        <h2 class="font-heading" style="color: var(--color-emerald-dark); margin-bottom: 0.25rem;">Absensi Harian Kelas ${classId}</h2>
                        <span class="badge badge-wali">Absensi Wali Kelas</span>
                    </div>
                    <div class="attendance-filters">
                        <div class="form-group" style="margin: 0;">
                            <input type="date" class="form-control" value="${todayStr}" id="wali-date">
                        </div>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar" id="wali-progress" style="width: 0%"></div>
                </div>
                <div class="d-flex justify-between align-center" style="margin-bottom: 1rem;">
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.75rem; color: var(--color-text-light); align-items: center;">
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-hadir);color:white;display:flex;align-items:center;justify-content:center;"><i data-lucide="check" style="width:12px;height:12px;"></i></div> Hadir</span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-sakit);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">S</div> Sakit</span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-izin);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">I</div> Izin</span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-alfa);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">A</div> Alfa</span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-belum);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">?</div> Belum</span>
                    </div>
                    <span id="wali-progress-text" class="progress-text" style="margin-top: 0;">0 / ${students.length} Diabsen</span>
                </div>

                <div class="student-list" id="wali-student-list">
                    ${students.map(s => `
                        <div class="student-card" data-student-id="${s.id}" data-status="belum" onclick="window.Teacher.cycleStatus(this, false)">
                            <div class="student-info">
                                <span class="student-name">${s.name}</span>
                                <span class="student-nis">${s.nis}</span>
                            </div>
                            <div class="student-status">?</div>
                        </div>
                    `).join('')}
                </div>

                <div class="action-bar">
                    <button class="btn btn-primary" onclick="window.Teacher.saveWaliAttendance('${classId}')">
                        <i data-lucide="save"></i> Simpan Absensi Harian
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        if (window.lucide) lucide.createIcons({ root: container });
    },

    renderAbsensiMapel: async (user) => {
        const container = document.getElementById('page-absensi-mapel');
        
        // Check URL params for class/jam
        const hashParts = window.location.hash.split('?');
        const params = new URLSearchParams(hashParts[1] || '');
        const prefillClass = params.get('class') || '';
        const prefillJam = params.get('jam') || '';
        const prefillSubject = params.get('subject') || '';

        const dateObj = window.App.simulatedDate || new Date();
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        // Generate form HTML first
        let html = `
            <div class="card" style="margin-bottom: 1.5rem;">
                <div class="attendance-header">
                    <div>
                        <h2 class="font-heading" style="color: var(--color-indigo-dark); margin-bottom: 0.25rem;">Absensi Mata Pelajaran</h2>
                        <span class="badge badge-mapel">Guru Mapel</span>
                    </div>
                </div>
                
                <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 2rem;">
                    <div class="form-group">
                        <label>Kelas</label>
                        <select class="form-control" id="mapel-class" onchange="window.Teacher.loadMapelStudents()">
                            <option value="">-- Pilih Kelas --</option>
                            ${user.teachingClasses.map(c => `<option value="${c}" ${c === prefillClass ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Mata Pelajaran</label>
                        <select class="form-control" id="mapel-subject">
                            <option value="">-- Pilih Mapel --</option>
                            ${user.subjects.map(s => `<option value="${s}" ${s === prefillSubject || user.subjects.length === 1 ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Jam Ke-</label>
                        <select class="form-control" id="mapel-jam">
                            <option value="">-- Pilih Jam --</option>
                            ${[1,2,3,4,5,6,7,8].map(j => `<option value="${j}" ${j == prefillJam ? 'selected' : ''}>Jam ke-${j}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tanggal</label>
                        <input type="date" class="form-control" value="${todayStr}" id="mapel-date">
                    </div>
                </div>

                <div id="mapel-students-container" style="display: none;">
                    <div class="progress-container">
                        <div class="progress-bar" id="mapel-progress" style="background-color: var(--color-indigo); width: 0%"></div>
                    </div>
                    <div class="d-flex justify-between align-center" style="margin-bottom: 1rem;">
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.75rem; color: var(--color-text-light); align-items: center;">
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-hadir);color:white;display:flex;align-items:center;justify-content:center;"><i data-lucide="check" style="width:12px;height:12px;"></i></div> Hadir</span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-sakit);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">S</div> Sakit</span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-izin);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">I</div> Izin</span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-alfa);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">A</div> Alfa</span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-terlambat);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">T</div> Terlambat</span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width:20px;height:20px;border-radius:50%;background:var(--color-belum);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">?</div> Belum</span>
                    </div>
                    <span id="mapel-progress-text" class="progress-text" style="margin-top: 0;">0 / 0 Diabsen</span>
                </div>

                    <div class="student-list" id="mapel-student-list">
                        <!-- Rendered dynamically -->
                    </div>

                    <div class="action-bar">
                        <button class="btn btn-indigo" onclick="window.Teacher.saveMapelAttendance()">
                            <i data-lucide="save"></i> Simpan Absensi Mapel
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        if (window.lucide) lucide.createIcons({ root: container });

        // Load if params exist
        if (prefillClass) {
            await window.Teacher.loadMapelStudents();
        }
    },

    loadMapelStudents: async () => {
        const classId = document.getElementById('mapel-class').value;
        const container = document.getElementById('mapel-students-container');
        const list = document.getElementById('mapel-student-list');
        
        if (!classId) {
            container.style.display = 'none';
            return;
        }

        const students = await window.DB.getStudentsByClass(classId);
        
        window.Teacher.currentAttendanceData = {};
        students.forEach(s => {
            window.Teacher.currentAttendanceData[s.id] = 'belum';
        });

        list.innerHTML = students.map(s => `
            <div class="student-card" data-student-id="${s.id}" data-status="belum" onclick="window.Teacher.cycleStatus(this, true)">
                <div class="student-info">
                    <span class="student-name">${s.name}</span>
                    <span class="student-nis">${s.nis}</span>
                </div>
                <div class="student-status">?</div>
            </div>
        `).join('');

        document.getElementById('mapel-progress-text').textContent = `0 / ${students.length} Diabsen`;
        document.getElementById('mapel-progress').style.width = '0%';
        container.style.display = 'block';
    },

    cycleStatus: (element, isMapel = false) => {
        const currentStatus = element.getAttribute('data-status');
        const studentId = element.getAttribute('data-student-id');
        
        // Allowed statuses array
        let statuses;
        if (isMapel) {
            statuses = ['belum', 'hadir', 'sakit', 'izin', 'alfa', 'terlambat'];
        } else {
            statuses = ['belum', 'hadir', 'sakit', 'izin', 'alfa'];
        }

        const icons = {
            'belum': '?', 'hadir': '✓', 'sakit': 'S', 'izin': 'I', 'alfa': 'A', 'terlambat': 'T'
        };

        const currentIndex = statuses.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statuses.length;
        const nextStatus = statuses[nextIndex];

        // Update DOM
        element.setAttribute('data-status', nextStatus);
        element.querySelector('.student-status').textContent = icons[nextStatus];

        // Update State
        window.Teacher.currentAttendanceData[studentId] = nextStatus;

        // Update Progress
        const total = Object.keys(window.Teacher.currentAttendanceData).length;
        const filled = Object.values(window.Teacher.currentAttendanceData).filter(v => v !== 'belum').length;
        
        const progressId = isMapel ? 'mapel-progress' : 'wali-progress';
        const progressTextId = isMapel ? 'mapel-progress-text' : 'wali-progress-text';
        
        document.getElementById(progressId).style.width = `${(filled/total)*100}%`;
        document.getElementById(progressTextId).textContent = `${filled} / ${total} Diabsen`;
    },

    saveWaliAttendance: async (classId) => {
        const date = document.getElementById('wali-date').value;
        const user = window.Auth.getCurrentUser();
        
        // Check if any 'belum'
        const unassigned = Object.values(window.Teacher.currentAttendanceData).filter(v => v === 'belum').length;
        if (unassigned > 0) {
            if (!confirm(`Ada ${unassigned} siswa yang belum diabsen. Lanjutkan menyimpan?`)) return;
        }

        const records = Object.entries(window.Teacher.currentAttendanceData).map(([id, status]) => {
            return { studentId: id, status: status === 'belum' ? 'hadir' : status }; // default to hadir if skipped
        });

        const recordId = `ATD-${date}-${classId}`;
        await window.DB.saveAttendanceDaily({
            id: recordId,
            date: date,
            classId: classId,
            waliKelasId: user.id,
            type: 'wali_kelas',
            records: records
        });

        window.App.showToast('Absensi harian berhasil disimpan', 'success');
        window.location.hash = '#teacher-dashboard';
    },

    saveMapelAttendance: async () => {
        const classId = document.getElementById('mapel-class').value;
        const jamKe = document.getElementById('mapel-jam').value;
        const date = document.getElementById('mapel-date').value;
        const subject = document.getElementById('mapel-subject').value;
        const user = window.Auth.getCurrentUser();

        if (!classId || !jamKe || !date || !subject) {
            window.App.showToast('Harap lengkapi form', 'error');
            return;
        }

        const unassigned = Object.values(window.Teacher.currentAttendanceData).filter(v => v === 'belum').length;
        if (unassigned > 0) {
            if (!confirm(`Ada ${unassigned} siswa yang belum diabsen. Lanjutkan?`)) return;
        }

        const records = Object.entries(window.Teacher.currentAttendanceData).map(([id, status]) => {
            return { studentId: id, status: status === 'belum' ? 'hadir' : status };
        });

        const recordId = `ATS-${date}-${classId}-${user.id}-${jamKe}`;
        
        await window.DB.saveAttendanceSubject({
            id: recordId,
            date: date,
            classId: classId,
            teacherId: user.id,
            subject: subject,
            jamKe: parseInt(jamKe),
            type: 'guru_mapel',
            records: records
        });

        window.App.showToast('Absensi mata pelajaran berhasil disimpan', 'success');
        window.location.hash = '#teacher-dashboard';
    },

    renderRekap: async (user) => {
        const container = document.getElementById('page-rekap');
        
        let html = `
            <div class="card">
                <h2 class="font-heading" style="margin-bottom: 1.5rem;">Rekapitulasi Kehadiran</h2>
                
                <div class="tabs">
                    ${user.isWaliKelas || user.role === 'admin' ? `<button class="tab-btn active" onclick="window.Teacher.switchTab('harian')">Rekap Harian (Wali Kelas)</button>` : ''}
                    <button class="tab-btn ${!user.isWaliKelas && user.role !== 'admin' ? 'active' : ''}" onclick="window.Teacher.switchTab('mapel')">Rekap Per Mata Pelajaran</button>
                </div>

                <div id="tab-harian" class="tab-content ${user.isWaliKelas || user.role === 'admin' ? 'active' : ''}">
                    <!-- Filter -->
                    <div class="d-flex gap-4" style="margin-bottom: 1.5rem;">
                        <div class="form-group" style="margin: 0;">
                            <label>Kelas</label>
                            <select class="form-control" id="rekap-kelas-harian" onchange="window.Teacher.loadRekapHarian()">
                                ${(await window.DB.getClasses()).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table id="table-rekap-harian">
                            <thead>
                                <tr>
                                    <th>Nama Siswa</th>
                                    <th>Hadir</th>
                                    <th>Sakit</th>
                                    <th>Izin</th>
                                    <th>Alfa</th>
                                    <th>% Hadir</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Generated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="tab-mapel" class="tab-content ${!user.isWaliKelas && user.role !== 'admin' ? 'active' : ''}">
                    <div class="d-flex gap-4" style="margin-bottom: 1.5rem;">
                        <div class="form-group" style="margin: 0;">
                            <label>Kelas</label>
                            <select class="form-control" id="rekap-kelas-mapel" onchange="window.Teacher.loadRekapMapel()">
                                ${(await window.DB.getClasses()).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table id="table-rekap-mapel">
                            <thead>
                                <tr>
                                    <th>Nama Siswa</th>
                                    <th>Hadir</th>
                                    <th>Sakit</th>
                                    <th>Izin</th>
                                    <th>Alfa</th>
                                    <th>Terlambat</th>
                                    <th>% Hadir Mapel</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Generated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        if(user.isWaliKelas && document.getElementById('rekap-kelas-harian')) {
            document.getElementById('rekap-kelas-harian').value = user.waliKelasId;
        }

        window.Teacher.loadRekapHarian();
        window.Teacher.loadRekapMapel();
    },

    switchTab: (tabId) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
    },

    loadRekapHarian: async () => {
        const select = document.getElementById('rekap-kelas-harian');
        if (!select) return;
        
        const classId = select.value;
        const students = await window.DB.getStudentsByClass(classId);
        const allDaily = await window.DB.getAttendanceDaily();
        const dailyData = allDaily.filter(d => d.classId === classId);

        const tbody = document.querySelector('#table-rekap-harian tbody');
        
        const rows = students.map(s => {
            let hadir = 0, sakit = 0, izin = 0, alfa = 0;
            
            dailyData.forEach(d => {
                const rec = d.records.find(r => r.studentId === s.id);
                if (rec) {
                    if(rec.status === 'hadir') hadir++;
                    if(rec.status === 'sakit') sakit++;
                    if(rec.status === 'izin') izin++;
                    if(rec.status === 'alfa') alfa++;
                }
            });

            const total = hadir + sakit + izin + alfa;
            const pct = total === 0 ? 0 : Math.round((hadir / total) * 100);
            
            let color = '';
            if (pct < 75) color = 'var(--color-alfa)';
            else if (pct < 90) color = 'var(--color-sakit)';

            return `
                <tr>
                    <td><strong>${s.name}</strong><br><small class="text-light">${s.nis}</small></td>
                    <td>${hadir}</td>
                    <td>${sakit}</td>
                    <td>${izin}</td>
                    <td>${alfa}</td>
                    <td style="color: ${color}; font-weight: bold;">${pct}%</td>
                </tr>
            `;
        });

        tbody.innerHTML = rows.join('');
    },

    loadRekapMapel: async () => {
        const select = document.getElementById('rekap-kelas-mapel');
        if (!select) return;
        
        const classId = select.value;
        const students = await window.DB.getStudentsByClass(classId);
        const allMapel = await window.DB.getAttendanceSubject();
        const mapelData = allMapel.filter(d => d.classId === classId);

        const tbody = document.querySelector('#table-rekap-mapel tbody');
        
        const rows = students.map(s => {
            let hadir = 0, sakit = 0, izin = 0, alfa = 0, terlambat = 0;
            
            mapelData.forEach(d => {
                const rec = d.records.find(r => r.studentId === s.id);
                if (rec) {
                    if(rec.status === 'hadir') hadir++;
                    if(rec.status === 'sakit') sakit++;
                    if(rec.status === 'izin') izin++;
                    if(rec.status === 'alfa') alfa++;
                    if(rec.status === 'terlambat') terlambat++;
                }
            });

            // Terlambat dihitung hadir untuk persentase, tapi tetap dicatat. Atau sesuai kebijakan.
            // Asumsikan terlambat = hadir secara fisik, jadi masuk denominator, numerator
            const total = hadir + sakit + izin + alfa + terlambat;
            const pct = total === 0 ? 0 : Math.round(((hadir + terlambat) / total) * 100);
            
            let color = '';
            if (pct < 75) color = 'var(--color-alfa)';
            else if (pct < 90) color = 'var(--color-sakit)';

            return `
                <tr>
                    <td><strong>${s.name}</strong><br><small class="text-light">${s.nis}</small></td>
                    <td>${hadir}</td>
                    <td>${sakit}</td>
                    <td>${izin}</td>
                    <td>${alfa}</td>
                    <td>${terlambat}</td>
                    <td style="color: ${color}; font-weight: bold;">${pct}%</td>
                </tr>
            `;
        });

        tbody.innerHTML = rows.join('');
    }
};
