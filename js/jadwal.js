/**
 * SI-AKTIF Jadwal Mengajar Feature
 */

window.Jadwal = {
    allSchedules: [],
    teacherId: null,

    renderJadwal: async (user) => {
        const container = document.getElementById('page-jadwal-mengajar');
        
        let html = `
            <div class="calendar-header-actions" style="margin-bottom: 2rem;">
                <div>
                    <p style="color: var(--color-text-light); font-size: 0.875rem; margin-top: 0.25rem;">Jadwal pelajaran mingguan berdasarkan hari dan jam.</p>
                </div>
                ${user.role === 'admin' ? `
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <label style="font-size: 0.875rem; color: var(--color-text-light);">Lihat Jadwal Guru:</label>
                        <select id="jadwal-teacher-select" class="form-control" style="width: 250px;">
                            <option value="">-- Pilih Guru --</option>
                        </select>
                    </div>
                ` : ''}
            </div>

            <div class="card">
                <div class="table-responsive">
                    <table class="table" id="jadwal-table" style="table-layout: fixed;">
                        <thead>
                            <tr>
                                <th style="width: 80px; text-align: center;">Jam</th>
                                <th style="text-align: center;">Senin</th>
                                <th style="text-align: center;">Selasa</th>
                                <th style="text-align: center;">Rabu</th>
                                <th style="text-align: center;">Kamis</th>
                                <th style="text-align: center;">Jumat</th>
                            </tr>
                        </thead>
                        <tbody id="jadwal-tbody">
                            <!-- Injected by JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        container.innerHTML = html;

        // Load schedule data
        window.Jadwal.allSchedules = await window.DB.getSchedule();

        if (user.role === 'admin') {
            const users = await window.DB.getUsers();
            const teachers = users.filter(u => u.role === 'guru');
            const select = document.getElementById('jadwal-teacher-select');
            teachers.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.kodeGuru; // Use kodeGuru because the schedule has O1, M1 etc
                opt.textContent = `${t.kodeGuru} - ${t.name}`;
                select.appendChild(opt);
            });
            select.addEventListener('change', (e) => {
                window.Jadwal.teacherId = e.target.value;
                window.Jadwal.drawTable();
            });
            
            // Set default if empty
            if (teachers.length > 0) {
                window.Jadwal.teacherId = ''; // show empty state
            }
        } else {
            // Use kodeGuru for teacher matching
            window.Jadwal.teacherId = user.kodeGuru;
        }

        window.Jadwal.drawTable();
    },

    drawTable: () => {
        const tbody = document.getElementById('jadwal-tbody');
        tbody.innerHTML = '';

        if (!window.Jadwal.teacherId) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--color-text-light);">Silakan pilih nama guru untuk melihat jadwal.</td></tr>`;
            return;
        }

        const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];
        const maxJam = 10;
        
        // Build an organized structure: scheduleMap[jam][day] = { classId, subject }
        const scheduleMap = {};
        for (let j = 1; j <= maxJam; j++) {
            scheduleMap[j] = {};
        }

        // Parse all schedules
        window.Jadwal.allSchedules.forEach(scheduleRow => {
            const day = scheduleRow.day.toLowerCase();
            const classId = scheduleRow.classId;
            
            if (scheduleRow.slots) {
                scheduleRow.slots.forEach(slot => {
                    let matchesTeacher = slot.teacherId === window.Jadwal.teacherId;
                    if (!matchesTeacher && window.Jadwal.teacherId) {
                        const tid = window.Jadwal.teacherId;
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
                        const myCodes = combinedCodes[tid] || [tid];
                        if (myCodes.includes(slot.teacherId)) {
                            matchesTeacher = true;
                        }
                    }
                    if (matchesTeacher) {
                        if (scheduleMap[slot.jamKe]) {
                            scheduleMap[slot.jamKe][day] = {
                                classId: classId,
                                subject: slot.subject || ''
                            };
                        }
                    }
                });
            }
        });

        // Render rows
        for (let jam = 1; jam <= maxJam; jam++) {
            const tr = document.createElement('tr');
            
            // Jam column
            const tdJam = document.createElement('td');
            tdJam.style.textAlign = 'center';
            tdJam.style.fontWeight = 'bold';
            tdJam.textContent = `Jam ${jam}`;
            tr.appendChild(tdJam);
            
            // Day columns
            days.forEach(day => {
                const td = document.createElement('td');
                td.style.verticalAlign = 'top';
                td.style.textAlign = 'center';
                
                const data = scheduleMap[jam][day];
                if (data) {
                    td.innerHTML = `
                        <div style="background-color: var(--color-bg); padding: 0.5rem; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border); height: 100%;">
                            <div style="font-weight: 600; color: var(--color-emerald); margin-bottom: 0.25rem;">${data.classId}</div>
                            <div style="font-size: 0.75rem; color: var(--color-text-light);">${data.subject}</div>
                        </div>
                    `;
                } else {
                    td.innerHTML = `<span style="color: var(--color-text-lighter);">-</span>`;
                }
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        }
    }
};
