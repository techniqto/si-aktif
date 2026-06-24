/**
 * SI-AKTIF Charts & Analytics
 */

window.ChartsObj = {
    renderGrafik: async (user) => {
        const container = document.getElementById('page-grafik');
        
        let html = `
            <div class="card" style="margin-bottom: 1.5rem;">
                <h2 class="font-heading" style="margin-bottom: 1.5rem;">Grafik Tren Kehadiran</h2>
                
                <div class="dashboard-grid">
                    <div>
                        <div class="form-group">
                            <label>Pilih Kelas</label>
                            <select class="form-control" id="chart-class" onchange="window.ChartsObj.loadStudents()">
                                <option value="">-- Pilih Kelas --</option>
                                ${(await window.DB.getClasses()).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Pilih Siswa</label>
                            <select class="form-control" id="chart-student" onchange="window.ChartsObj.drawCharts()">
                                <option value="">-- Pilih Siswa --</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="card" style="background: #f8fafc; border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 1.25rem; box-shadow: none;">
                        <h4 style="margin-bottom: 0.5rem; color: var(--color-navy); font-size: 1rem;">Deteksi Anomali</h4>
                        <p class="text-light" style="font-size: 0.875rem; color: var(--color-text-light);" id="anomaly-text">Pilih siswa untuk melihat anomali (hadir di wali kelas namun alfa di mata pelajaran tertentu).</p>
                    </div>
                </div>

                <div id="charts-wrapper" style="display: none; margin-top: 2rem;">
                    <h3 class="font-heading" style="margin-bottom: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Tren Harian vs Mapel</h3>
                    <div class="chart-container large">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        if (user.isWaliKelas) {
            const classSelect = document.getElementById('chart-class');
            if (classSelect) {
                classSelect.value = user.waliKelasId;
                window.ChartsObj.loadStudents();
            }
        }
    },

    loadStudents: async () => {
        const classId = document.getElementById('chart-class').value;
        const studentSelect = document.getElementById('chart-student');
        
        if (!classId) {
            studentSelect.innerHTML = '<option value="">-- Pilih Siswa --</option>';
            return;
        }

        const students = await window.DB.getStudentsByClass(classId);
        studentSelect.innerHTML = `<option value="">-- Pilih Siswa --</option>` + 
            students.map(s => `<option value="${s.id}">${s.name} (${s.nis})</option>`).join('');
            
        // Select first student for demo
        if(students.length > 0) {
            studentSelect.value = students[0].id;
            window.ChartsObj.drawCharts();
        }
    },

    trendChartInstance: null,

    drawCharts: async () => {
        const classId = document.getElementById('chart-class').value;
        const studentId = document.getElementById('chart-student').value;
        const wrapper = document.getElementById('charts-wrapper');
        
        if (!classId || !studentId) {
            wrapper.style.display = 'none';
            return;
        }

        wrapper.style.display = 'block';

        const allDaily = await window.DB.getAttendanceDaily();
        const dailyData = allDaily.filter(d => d.classId === classId);
        
        const allMapel = await window.DB.getAttendanceSubject();
        const mapelData = allMapel.filter(d => d.classId === classId);

        // Group by month (very simplified for demo: last 30 days usually fall in 1 or 2 months)
        // Let's just create a generic timeline for the past 30 days based on data
        const datesMap = new Set();
        dailyData.forEach(d => datesMap.add(d.date));
        mapelData.forEach(d => datesMap.add(d.date));
        
        const sortedDates = Array.from(datesMap).sort();
        
        // Data prep
        const dailyHadir = [];
        const mapelHadir = [];
        
        let anomalyCount = 0;

        sortedDates.forEach(date => {
            // Daily
            const dRecord = dailyData.find(d => d.date === date);
            let dStatus = 0; // 0=alfa/sakit/izin, 1=hadir
            let isDailyHadir = false;
            if (dRecord) {
                const sr = dRecord.records.find(r => r.studentId === studentId);
                if (sr && sr.status === 'hadir') {
                    dStatus = 1;
                    isDailyHadir = true;
                }
            }
            dailyHadir.push(dStatus * 100); // 0 or 100%

            // Mapel (average of day's mapels)
            const mRecords = mapelData.filter(d => d.date === date);
            if (mRecords.length > 0) {
                let mTotal = 0;
                let mHadir = 0;
                let isMapelAlfa = false;
                
                mRecords.forEach(mr => {
                    const sr = mr.records.find(r => r.studentId === studentId);
                    if (sr) {
                        mTotal++;
                        if (sr.status === 'hadir' || sr.status === 'terlambat') {
                            mHadir++;
                        } else if (sr.status === 'alfa') {
                            isMapelAlfa = true;
                        }
                    }
                });
                
                if (mTotal > 0) {
                    mapelHadir.push((mHadir / mTotal) * 100);
                } else {
                    mapelHadir.push(null);
                }

                // Check anomaly
                if (isDailyHadir && isMapelAlfa) {
                    anomalyCount++;
                }

            } else {
                mapelHadir.push(null);
            }
        });

        // Format dates for labels
        const labels = sortedDates.map(d => {
            const dt = new Date(d);
            return `${dt.getDate()}/${dt.getMonth()+1}`;
        });

        const ctx = document.getElementById('trendChart').getContext('2d');
        
        if (window.ChartsObj.trendChartInstance) {
            window.ChartsObj.trendChartInstance.destroy();
        }

        window.ChartsObj.trendChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Kehadiran Wali Kelas (%)',
                        data: dailyHadir,
                        backgroundColor: '#0061ff', // primary blue
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Rata-rata Kehadiran Mapel (%)',
                        data: mapelHadir,
                        backgroundColor: '#80b0ff', // lighter blue
                        borderRadius: 4,
                        barPercentage: 0.6,
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
                        max: 105,
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            color: '#6b7280'
                        }
                    }
                }
            }
        });

        // Update Anomaly text
        const anomalyEl = document.getElementById('anomaly-text');
        if (anomalyCount > 0) {
            anomalyEl.innerHTML = `<strong style="color: var(--color-alfa)"><i data-lucide="alert-triangle" style="width:16px;height:16px;vertical-align:middle;"></i> Terdeteksi ${anomalyCount} Anomali</strong><br>Siswa ini tercatat hadir di pagi hari oleh wali kelas, namun bolos/alfa di beberapa jam pelajaran tertentu selama 30 hari terakhir.`;
        } else {
            anomalyEl.innerHTML = `<strong style="color: var(--color-hadir)"><i data-lucide="check-circle" style="width:16px;height:16px;vertical-align:middle;"></i> Tidak Ada Anomali</strong><br>Siswa ini disiplin mengikuti seluruh mata pelajaran sesuai dengan absensi wali kelas.`;
        }
        if (window.lucide) lucide.createIcons({root: anomalyEl.parentElement});
    }
};
