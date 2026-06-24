const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

const readData = (filename) => JSON.parse(fs.readFileSync(path.join(dataDir, `${filename}.json`), 'utf8'));
const writeData = (filename, data) => fs.writeFileSync(path.join(dataDir, `${filename}.json`), JSON.stringify(data, null, 2));

const teachersMap = {
    'G': { name: 'Yunita Zana, M.Pd.', subject: 'Geografi', nip: '197909232003122004', tugasTambahan: 'Kepala SMA Negeri 47 Jakarta' },
    'A1': { name: 'Firman, M.Ud.', subject: 'PAI', nip: '198110102023211011', tugasTambahan: 'Koordinator MGMP PAI, Pembina ekskul Rohis' },
    'A2': { name: 'Ulfiyani, S.Pd.', subject: 'PAI', nip: '199706052023212018', tugasTambahan: 'Pembina ekskul Keputrian, Koordinator PjBL X-1 & X-2' },
    'A3': { name: 'Muhammad Makhrus, S.Pd.I', subject: 'PAI', nip: '197204032023211001', tugasTambahan: 'Piket KBM' },
    'Pn3': { name: 'Muhammad Makhrus, S.Pd.I', subject: 'Pendidikan Pancasila', nip: '197204032023211001', tugasTambahan: 'Piket KBM' },
    'A4': { name: 'Dwi Hastuti, S.S.', subject: 'PAKAT', nip: '197301282014122002', tugasTambahan: 'Pembina ekskul Fornika' },
    'A5': { name: 'Fitri Sihombing, S.Pd.', subject: 'PAK', nip: '', tugasTambahan: 'Pembina ekskul Rohkris, Piket KBM' },
    'O1': { name: 'Sigit Pamungkas, S.Or.', subject: 'Penjas-Orkes', nip: '198306082022211005', tugasTambahan: 'Koord. MGMP Penjas-Orkes, Wali Kelas X-1, Piket KBM' },
    'O2': { name: 'Hariyanto Gatot Nugroho, S.Pd.', subject: 'Penjas-Orkes', nip: '198407012023211017', tugasTambahan: 'Wali Kelas XI-5, Koordinator PjBL XI-5 & XI-6, Piket KBM, Pembina Ekskul Futsal' },
    'O3': { name: 'Ardhi Putro Nugroho, S.Pd.', subject: 'Penjas-Orkes', nip: '198507052023211023', tugasTambahan: 'Pembina Pramuka Putra, Pembina Ekskul Basket, Piket KBM' },
    'M1': { name: 'Dra. Waris Meiny S.', subject: 'Matematika', nip: '197005112008012014', tugasTambahan: 'Wali Kelas XI-7' },
    'M2': { name: 'Aqso Taufan Apino, M.Pd.', subject: 'Matematika', nip: '197110262017081001', tugasTambahan: 'Koor. MGMP Matematika, Wali Kelas XI-3' },
    'M3': { name: 'Hardiyanto, S.Pd.', subject: 'Matematika', nip: '198605032019031004', tugasTambahan: 'Wakil Akademik' },
    'M4': { name: 'Syaiful Bahri, M.Pd.', subject: 'Matematika', nip: '199105232020121008', tugasTambahan: 'Wali Kelas XII-1' },
    'Bg1': { name: 'Bina Rahayu Setyasih, S.Pd.', subject: 'Biologi', nip: '199303282019032015', tugasTambahan: 'Staf Akademik, Ketua MGMP Biologi, Koordinator PjBL XII-1 & XII-2, Wali Kelas X-2' },
    'Bg2': { name: 'Ria Lestari S.Pd', subject: 'Biologi', nip: '199212202020122028', tugasTambahan: 'Pembina ekskul Modern Dance, Piket KBM, Koordinator PjBL XI-7 & XI-8' },
    'Bi4': { name: 'Ria Lestari S.Pd', subject: 'Bahasa Indonesia', nip: '199212202020122028', tugasTambahan: 'Pembina ekskul Modern Dance, Piket KBM, Koordinator PjBL XI-7 & XI-8' },
    'K1': { name: 'Drs. Amudi Lumbantoruan', subject: 'Kimia', nip: '196912262017081001', tugasTambahan: 'Koord. MGMP Kimia, Wali Kelas XI-2, Staf Kesiswaan dan Humas' },
    'K2': { name: 'Yahdiana, S. Pd', subject: 'Kimia', nip: '196608022023212001', tugasTambahan: 'Piket KBM' },
    'Pw1': { name: 'Yahdiana, S. Pd', subject: 'PKWU', nip: '196608022023212001', tugasTambahan: 'Piket KBM' },
    'K3': { name: 'Gilang Nurfajarudin, S.Pd.', subject: 'Kimia', nip: '198405102022211026', tugasTambahan: 'Koordinator MGMP PKWU, Staff Akademik, Pembina ekskul Marching Band, Wali Kelas X-5, Koordinator PjBL X-5 & X-6' },
    'Pw2': { name: 'Karnu, S.E.', subject: 'PKWU', nip: '197204122024211006', tugasTambahan: 'Pembina ekskul Bela Diri (Silat)' },
    'Bi3': { name: 'Karnu, S.E.', subject: 'Bahasa Indonesia', nip: '197204122024211006', tugasTambahan: 'Pembina ekskul Bela Diri (Silat)' },
    'E1': { name: 'Dra. Niken Sutiyaningsih, M.Pd.', subject: 'Ekonomi', nip: '196904302008012011', tugasTambahan: 'Koord. MGMP Ekonomi, Wali Kelas XII-3, Piket KBM' },
    'E2': { name: 'Erna Farikah, S.Pd.', subject: 'Ekonomi', nip: '197401312017082001', tugasTambahan: 'Staf Kesiswaan dan Humas, Wali Kelas X-6' },
    'E3': { name: 'Rafiani, S.Pd., M.M.', subject: 'Ekonomi', nip: '198105292022212031', tugasTambahan: 'Piket KBM, Pembina Ekskul Teater' },
    'Pw3': { name: 'Rafiani, S.Pd., M.M.', subject: 'PKWU', nip: '198105292022212031', tugasTambahan: 'Piket KBM, Pembina Ekskul Teater' },
    'F1': { name: 'Juni Sudibyo, S.Pd.', subject: 'Fisika', nip: '197106161998021000', tugasTambahan: 'Wakil Sarpras Humas' },
    'F2': { name: 'Sri Subekti, S.Pd.', subject: 'Fisika', nip: '197009302017082002', tugasTambahan: 'Piket KBM, Koordinator PjBL XI-1 & XI-2, Pembina Ekskul Alistra, Koor. MGMP Fisika' },
    'F3': { name: 'Kuncoro Tri Muryanto, M.Pd.', subject: 'Fisika', nip: '198608052019031003', tugasTambahan: 'Wali Kelas XII-4, Koordinator PjBL XII-3, XII-4 & XII-5, Pembina ekskul KIR' },
    'Sj3': { name: 'Kuncoro Tri Muryanto, M.Pd.', subject: 'Sejarah', nip: '198608052019031003', tugasTambahan: 'Wali Kelas XII-4, Koordinator PjBL XII-3, XII-4 & XII-5, Pembina ekskul KIR' },
    'F4': { name: 'Ali Rapsanjani, S.Pd.', subject: 'Fisika', nip: '199003072020121010', tugasTambahan: 'Kepala Laboratorium, Koordinator PjBL X-3 & X-4, Pembina ekskul Pattupala' },
    'Sj4': { name: 'Ali Rapsanjani, S.Pd.', subject: 'Sejarah', nip: '199003072020121010', tugasTambahan: 'Kepala Laboratorium, Koordinator PjBL X-3 & X-4, Pembina ekskul Pattupala' },
    'S1': { name: 'Tendy Christanto, S.Pd.', subject: 'Sosiologi', nip: '199001082022211005', tugasTambahan: 'Pembina ekskul Band' },
    'S2': { name: 'Muhammad Novel, S.Pd.', subject: 'Sosiologi', nip: '198211252022211024', tugasTambahan: 'Wali Kelas X-3, Pembina OSIS, Koordinator MGMP Sosiologi' },
    'Sj5': { name: 'Muhammad Novel, S.Pd.', subject: 'Sejarah', nip: '198211252022211024', tugasTambahan: 'Wali Kelas X-3, Pembina OSIS, Koordinator MGMP Sosiologi' },
    'Sj1': { name: 'Rinta Sarasati, S.Pd.', subject: 'Sejarah', nip: '197411252008012013', tugasTambahan: 'Staf Sarpras dan Administrasi, Koordinator MGMP Sejarah, Wali Kelas XII-5, Piket KBM' },
    'Sj2': { name: 'Tri Sumardiati, M.Pd.', subject: 'Sejarah', nip: '197711032023212006', tugasTambahan: 'Pembina ekskul Paskibra, Wali Kelas X-8, Koordinator PjBL X-7 & X-8, Piket KBM' },
    'G1': { name: 'Ida Royani, S.Pd.', subject: 'Geografi', nip: '197412212000032005', tugasTambahan: 'Pembina ekskul Saman, Piket KBM, Wali Kelas XI-8' },
    'G2': { name: 'Laili Hadiati, M.Pd.I.', subject: 'Geografi', nip: '197307152008012022', tugasTambahan: 'Pembina Pramuka Putri, Piket KBM, Wali Kelas XI-7' },
    'G3': { name: 'Rudi Laksono, S.Pd.', subject: 'Geografi', nip: '19680322016111001', tugasTambahan: 'Koord MGMP Geografi, Piket KBM, Wali Kelas XI-6' },
    'Pn1': { name: 'Suhendi, M.Pd.', subject: 'PPkn', nip: '197303192008011016', tugasTambahan: 'Waka Kesiswaan dan Humas' },
    'Pn2': { name: 'Dra. Rista Nababan', subject: 'PPkn', nip: '196607101993032004', tugasTambahan: 'Koordinator MGMP Pancasila, Wali Kelas XI-1' },
    'Bi1': { name: 'Dra. Supadmi, M.Pd.', subject: 'Bahasa Indonesia', nip: '196806302017062001', tugasTambahan: 'Wali Kelas XII-6, Koordinator MGMP Bahasa Indonesia' },
    'Bi2': { name: 'Mochti Lestari', subject: 'Bahasa Indonesia', nip: '196711212017062000', tugasTambahan: '' },
    'I1': { name: 'Zakiyah, S.Pd.', subject: 'Bahasa Inggris', nip: '197805012006042004', tugasTambahan: 'Wali Kelas XI-4, Piket KBM, Pembina ekskul LC' },
    'I2': { name: 'Umayah, S.Pd.', subject: 'Bahasa Inggris', nip: '197601142014122001', tugasTambahan: 'Pembina ekskul Fordesi, Piket KBM, Koordinator MGMP Bahasa Inggris, Wali Kelas XII-8' },
    'I3': { name: 'Mutia Resfi Kinasih, S.Pd.', subject: 'Bahasa Inggris', nip: '199505082020122022', tugasTambahan: 'Staf Akademik, Pembina ekskul PMR / UKS, Wali Kelas X-4' },
    'Tl1': { name: 'Deden Suryana, S.Pd.', subject: 'Informatika', nip: '197903022014121002', tugasTambahan: 'Koordinator MGMP Informatika, Pembina ekskul Robotik, Wali Kelas X-7, Staf Sarpras dan Administrasi' },
    'Tl2': { name: 'Hamzah Purwanto, S.Kom.', subject: 'Informatika', nip: '198904022022211010', tugasTambahan: 'Pembina ekskul Fokus' },
    'BK1': { name: 'Nina Muziana, S.Pd.', subject: 'Bimbingan Konseling', nip: '196605172016102000', tugasTambahan: 'Koordinator MGBK, Piket KBM, Wali Kelas XII-2' },
    'BK2': { name: 'Neni Rohayati, S.Pd.', subject: 'Bimbingan Konseling', nip: '196610112016102001', tugasTambahan: 'Piket KBM' },
    'Sb1': { name: 'Sukma Parousia Pieters, S.Pd.', subject: 'Seni Budaya', nip: '199202012019031013', tugasTambahan: 'Pembina ekskul Fabavosa, Koordinator MGMP Seni Budaya, Koordinator PjBL XII-6, XII-7 & XII-8' },
    'Sb2': { name: 'Desby Nurischa, S.Pd.', subject: 'Seni Budaya', nip: '199212252019032010', tugasTambahan: 'Kepala Perpustakaan, Pembina ekskul Tari Tradisional, Koordinator PjBL XI-3 & XI-4, Piket KBM' }
};

const rawSchedule = `
Senin
1|Bi2,I3,G1,Bg1,S2,Bi3,BK2,E2|A3,I1,M2,F2,K3,E3,O2,M1
2|Bi2,I3,G1,Bg1,S2,Bi3,BK2,E2|A3,I1,M2,F2,K3,E3,O2,M1
3|F3,I3,G1,Bg1,S2,O1,F4,F2|Bi1,I1,K2,F2,K3,Pn2,BK2,E3
4|F3,M3,E1,Tl1,Bi3,O1,F4,Bi2|Bi1,A3,K2,K3,M2,Pn2,G1,E3
5|F3,M3,E1,Tl1,Bi3,E2,F4,Bi2|M1,A3,Pn2,K3,M2,Bi4,G1,E3
6|K3,Sj1,E1,F3,M3,E2,Sj2,K2|M1,F2,Pn2,Pw3,M2,Bi4,Tl1,Tl2
7|K3,Sj1,A2,F3,M3,E2,Sj2,K2|F4,F2,Bi2,Pw3,G3,A3,Tl1,Tl2
8|K3,Sj1,A2,F3,Bg1,G2,Sj2,K2|F4,Bg2,Bi2,M2,G3,A3,S1,G1
9|BK2,Pn2,Bi3,Pw1,Bg1,G2,Tl1,A2|Sj3,Bg2,A3,M2,Bi2,M1,S1,G1
10|BK2,Pn2,Bi3,Pw1,Bg1,G2,Tl1,A2|Sj3,Bg2,A3,M2,Bi2,M1,S1,G1

Selasa
1|S2,BK2,F3,Pn2,M3,Bg2,E2,O1|O2,K1,Bi2,Sb2,M1,G3,Tl1,E3
2|S2,BK2,F3,Pn2,M3,Bg2,E2,O1|O2,K1,Bi2,Sb2,M1,G3,Tl1,E3
3|S2,K3,F3,Sj2,I3,Bg2,E2,M2|I1,Pn2,Sj1,M1,F2,G3,Tl1,O2
4|M3,K3,O1,Sj2,I3,S2,K2,M2|I1,Pn2,Sj1,M1,F2,Tl1,Bi2,O2
5|M3,K3,O1,Sj2,I3,S2,K2,G2|M2,A3,F2,Tl1,Bi2,S1,I1,K2
6|I3,A2,M3,K3,F4,S2,K2,G2|Pn2,Bi1,M2,M2,F2,Sb2,S1,I1
7|I3,A2,M3,K3,F4,Bi3,Bi2,G2|Pn2,Bi1,M2,M2,F2,Sb2,S1,I1
8|I3,S2,Sj1,K3,F4,Bi3,Bi2,I2|M2,M2,Sb2,Tl1,Bi2,G3,S1,I1
9|A2,S2,Sj1,Bi3,Pw1,Pn3,Pn2,I2|M2,M2,Sb2,Tl1,Bi2,G3,Sj2,M1
10|A2,S2,Sj1,Bi3,Pw1,Pn3,Pn2,I2|M2,M2,Sb2,Tl1,Bi2,G3,Sj2,M1

Rabu
1|Pw2,F3,Tl2,M3,O1,I3,A2,Bi2|K1,Pw3,I1,M2,K3,O2,M1,G1
2|Pw2,F3,Tl2,M3,O1,I3,A2,Bi2|K1,Pw3,I1,M2,K3,O2,M1,G1
3|Bg1,F3,K3,G1,Sj2,I3,O1,Bg2|Bi2,K1,M2,I1,Sj5,Pn2,E3,K2
4|Bg1,Bi2,K3,G1,Sj2,Tl1,O1,Bg2|Sb2,M2,M2,M1,Sj5,Pn2,E3,K2
5|Bg1,Bi2,K3,G1,Sj2,Tl1,S2,Bg2|Sb2,BK1,M1,I1,M2,E3,A3,Tl2
6|E3,Tl2,I3,E2,Tl1,K3,S2,BK2|Bg2,K1,K2,I1,Pw2,G3,A3,Pn2
7|E3,Tl2,I3,E2,Tl1,K3,S2,BK2|Bg2,K1,K2,I1,Pw2,G3,Bi2,Pn2
8|E3,Bg1,I3,E2,G1,K3,G2,S2|Bg2,K1,K2,G3,Pw2,I1,Bi2,BK2
9|Pn2,Bg1,Pw1,Bi3,G1,BK2,G2,S2|M2,Bg2,Tl1,G3,Bi2,I1,Sj2,M1
10|Pn2,Bg1,Pw1,Bi3,G1,BK2,G2,S2|M2,Bg2,Tl1,G3,Bi2,I1,Sj2,M1

Kamis
1|M3,G1,Bi3,BK2,K3,A2,I1,M2|K1,O2,M1,Pn2,A3,Tl1,Sb2,Bi2
2|M3,G1,Bi3,BK2,K3,A2,I1,M2|K1,O2,M1,Pn2,A3,Tl1,Sb2,Bi2
3|Bi2,G1,BK2,S2,K3,Sj2,I1,Pn2|F4,F2,M2,F2,O2,M1,Sj3,Sb2
4|Bi2,O1,BK2,S2,E2,Sj2,Pw2,Pn2|F4,F2,M2,F2,O2,M1,Sj3,Sb2
5|G1,O1,Bg1,S2,E2,Sj2,Pw2,F4|F1,F4,M2,F2,G3,BK2,S1,I1
6|G1,E1,Bg1,M3,E2,F4,M2,F2|M3,I1,Sb2,F2,BK1,G3,Sj5,M1
7|G1,E1,Bg1,M3,Bi3,F4,M2,F2|BK1,Pn2,Pw3,Bi2,M1,I1,Sj5,I1
8|Sj1,E1,S2,I3,Bi3,F4,Bg2,Sb2|BK1,Bi1,F2,Pw3,Sb2,M1,BK2,G1
9|Sj1,Bi2,S2,I3,BK2,M2,Bg2,Sj2|Bi1,Bi1,G3,M5,I2,S1,BK1,G1
10|Sj1,Bi2,S2,I3,BK2,M2,Bg2,Sj2|Bi1,Bi1,G3,M5,I2,S1,BK1,G1

Jumat
1|Tl2,Pw1,M3,O1,A2,M2,Bi2,Pw2|M1,Bi1,F2,K3,O2,Pn2,A3,BK2
2|Tl2,Pw1,M3,O1,A2,M2,Bi2,Pw2|M1,Bi1,F2,K3,O2,Pn2,A3,BK2
3|O1,M3,Pn2,A2,Pn3,Pw1,M2,Tl1|Pw2,M1,O2,K3,F2,Sb2,E3,Bi2
4|O1,M3,Pn2,A2,Pn3,Pw1,M2,Tl1|Pw2,M1,O2,BK1,F2,Sb2,E3,Bi2
5|-|-|-|-|-|-|-|-|Tl1,F1,M1,F3,E1,Bi1,S1,Tl2
6|-|-|-|-|-|-|-|-|Tl1,I3,M1,F3,E1,Bi1,S1,Tl2
7|-|-|-|-|-|-|-|-|Tl1,I3,M1,F3,E1,Bi1,S1,Tl2
8|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-
9|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-
`;

const lines = rawSchedule.trim().split('\n');
let currentDay = '';

const classIds = [
    'X-1','X-2','X-3','X-4','X-5','X-6','X-7','X-8',
    'XI-1','XI-2','XI-3','XI-4','XI-5','XI-6','XI-7','XI-8'
];

const parsedSchedules = {};
classIds.forEach(c => parsedSchedules[c] = { daySchedules: {} });

const times = [
    "06.30-07.20", // 1
    "07.20-08.00", // 2
    "08.00-08.40", // 3
    "08.40-09.20", // 4
    "09.40-10.20", // 5
    "10.20-11.00", // 6
    "11.00-11.40", // 7
    "13.05-13.45", // 8
    "13.45-14.25", // 9
    "14.25-15.05"  // 10
];

lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    if (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].includes(line)) {
        currentDay = line.toLowerCase();
        return;
    }

    const parts = line.split('|');
    if (parts.length !== 3) return;
    
    const jamKe = parseInt(parts[0]);
    const xClasses = parts[1].split(',');
    const xiClasses = parts[2].split(',');

    const allClasses = [...xClasses, ...xiClasses];

    allClasses.forEach((teacherCode, idx) => {
        const classId = classIds[idx];
        if (!parsedSchedules[classId]) return;
        if (!parsedSchedules[classId].daySchedules[currentDay]) {
            parsedSchedules[classId].daySchedules[currentDay] = [];
        }
        
        if (teacherCode && teacherCode !== '-') {
            parsedSchedules[classId].daySchedules[currentDay].push({
                jamKe: jamKe,
                time: times[jamKe - 1] || '',
                teacherId: teacherCode,
                subject: teachersMap[teacherCode] ? teachersMap[teacherCode].subject : 'Umum'
            });
        }
    });
});

const finalSchedules = [];
classIds.forEach(classId => {
    ['senin', 'selasa', 'rabu', 'kamis', 'jumat'].forEach(day => {
        finalSchedules.push({
            day: day,
            classId: classId,
            slots: parsedSchedules[classId].daySchedules[day] || []
        });
    });
});

writeData('schedules', finalSchedules);

// Now update users.json
const users = readData('users');
const updatedUsers = users.map(u => {
    if (u.role === 'guru') {
        // Collect all classes taught
        const teachingClasses = new Set();
        finalSchedules.forEach(scheduleRow => {
            scheduleRow.slots.forEach(slot => {
                if (slot.teacherId === u.kodeGuru) {
                    teachingClasses.add(scheduleRow.classId);
                }
            });
        });
        
        // Ensure teacher mapping subject matches if available
        if (teachersMap[u.kodeGuru]) {
            u.subjects = [teachersMap[u.kodeGuru].subject];
            u.name = teachersMap[u.kodeGuru].name;
            u.nip = teachersMap[u.kodeGuru].nip;
            u.tugasTambahan = teachersMap[u.kodeGuru].tugasTambahan;
        }

        u.teachingClasses = Array.from(teachingClasses);
    }
    return u;
});

// Create missing teachers
Object.keys(teachersMap).forEach(code => {
    const existing = updatedUsers.find(u => u.kodeGuru === code);
    if (!existing) {
        const teachingClasses = new Set();
        finalSchedules.forEach(scheduleRow => {
            scheduleRow.slots.forEach(slot => {
                if (slot.teacherId === code) {
                    teachingClasses.add(scheduleRow.classId);
                }
            });
        });

        updatedUsers.push({
            id: code,
            kodeGuru: code,
            username: code.toLowerCase(),
            password: 'guru123',
            name: teachersMap[code].name,
            role: 'guru',
            subjects: [teachersMap[code].subject],
            isWaliKelas: teachersMap[code].tugasTambahan && teachersMap[code].tugasTambahan.includes('Wali Kelas'),
            waliKelasId: teachersMap[code].tugasTambahan && teachersMap[code].tugasTambahan.includes('Wali Kelas') ? teachersMap[code].tugasTambahan.match(/Wali Kelas\s+([A-Z0-9-]+)/i)?.[1] || null : null,
            teachingClasses: Array.from(teachingClasses),
            nip: teachersMap[code].nip || '',
            tugasTambahan: teachersMap[code].tugasTambahan || '-'
        });
    } else {
        // Update Wali kelas info
        existing.isWaliKelas = teachersMap[code].tugasTambahan && teachersMap[code].tugasTambahan.includes('Wali Kelas');
        existing.waliKelasId = existing.isWaliKelas ? teachersMap[code].tugasTambahan.match(/Wali Kelas\s+([A-Z0-9-]+)/i)?.[1] || null : null;
    }
});

// Clean up duplicate admin/special users, ensure we preserve admin
const uniqueUsers = [];
const seenIds = new Set();
updatedUsers.forEach(u => {
    if (!seenIds.has(u.id)) {
        seenIds.add(u.id);
        uniqueUsers.push(u);
    }
});

writeData('users', uniqueUsers);
console.log('Successfully applied SMAN 47 REVISI 7 schedule data to schedules.json and users.json');
