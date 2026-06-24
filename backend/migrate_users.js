const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const schedulesFile = path.join(dataDir, 'schedules.json');

// Real teachers dataset matching the PRD
const realTeachers = [
    { id: "S", name: "Drs. Anwar Musadat, M.Pd.", subjects: ["Sosiologi"], isWaliKelas: false, waliKelasId: null, nip: "196509301992031010", tugasTambahan: "Kepala Sekolah" },
    { id: "A1", name: "Firman, M.Ud.", subjects: ["PAI"], isWaliKelas: false, waliKelasId: null, nip: "198110102023211011", tugasTambahan: "Pembina Ekskul Rohis" },
    { id: "A2", name: "Ulfiyani, S.Pd.", subjects: ["PAI"], isWaliKelas: false, waliKelasId: null, nip: "198205042010122003", tugasTambahan: "-" },
    { id: "A3", name: "Muhammad Makhrus, S.Pd.I", subjects: ["PAI"], isWaliKelas: false, waliKelasId: null, nip: "198506152014021004", tugasTambahan: "-" },
    { id: "A4", name: "Deri Hastuti, S.S.", subjects: ["PAKAT"], isWaliKelas: false, waliKelasId: null, nip: "197808202008012015", tugasTambahan: "-" },
    { id: "A6", name: "Fitri Sihombing, S.Pd.", subjects: ["PAK"], isWaliKelas: false, waliKelasId: null, nip: "198304122011012018", tugasTambahan: "-" },
    { id: "O1", name: "Sigit Pamungkas, S.Or.", subjects: ["Penjas-Orkes"], isWaliKelas: true, waliKelasId: "X-1", nip: "198306082022211005", tugasTambahan: "Wali Kelas X-1" },
    { id: "O2", name: "Hariyanto Gatot Nugroho, S.Pd.", subjects: ["Penjas-Orkes"], isWaliKelas: true, waliKelasId: "XI-5", nip: "198407012023211017", tugasTambahan: "Wali Kelas XI-5" },
    { id: "O3", name: "Ardhi Putra Nugroho, S.Pd.", subjects: ["Penjas-Orkes"], isWaliKelas: false, waliKelasId: null, nip: "198811122020121009", tugasTambahan: "-" },
    { id: "M1", name: "Hj. Ati Susilawatie, S.Pd., M.M.", subjects: ["Matematika"], isWaliKelas: false, waliKelasId: null, nip: "196803151994032002", tugasTambahan: "-" },
    { id: "M2", name: "Dra. Waris Meiny, S.", subjects: ["Matematika"], isWaliKelas: true, waliKelasId: "XI-7", nip: "196605221990032003", tugasTambahan: "Wali Kelas XI-7" },
    { id: "M3", name: "Apto Taufan Apteno, M.Pd.", subjects: ["Matematika TL"], isWaliKelas: true, waliKelasId: "XI-3", nip: "197509182005011004", tugasTambahan: "Wali Kelas XI-3" },
    { id: "M4", name: "Hardiyanto, S.Pd.", subjects: ["Matematika"], isWaliKelas: false, waliKelasId: null, nip: "197707012006041003", tugasTambahan: "Wakil Akademik" },
    { id: "M5", name: "Syaiful Bahri, M.Pd.", subjects: ["Matematika TL"], isWaliKelas: true, waliKelasId: "XI-1", nip: "197804052009021002", tugasTambahan: "Wali Kelas XI-1" },
    { id: "Bg1", name: "Bina Rahayu Setyasih, S.Pd.", subjects: ["Biologi"], isWaliKelas: true, waliKelasId: "X-3", nip: "197911122008012016", tugasTambahan: "Wali Kelas X-3" },
    { id: "Bg2Bi3", name: "Ria Lestari, S.Pd.", subjects: ["Biologi", "Bahasa Indonesia"], isWaliKelas: false, waliKelasId: null, nip: "198212182010122004", tugasTambahan: "-" },
    { id: "K1", name: "Heni Purwaningsih, M.Pd.", subjects: ["Kimia"], isWaliKelas: true, waliKelasId: "XI-2", nip: "198103142009032007", tugasTambahan: "Wali Kelas XI-2" },
    { id: "K2", name: "Drs. Amudi Lumbantoruan", subjects: ["Kimia"], isWaliKelas: false, waliKelasId: null, nip: "196711081995031002", tugasTambahan: "-" },
    { id: "K3Pw4", name: "Yahdana, S.Pd.", subjects: ["Kimia", "PKWU"], isWaliKelas: false, waliKelasId: null, nip: "198005162008012013", tugasTambahan: "-" },
    { id: "K4Pw1", name: "Gilang Nurbijanudin, S.Pd.", subjects: ["Kimia", "PKWU"], isWaliKelas: true, waliKelasId: "X-5", nip: "198902202022211008", tugasTambahan: "Wali Kelas X-5" },
    { id: "Pw2Bi2", name: "Karno, S.E.", subjects: ["PKWU", "Bahasa Indonesia"], isWaliKelas: false, waliKelasId: null, nip: "197504102008011012", tugasTambahan: "-" },
    { id: "E1", name: "Dra. Niken Sutiyaningsih, M.Pd.", subjects: ["Ekonomi"], isWaliKelas: true, waliKelasId: "XI-3", nip: "196809181993032002", tugasTambahan: "Wali Kelas XI-3" },
    { id: "E2", name: "Erna Farkah, S.Pd.", subjects: ["Ekonomi"], isWaliKelas: true, waliKelasId: "X-6", nip: "198106182009042008", tugasTambahan: "Wali Kelas X-6" },
    { id: "E3Pw3", name: "Refiani, S.Pd.", subjects: ["Ekonomi", "PKWU"], isWaliKelas: false, waliKelasId: null, nip: "198305042010122003", tugasTambahan: "-" },
    { id: "F1", name: "Juni Sudiyo, S.Pd.", subjects: ["Fisika TL", "Fisika"], isWaliKelas: false, waliKelasId: null, nip: "197606122008011009", tugasTambahan: "-" },
    { id: "F2", name: "Sri Subektil, S.Pd.", subjects: ["Fisika TL"], isWaliKelas: false, waliKelasId: null, nip: "197809222009032008", tugasTambahan: "-" },
    { id: "F3", name: "Kuncoro Tri Muryanto, M.Pd.", subjects: ["Fisika"], isWaliKelas: true, waliKelasId: "XII-2", nip: "198003182006041005", tugasTambahan: "Wali Kelas XII-2" },
    { id: "F4", name: "Ali Rapsanjani, S.Pd.", subjects: ["Fisika"], isWaliKelas: false, waliKelasId: null, nip: "199105122022211009", tugasTambahan: "-" },
    { id: "S1", name: "Tendy Christanto, S.Pd.", subjects: ["Sosiologi"], isWaliKelas: true, waliKelasId: "X-2", nip: "198402182010121004", tugasTambahan: "Wali Kelas X-2" },
    { id: "S2", name: "Muhammad Novel, S.Pd.", subjects: ["Sosiologi"], isWaliKelas: false, waliKelasId: null, nip: "198711102020121008", tugasTambahan: "-" },
    { id: "Sj1", name: "Rinta Sarasati, S.Pd.", subjects: ["Sejarah"], isWaliKelas: true, waliKelasId: "XII-5", nip: "198308152009032011", tugasTambahan: "Wali Kelas XII-5" },
    { id: "Sj2Bi4", name: "Tri Sumardisti, M.Pd.", subjects: ["Sejarah", "Bahasa Indonesia"], isWaliKelas: true, waliKelasId: "X-8", nip: "198104102008012014", tugasTambahan: "Wali Kelas X-8" },
    { id: "Sj3", name: "Yulia Rahmah, S.Pd.", subjects: ["Sejarah"], isWaliKelas: false, waliKelasId: null, nip: "198807182020122015", tugasTambahan: "-" },
    { id: "G1", name: "Ida Royani, S.Pd.", subjects: ["Geografi"], isWaliKelas: true, waliKelasId: "XI-3", nip: "197412152005012005", tugasTambahan: "Wali Kelas XI-3" },
    { id: "G2", name: "Laili Hadiah, M.Pd.", subjects: ["Geografi"], isWaliKelas: false, waliKelasId: null, nip: "198109152009042008", tugasTambahan: "-" },
    { id: "G3", name: "Rudi Laksono, S.Pd.", subjects: ["Geografi"], isWaliKelas: false, waliKelasId: null, nip: "198503202011011009", tugasTambahan: "-" },
    { id: "G4", name: "Sukawati Sri Lestari, S.Pd.", subjects: ["Geografi"], isWaliKelas: false, waliKelasId: null, nip: "198311102009032011", tugasTambahan: "-" },
    { id: "Pn1", name: "Suhendi, M.Pd.", subjects: ["Pend. Pancasila"], isWaliKelas: false, waliKelasId: null, nip: "197810152005011006", tugasTambahan: "-" },
    { id: "Pn2", name: "Deli Rosadi, S.Pd.", subjects: ["Pend. Pancasila"], isWaliKelas: false, waliKelasId: null, nip: "198104082009041008", tugasTambahan: "-" },
    { id: "Pn3", name: "Dra. Rinta Nababan", subjects: ["Pend. Pancasila"], isWaliKelas: false, waliKelasId: null, nip: "196906221995032003", tugasTambahan: "-" },
    { id: "Bi1", name: "Dra. Supadmi, M.Pd.", subjects: ["Bahasa Indonesia"], isWaliKelas: true, waliKelasId: "XI-6", nip: "196805121993032003", tugasTambahan: "Wali Kelas XI-6" },
    { id: "I1", name: "Zakiyah, S.Pd.", subjects: ["Bahasa Inggris"], isWaliKelas: true, waliKelasId: "XI-4", nip: "198204122009032009", tugasTambahan: "Wali Kelas XI-4" },
    { id: "I2", name: "Umayah, S.Pd.", subjects: ["Bahasa Inggris"], isWaliKelas: true, waliKelasId: "XII-8", nip: "197210151998032003", tugasTambahan: "Wali Kelas XII-8" },
    { id: "I3", name: "Mutu Resfi Kinasih, S.Pd.", subjects: ["Bahasa Inggris"], isWaliKelas: true, waliKelasId: "X-4", nip: "198608202010122005", tugasTambahan: "Wali Kelas X-4" },
    { id: "TI1", name: "Deden Suryana, S.Pd.", subjects: ["Informatika"], isWaliKelas: true, waliKelasId: "X-7", nip: "197903022014121002", tugasTambahan: "Wali Kelas X-7 / Pembina Robotik" },
    { id: "TI2", name: "Hamzah Purwanto, S.Kom.", subjects: ["Informatika"], isWaliKelas: false, waliKelasId: null, nip: "198504122012121003", tugasTambahan: "-" },
    { id: "TI3", name: "Widdy Tri Saputra, S.Kom.", subjects: ["Informatika"], isWaliKelas: false, waliKelasId: null, nip: "198708222015031004", tugasTambahan: "-" },
    { id: "BK1", name: "Nina Maulana, S.Pd.", subjects: ["BK"], isWaliKelas: false, waliKelasId: null, nip: "198109202008012015", tugasTambahan: "-" },
    { id: "BK2", name: "Neni Rahayati, S.Pd.", subjects: ["BK"], isWaliKelas: false, waliKelasId: null, nip: "198305102009042006", tugasTambahan: "-" },
    { id: "Sb1", name: "Sukma Parousla Pistera, S.Pd.", subjects: ["Seni Budaya"], isWaliKelas: false, waliKelasId: null, nip: "198604122010122005", tugasTambahan: "-" },
    { id: "Sb2", name: "Desby Nurtosha, S.Pd.", subjects: ["Seni Budaya"], isWaliKelas: false, waliKelasId: null, nip: "198911182022211009", tugasTambahan: "-" },
    { id: "Tl1", name: "Guru TL 1", subjects: ["Muatan Lokal"], isWaliKelas: false, waliKelasId: null, nip: "199001152023211011", tugasTambahan: "-" },
    { id: "Tl2", name: "Guru TL 2", subjects: ["Muatan Lokal"], isWaliKelas: false, waliKelasId: null, nip: "199203102023211012", tugasTambahan: "-" },
    { id: "B5", name: "Sandy Maheswara", subjects: ["Seni Rupa"], isWaliKelas: false, waliKelasId: null, nip: "199105152022211013", tugasTambahan: "-" }
];

// Generator for NIP dummy realistic
const generateMockNIP = (gender, birthYear) => {
    const year = birthYear || (Math.floor(Math.random() * (1995 - 1970 + 1)) + 1970);
    const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const birthDate = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    
    const startYear = year + 24 + Math.floor(Math.random() * 5); // start working at age 24-28
    const startMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    
    const genderDigit = gender === 'P' ? '2' : '1';
    const seq = String(Math.floor(Math.random() * 900) + 100);
    
    return `${year}${birthMonth}${birthDate}${startYear}${startMonth}${genderDigit}${seq}`;
};

// Detect gender from name
const getGenderFromName = (name) => {
    const femalePrefixes = ["Dra.", "Hj.", "Fitri", "Deri", "Ulfiyani", "Ria", "Heni", "Yahdana", "Niken", "Erna", "Refiani", "Sri", "Rinta", "Tri", "Yulia", "Ida", "Laili", "Sukawati", "Rista", "Zakiyah", "Umayah", "Mutu", "Nina", "Neni", "Sukma", "Desby"];
    for (const prefix of femalePrefixes) {
        if (name.includes(prefix)) return 'P';
    }
    return 'L';
};

const runMigration = () => {
    let schedules = [];
    if (fs.existsSync(schedulesFile)) {
        schedules = JSON.parse(fs.readFileSync(schedulesFile, 'utf8'));
    }

    const adminUser = {
        id: "admin",
        kodeGuru: "admin",
        username: "admin",
        password: "admin123",
        name: "Administrator Sistem",
        role: "admin",
        isWaliKelas: false,
        waliKelasId: null,
        subjects: [],
        teachingClasses: []
    };

    const finalUsers = [adminUser];

    realTeachers.forEach(t => {
        // Find teaching classes from schedules using either code directly or splits
        const teachingClasses = new Set();
        schedules.forEach(scheduleRow => {
            scheduleRow.slots.forEach(slot => {
                const matches = (slot.teacherId === t.id) ||
                                (t.id === 'Bg2Bi3' && (slot.teacherId === 'Bg2' || slot.teacherId === 'Bi3')) ||
                                (t.id === 'K3Pw4' && (slot.teacherId === 'K3' || slot.teacherId === 'Pw4')) ||
                                (t.id === 'K4Pw1' && (slot.teacherId === 'K4' || slot.teacherId === 'Pw1')) ||
                                (t.id === 'Pw2Bi2' && (slot.teacherId === 'Pw2' || slot.teacherId === 'Bi2')) ||
                                (t.id === 'E3Pw3' && (slot.teacherId === 'E3' || slot.teacherId === 'Pw3')) ||
                                (t.id === 'Sj2Bi4' && (slot.teacherId === 'Sj2' || slot.teacherId === 'Bi4')) ||
                                (t.id === 'Bi1' && (slot.teacherId === 'Bi1' || slot.teacherId === 'Bi5'));
                
                if (matches) {
                    teachingClasses.add(scheduleRow.classId);
                }
            });
        });

        // Ensure NIP is valid
        const gender = getGenderFromName(t.name);
        const nip = t.nip || generateMockNIP(gender);
        
        // Auto-assign Wali Kelas in Tugas Tambahan if not set
        let tugas = t.tugasTambahan;
        if (t.isWaliKelas && tugas === "-") {
            tugas = `Wali Kelas ${t.waliKelasId}`;
        }

        finalUsers.push({
            id: t.id,
            kodeGuru: t.id,
            username: t.id.toLowerCase(),
            password: 'guru123',
            name: t.name,
            role: 'guru',
            subjects: t.subjects,
            isWaliKelas: t.isWaliKelas,
            waliKelasId: t.waliKelasId,
            teachingClasses: Array.from(teachingClasses),
            nip: nip,
            tugasTambahan: tugas
        });
    });

    fs.writeFileSync(usersFile, JSON.stringify(finalUsers, null, 2));
    console.log(`Successfully migrated ${finalUsers.length} users in users.json`);
};

runMigration();
