const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const seedClasses = () => {
    const classes = [];
    ['X', 'XI', 'XII'].forEach((gradeStr, gradeIdx) => {
        const gradeNum = gradeIdx + 10;
        for (let i = 1; i <= 8; i++) {
            classes.push({
                id: `${gradeStr}-${i}`,
                name: `${gradeStr}-${i}`,
                grade: gradeNum,
                academicYear: '2025/2026'
            });
        }
    });
    return classes;
};

const seedUsers = () => {
    const teachersData = [
        { id: "S", name: "Drs. Anwar Musadat, M.Pd.", subject: "Sosiologi", wk: null },
        { id: "A1", name: "Firman, M.Ud.", subject: "PAI", wk: null },
        { id: "A2", name: "Ulfiyani, S.Pd.", subject: "PAI", wk: null },
        { id: "A3", name: "Muhammad Makhrus, S.Pd.I", subject: "PAI", wk: null },
        { id: "A4", name: "Deri Hastuti, S.S.", subject: "PAKAT", wk: null },
        { id: "A6", name: "Fitri Sihombing, S.Pd.", subject: "PAK", wk: null },
        { id: "O1", name: "Sigit Pamungkas, S.Or.", subject: "Penjas-Orkes", wk: "X-1" },
        { id: "O2", name: "Hariyanto Gatot Nugroho, S.Pd.", subject: "Penjas-Orkes", wk: null },
        { id: "O3", name: "Ardhi Putra Nugroho, S.Pd.", subject: "Penjas-Orkes", wk: null },
        { id: "M1", name: "Hj. Ati Susilawatie, S.Pd., M.M.", subject: "Matematika", wk: null },
        { id: "M2", name: "Dra. Waris Meiny, S.", subject: "Matematika", wk: "XI-7" },
        { id: "M3", name: "Apto Taufan Apteno, M.Pd.", subject: "Matematika TL", wk: "XI-3" },
        { id: "M4", name: "Hardiyanto, S.Pd.", subject: "Matematika", wk: null },
        { id: "M5", name: "Syaiful Bahri, M.Pd.", subject: "Matematika TL", wk: "XI-1" },
        { id: "Bg1", name: "Bina Rahayu Setyasih, S.Pd.", subject: "Biologi", wk: "X-3" },
        { id: "Bg2Bi3", name: "Ria Lestari, S.Pd.", subject: "Biologi/B.Indo", wk: null },
        { id: "K1", name: "Heni Purwaningsih, M.Pd.", subject: "Kimia", wk: "XI-2" },
        { id: "K2", name: "Drs. Amudi Lumbantoruan", subject: "Kimia", wk: null },
        { id: "K3Pw4", name: "Yahdana, S.Pd.", subject: "Kimia/PKWU", wk: null },
        { id: "K4Pw1", name: "Gilang Nurbijanudin, S.Pd.", subject: "Kimia/PKWU", wk: "X-5" },
        { id: "Pw2Bi2", name: "Karno, S.E.", subject: "PKWU/B.Indo", wk: null },
        { id: "E1", name: "Dra. Niken Sutiyaningsih, M.Pd.", subject: "Ekonomi", wk: "XI-3" },
        { id: "E2", name: "Erna Farkah, S.Pd.", subject: "Ekonomi", wk: "X-6" },
        { id: "E3Pw3", name: "Refiani, S.Pd.", subject: "Ekonomi/PKWU", wk: null },
        { id: "F1", name: "Juni Sudiyo, S.Pd.", subject: "Fisika TL/Fisika", wk: null },
        { id: "F2", name: "Sri Subektil, S.Pd.", subject: "Fisika TL", wk: null },
        { id: "F3", name: "Kunoro Tri Muryanto, M.Pd.", subject: "Fisika", wk: "XII-2" },
        { id: "F4", name: "Ali Rapsanjani, S.Pd.", subject: "Fisika", wk: null },
        { id: "S1", name: "Tendy Christanto, S.Pd.", subject: "Sosiologi", wk: "X-2" },
        { id: "S2", name: "Muhammad Novel, S.Pd.", subject: "Sosiologi", wk: null },
        { id: "Sj1", name: "Rinta Sarasati, S.Pd.", subject: "Sejarah", wk: "XII-5" },
        { id: "Sj2Bi4", name: "Tri Sumardisti, M.Pd.", subject: "Sejarah/B.Indo", wk: "X-8" },
        { id: "Sj3", name: "Yulia Rahmah, S.Pd.", subject: "Sejarah", wk: null },
        { id: "G1", name: "Ida Royani, S.Pd.", subject: "Geografi", wk: "XI-3" },
        { id: "G2", name: "Laili Hadiah, M.Pd.", subject: "Geografi", wk: null },
        { id: "G3", name: "Rudi Laksono, S.Pd.", subject: "Geografi", wk: null },
        { id: "G4", name: "Sukawati Sri Lestari, S.Pd.", subject: "Geografi", wk: null },
        { id: "Pn1", name: "Suhendi, M.Pd.", subject: "Pend. Pancasila", wk: null },
        { id: "Pn2", name: "Deli Rosadi, S.Pd.", subject: "Pend. Pancasila", wk: null },
        { id: "Pn3", name: "Dra. Rinta Nababan", subject: "Pend. Pancasila", wk: null },
        { id: "Bi1", name: "Dra. Supadmi, M.Pd.", subject: "Bahasa Indonesia", wk: "XI-6" },
        { id: "I1", name: "Zakiyah, S.Pd.", subject: "Bahasa Inggris", wk: "XI-4" },
        { id: "I2", name: "Umayah, S.Pd.", subject: "Bahasa Inggris", wk: "XII-8" },
        { id: "I3", name: "Mutu Resfi Kinasih, S.Pd.", subject: "Bahasa Inggris", wk: "X-4" },
        { id: "TI1", name: "Dedon Suryana, S.Pd.", subject: "Informatika", wk: "X-7" },
        { id: "TI2", name: "Hamzah Purwanto, S.Kom.", subject: "Informatika", wk: null },
        { id: "TI3", name: "Widdy Tri Saputra, S.Kom.", subject: "Informatika", wk: null },
        { id: "BK1", name: "Nina Maulana, S.Pd.", subject: "BK", wk: null },
        { id: "BK2", name: "Neni Rahayati, S.Pd.", subject: "BK", wk: null },
        { id: "Sb1", name: "Sukma Parousla Pistera, S.Pd.", subject: "Seni Budaya", wk: null },
        { id: "Sb2", name: "Desby Nurtosha, S.Pd.", subject: "Seni Budaya", wk: null }
    ];

    const users = [
        {
            id: 'admin',
            kodeGuru: 'admin',
            username: 'admin',
            password: 'admin123',
            name: 'Administrator Sistem',
            role: 'admin',
            isWaliKelas: false,
            waliKelasId: null,
            subjects: [],
            teachingClasses: []
        }
    ];

    teachersData.forEach(t => {
        users.push({
            id: t.id,
            kodeGuru: t.id,
            username: t.id,
            password: 'guru123',
            name: t.name,
            role: 'guru',
            isWaliKelas: !!t.wk,
            waliKelasId: t.wk,
            subjects: t.subject.split('/'),
            teachingClasses: t.wk ? [t.wk, 'X-2', 'XI-1'] : ['X-1', 'X-2', 'X-3', 'XI-1', 'XII-1']
        });
    });

    return users;
};

const firstNames = ["Ahmad", "Budi", "Citra", "Dian", "Eka", "Fajar", "Gita", "Hadi", "Intan", "Joko", "Kartika", "Lestari", "Muhammad", "Nadia", "Oka", "Putri", "Qori", "Reza", "Siti", "Tari"];
const lastNames = ["Pratama", "Saputra", "Wijaya", "Kusuma", "Nugroho", "Sari", "Rahayu", "Hidayat", "Lestari", "Gunawan"];

const generateName = () => {
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const seedStudents = (classes) => {
    const students = [];
    let studentIdCounter = 1;

    classes.forEach(cls => {
        // Generate students for this class
        const classStudents = [];
        for (let i = 0; i < 30; i++) {
            classStudents.push({
                id: `S${String(studentIdCounter).padStart(4, '0')}`,
                name: generateName(),
                nis: `2024${String(studentIdCounter).padStart(4, '0')}`,
                classId: cls.id,
                gender: Math.random() > 0.5 ? 'L' : 'P'
            });
            studentIdCounter++;
        }
        // Sort alphabetically by name, then assign noAbsen
        classStudents.sort((a, b) => a.name.localeCompare(b.name, 'id'));
        classStudents.forEach((s, idx) => {
            s.noAbsen = idx + 1;
        });
        students.push(...classStudents);
    });

    return students;
};

const seedSchedules = (classes) => {
    const schedules = [];
    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];
    
    classes.forEach(cls => {
        days.forEach(day => {
            const slots = [];
            for(let jam = 1; jam <= 8; jam++) {
                slots.push({
                    jamKe: jam,
                    time: `0${6 + jam}.00 - 0${7 + jam}.00`,
                    teacherId: "M1",
                    subject: "Matematika" 
                });
            }
            schedules.push({
                id: `${cls.id}-${day}`,
                day: day,
                classId: cls.id,
                slots: slots
            });
        });
    });
    return schedules;
};

const seedAttendance = (students, classes) => {
    const daily = [];
    const subject = [];
    
    const today = new Date();
    for(let i=0; i<30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        
        const dateStr = d.toISOString().split('T')[0];
        const x1Students = students.filter(s => s.classId === 'X-1');
        
        if (x1Students.length > 0) {
            const dailyRecords = x1Students.map(s => {
                const rand = Math.random();
                let status = 'hadir';
                if (rand > 0.95) status = 'sakit';
                else if (rand > 0.90) status = 'izin';
                else if (rand > 0.85) status = 'alfa';
                return { studentId: s.id, status: status };
            });

            daily.push({
                id: `ATD-${dateStr}-X-1`,
                date: dateStr,
                classId: 'X-1',
                waliKelasId: 'O1',
                type: 'wali_kelas',
                records: dailyRecords
            });

            const subjRecords = dailyRecords.map(rec => {
                let status = rec.status;
                if (status === 'hadir') {
                    const r = Math.random();
                    if (r > 0.9) status = 'terlambat';
                    else if (r > 0.85) status = 'alfa';
                }
                return { studentId: rec.studentId, status: status };
            });

            subject.push({
                id: `ATS-${dateStr}-X-1-M1-3`,
                date: dateStr,
                classId: 'X-1',
                teacherId: 'M1',
                subject: 'Matematika',
                jamKe: 3,
                type: 'guru_mapel',
                records: subjRecords
            });
        }
    }

    return { daily, subject };
};

const runSeed = () => {
    console.log("Seeding database...");
    
    const settings = {
        schoolName: "SMAN 47 Jakarta",
        academicYear: "2025/2026",
        semester: "Genap",
        kepalaSekolah: "Drs. Anwar Musadat, M.Pd."
    };
    fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify(settings, null, 2));

    const classes = seedClasses();
    fs.writeFileSync(path.join(dataDir, 'classes.json'), JSON.stringify(classes, null, 2));

    const users = seedUsers();
    fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));

    const students = seedStudents(classes);
    fs.writeFileSync(path.join(dataDir, 'students.json'), JSON.stringify(students, null, 2));

    const schedules = seedSchedules(classes);
    fs.writeFileSync(path.join(dataDir, 'schedules.json'), JSON.stringify(schedules, null, 2));

    const { daily, subject } = seedAttendance(students, classes);
    fs.writeFileSync(path.join(dataDir, 'attendance_daily.json'), JSON.stringify(daily, null, 2));
    fs.writeFileSync(path.join(dataDir, 'attendance_subject.json'), JSON.stringify(subject, null, 2));

    console.log("Database Seeded Successfully.");
};

if (require.main === module) {
    runSeed();
} else {
    module.exports = runSeed;
}
