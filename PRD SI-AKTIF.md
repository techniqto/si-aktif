# SI-AKTIF — Product Requirements Document & Implementation Plan
## Sistem Absensi Kehadiran Teknologi Informasi Forsev | SMAN 47 Jakarta

---

## 1. Executive Summary

**SI-AKTIF** adalah platform web-based untuk manajemen absensi kehadiran siswa di SMAN 47 Jakarta. Sistem ini mendukung **dua jenis absensi** yang mencerminkan alur nyata di sekolah:

1. **Absensi Wali Kelas** — Dilakukan sekali di pagi hari oleh wali kelas, mencatat kehadiran harian siswa
2. **Absensi Guru Mata Pelajaran** — Dilakukan oleh setiap guru mapel saat masuk ke kelas sesuai jadwal, mencatat kehadiran per sesi pelajaran

### Tujuan Utama
- Digitalisasi absensi harian (Wali Kelas) **dan** per jam pelajaran (Guru Mapel)
- Rekap otomatis per siswa per bulan: Hadir, Sakit, Izin, Alfa — untuk kedua jenis absensi
- Visualisasi tren kehadiran siswa dari bulan ke bulan
- Multi-role access: **Admin**, **Wali Kelas**, dan **Guru Mapel**
- Data saling terhubung: absensi wali kelas vs guru mapel bisa dicocokkan

---

## 2. User Roles & Access

### 👤 Admin
| Capability | Description |
|---|---|
| Manajemen Akun Guru | CRUD akun guru (wali kelas & guru mapel), reset password |
| Manajemen Kelas | Tambah/edit/hapus kelas dan tahun ajaran |
| Manajemen Siswa | Tambah/edit/hapus data siswa, assign ke kelas |
| Manajemen Jadwal | Input/edit jadwal pelajaran per kelas per hari |
| Lihat Rekap Seluruh Kelas | Dashboard overview semua kelas, filter per tingkat |
| Export Data | Download rekap dalam format yang readable |
| Kontrol Sistem | Pengaturan tahun ajaran, semester |

### 👨‍🏫 Wali Kelas (juga seorang guru mapel)
| Capability | Description |
|---|---|
| Input Absensi Harian | Panggil siswa 1 per 1 di pagi hari, tandai status kehadiran |
| Input Absensi Mapel | Input absensi saat mengajar di kelas manapun yang diampu |
| Lihat Rekap Kelas Wali | Rekap bulanan kelas yang diwalikan (harian + per mapel) |
| Lihat Grafik Tren | Chart kehadiran per siswa dari bulan ke bulan |
| Edit Absensi | Koreksi data absensi hari/sesi tertentu |

### 📚 Guru Mata Pelajaran
| Capability | Description |
|---|---|
| Input Absensi Mapel | Input absensi saat mengajar sesuai jadwal di kelas tertentu |
| Lihat Rekap Per Mapel | Rekap kehadiran siswa khusus mata pelajaran yang diampu |
| Lihat Grafik Tren Mapel | Chart kehadiran per siswa per mata pelajaran |

---

## 3. Dua Jenis Absensi

> [!IMPORTANT]
> Ini adalah perbedaan fundamental dari desain sebelumnya. Sistem sekarang menangani **dua alur absensi** yang berbeda.

### 3A. 🌅 Absensi Wali Kelas (Harian)
- Dilakukan **sekali per hari** di jam pertama (06.30 - 07.00)
- Wali kelas membuka kelas yang diwalikan → panggil siswa satu per satu
- Status: **Hadir / Sakit / Izin / Alfa**
- Ini menjadi **sumber utama** kehadiran harian siswa
- Rekap bulanan: berapa hari siswa hadir, sakit, izin, alfa dari total hari efektif

### 3B. 📖 Absensi Guru Mata Pelajaran (Per Sesi)
- Dilakukan **setiap sesi pelajaran** oleh guru mapel yang mengajar
- Guru mapel login → pilih kelas & jam ke → panggil siswa satu per satu
- Status: **Hadir / Sakit / Izin / Alfa / Terlambat**
- Bisa berbeda dari absensi wali kelas (contoh: siswa hadir pagi tapi bolos jam ke-5)
- Rekap bulanan per mapel: kehadiran di mata pelajaran X selama sebulan

### Perbandingan

| Aspek | Absensi Wali Kelas | Absensi Guru Mapel |
|---|---|---|
| **Frekuensi** | 1x per hari | Setiap sesi pelajaran |
| **Pelaku** | Wali kelas | Guru mapel yang mengajar |
| **Cakupan** | Kehadiran di sekolah | Kehadiran di mata pelajaran |
| **Status** | Hadir/Sakit/Izin/Alfa | Hadir/Sakit/Izin/Alfa/Terlambat |
| **Contoh Use Case** | Siswa tidak masuk sekolah | Siswa hadir di sekolah tapi bolos pelajaran tertentu |

---

## 4. Core Features

### 4.1 🔐 Login System
- Login dengan **kode guru** sebagai username (sesuai data sekolah)
- Role-based redirect berdasarkan role:
  - Admin → Dashboard Admin
  - Guru yang juga Wali Kelas → Dashboard Wali Kelas (bisa switch ke mode Guru Mapel)
  - Guru Mapel (non-wali) → Dashboard Guru Mapel
- Session management dengan localStorage

#### Demo Accounts (berdasarkan data SMAN 47 Jakarta)

**Admin:**
| Username | Password | Nama |
|---|---|---|
| `admin` | `admin123` | Administrator Sistem |

**Guru (Wali Kelas) — contoh beberapa:**
| Username | Password | Nama | Wali Kelas | Mata Pelajaran |
|---|---|---|---|---|
| `O1` | `guru123` | Sigit Pamungkas, S.Or. | X-1 | Penjas-Orkes |
| `S1` | `guru123` | Tendy Christanto, S.Pd. | X-2 | Sosiologi |
| `Bg1` | `guru123` | Bina Rahayu Setyasih, S.Pd. | X-3 | Biologi |
| `I3` | `guru123` | Mutu Resfi Kinasih, S.Pd. | X-4 | Bahasa Inggris |
| `K4Pw1` | `guru123` | Gilang Nurbijanudin, S.Pd. | X-5 & X-6 | Kimia/PKWU |
| `TI1` | `guru123` | Dedon Suryana, S.Pd. | X-7 | Informatika |
| `Sj2Bi4` | `guru123` | Tri Sumardisti, M.Pd. | X-8 | Sejarah/B.Indo |
| `M5` | `guru123` | Syaiful Bahri, M.Pd. | XI-1 | Matematika |
| `K1` | `guru123` | Heni Purwaningsih, M.Pd. | XI-2 | Kimia |
| `M3` | `guru123` | Apto Taufan Apteno, M.Pd. | XI-3 | Matematika |
| `I1` | `guru123` | Zakiyah, S.Pd. | XI-4 | Bahasa Inggris |
| `Bi1` | `guru123` | Dra. Supadmi, M.Pd. | XI-6 | Bahasa Indonesia |
| `M2` | `guru123` | Dra. Waris Meiny, S. | XI-7 | Matematika |
| `I2` | `guru123` | Umayah, S.Pd. | XII-8 | Bahasa Inggris |

**Guru Mapel (tanpa kelas wali) — contoh beberapa:**
| Username | Password | Nama | Mata Pelajaran |
|---|---|---|---|
| `M1` | `guru123` | Hj. Ati Susilawatie, S.Pd., M.M. | Matematika Umum |
| `M4` | `guru123` | Hardiyanto, S.Pd. | Matematika Umum |
| `A1` | `guru123` | Firman, M.Ud. | PAI |
| `A2` | `guru123` | Ulfiyani, S.Pd. | PAI |
| `K2` | `guru123` | Drs. Amudi Lumbantoruan | Kimia |
| `F1` | `guru123` | Juni Sudiyo, S.Pd. | Fisika |
| `F2` | `guru123` | Sri Subektil, S.Pd. | Fisika |
| `E1` | `guru123` | Dra. Niken Sutiyaningsih, M.Pd. | Ekonomi |
| `G1` | `guru123` | Ida Royani, S.Pd. | Geografi |
| `Pn1` | `guru123` | Suhendi, M.Pd. | Pend. Pancasila |
| `TI2` | `guru123` | Hamzah Purwanto, S.Kom. | Informatika |

> [!NOTE]
> Semua 50+ guru dari data SMAN 47 akan di-seed di sistem. Username = kode guru, password default = `guru123`.

### 4.2 📋 Input Absensi Wali Kelas (Harian)
- Wali kelas login → otomatis tampil kelas yang diwalikan
- Pilih tanggal (default: hari ini)
- Daftar semua siswa kelas tersebut muncul
- **Panggil satu per satu** — klik nama siswa untuk cycle status:
  - ⬜ **Belum Diabsen** (default abu-abu)
  - ✅ **Hadir** (hijau)
  - 🤒 **Sakit** (kuning)
  - 📝 **Izin** (biru)
  - ❌ **Alfa** (merah)
- Progress bar menunjukkan berapa siswa sudah di-absen
- Tombol "Simpan Absensi Harian" setelah semua siswa tercatat
- Badge: "ABSENSI WALI KELAS" untuk membedakan dari mapel

### 4.3 📖 Input Absensi Guru Mapel (Per Sesi)
- Guru mapel login → lihat jadwal mengajar hari ini
- Pilih kelas & jam pelajaran ke berapa (atau auto-detect dari jadwal)
- Daftar siswa kelas tersebut muncul
- **Panggil satu per satu** — klik nama siswa untuk cycle status:
  - ⬜ **Belum Diabsen** (default abu-abu)
  - ✅ **Hadir** (hijau)
  - 🤒 **Sakit** (kuning)
  - 📝 **Izin** (biru)
  - ❌ **Alfa** (merah)
  - 🕐 **Terlambat** (oranye) — status tambahan khusus mapel
- Info di atas: Mata Pelajaran, Kelas, Jam Ke, Tanggal
- Badge: "ABSENSI MATA PELAJARAN" untuk membedakan dari wali kelas
- Tombol "Simpan Absensi Mapel"

### 4.4 📊 Rekap Bulanan Otomatis
Dua tab rekap yang berbeda:

#### Tab 1: Rekap Harian (Wali Kelas)
- Pilih kelas → pilih bulan → tabel rekap
- Per siswa: Total Hadir, Sakit, Izin, Alfa, **% Kehadiran**
- Color-coded rows:
  - ≥ 90% → 🟢 Baik
  - 75-89% → 🟡 Perlu Perhatian
  - < 75% → 🔴 Kritis
- Summary: rata-rata kelas, siswa terbaik, siswa perlu perhatian

#### Tab 2: Rekap Per Mata Pelajaran (Guru Mapel)
- Pilih kelas → pilih mapel → pilih bulan → tabel rekap
- Per siswa: Total sesi, Hadir, Sakit, Izin, Alfa, Terlambat, **% Kehadiran Mapel**
- Bisa dibandingkan: kehadiran siswa X di Matematika vs Kimia vs Biologi dll
- Highlight siswa yang hadir di absensi wali kelas tapi alfa di mapel tertentu (bolos pelajaran)

### 4.5 📈 Grafik Tren Kehadiran
- **Tren Harian (Wali Kelas)**: Line chart % kehadiran bulan ke bulan per siswa
  - Indikator: ↑ Meningkat, ↓ Menurun, → Stabil
- **Tren Per Mapel**: Line chart % kehadiran per mata pelajaran
  - Multi-line: satu line per mapel, sehingga terlihat mapel mana yang sering di-bolos
- **Per Kelas**: Bar chart perbandingan kehadiran antar bulan
- **Admin Overview**: Pie chart distribusi status, bar chart perbandingan antar kelas/angkatan
- **Anomaly Detection**: Highlight siswa yang hadir di wali kelas tapi sering alfa di mapel tertentu

### 4.6 🏫 Dashboard Admin
- Stat cards: Total siswa, guru, kelas, rata-rata kehadiran hari ini
- Ringkasan kehadiran per tingkat (10/11/12)
- Top 5 siswa kehadiran tertinggi & terendah
- Daftar kelas yang belum absensi hari ini
- Quick access ke semua fitur admin

### 4.7 👨‍🏫 Dashboard Wali Kelas
- Info kelas yang diwalikan + jumlah siswa
- **Quick Action**: "Absensi Pagi Hari Ini" (1 klik langsung ke input)
- Status absensi hari ini: sudah / belum
- Siswa dengan kehadiran kritis (< 75%)
- Jadwal mengajar hari ini (sebagai guru mapel)

### 4.8 📚 Dashboard Guru Mapel
- Jadwal mengajar hari ini (kelas mana, jam berapa)
- Quick action per kelas: "Input Absensi [Mapel] — Kelas [X]"
- Status: kelas mana yang sudah diabsen, mana yang belum
- Ringkasan kehadiran minggu ini per kelas yang diampu

---

## 5. Data Architecture

### Data Entities (localStorage JSON)

```javascript
// Guru/Users — berdasarkan data riil SMAN 47
siaktif_users: [
  {
    id: "O1",
    kodeGuru: "O1",                    // Kode guru dari data sekolah
    username: "O1",                     // Login = kode guru
    password: "guru123",
    name: "Sigit Pamungkas, S.Or.",
    role: "guru",                       // "admin" | "guru"
    isWaliKelas: true,
    waliKelasId: "X-1",               // null jika bukan wali kelas
    subjects: ["Penjas-Orkes"],        // Bisa > 1 mapel
    teachingClasses: ["X-1", "X-2", "X-3", ...],  // Kelas yang diajar
    tugasTambahan: ["Koord. MGMP Penjas-Orkes", "Pembina Jalakot Basket"]
  }
]

// Kelas
siaktif_classes: [
  { id: "X-1", name: "X-1", grade: 10, academicYear: "2025/2026" }
]

// Siswa
siaktif_students: [
  { id: "S001", name: "Ahmad Fauzi", nis: "12345", classId: "X-1", gender: "L" }
]

// Jadwal Pelajaran — berdasarkan jadwal resmi
siaktif_schedule: [
  {
    day: "senin",          // senin-jumat
    classId: "X-1",
    slots: [
      { jamKe: 0, time: "06.30-07.20", type: "upacara" },
      { jamKe: 1, time: "07.20-08.00", teacherId: "Sj3", subject: "Sejarah" },
      { jamKe: 2, time: "08.00-08.40", teacherId: "Sj3", subject: "Sejarah" },
      { jamKe: 3, time: "08.40-09.20", teacherId: "A3", subject: "PAI" },
      // ... dst sesuai jadwal
    ]
  }
]

// Absensi Wali Kelas (Harian)
siaktif_attendance_daily: [
  {
    id: "ATD-20260601-X1",
    date: "2026-06-01",
    classId: "X-1",
    waliKelasId: "O1",
    type: "wali_kelas",
    records: [
      { studentId: "S001", status: "hadir" },     // hadir|sakit|izin|alfa
      { studentId: "S002", status: "alfa" },
    ]
  }
]

// Absensi Guru Mapel (Per Sesi)
siaktif_attendance_subject: [
  {
    id: "ATS-20260601-X1-M1-3",
    date: "2026-06-01",
    classId: "X-1",
    teacherId: "M1",
    subject: "Matematika",
    jamKe: 3,                          // Jam pelajaran ke berapa
    type: "guru_mapel",
    records: [
      { studentId: "S001", status: "hadir" },     // hadir|sakit|izin|alfa|terlambat
      { studentId: "S002", status: "terlambat" },
    ]
  }
]

// Settings
siaktif_settings: {
  schoolName: "SMAN 47 Jakarta",
  academicYear: "2025/2026",
  semester: "Genap",
  kepalaSekolah: "Drs. Anwar Musadat, M.Pd."
}
```

### Struktur Kelas SMAN 47 Jakarta

| Tingkat | Kelas | Jumlah |
|---|---|---|
| **Kelas 10** | X-1, X-2, X-3, X-4, X-5, X-6, X-7, X-8 | 8 kelas |
| **Kelas 11** | XI-1, XI-2, XI-3, XI-4, XI-5, XI-6, XI-7, XI-8 | 8 kelas |
| **Kelas 12** | XII-1, XII-2, XII-3, XII-4, XII-5, XII-6, XII-7, XII-8 | 8 kelas |
| **Total** | | **24 kelas** |

### Daftar Guru & Wali Kelas (dari Data Resmi SMAN 47)

| Kode | Nama | Mapel | Wali Kelas |
|---|---|---|---|
| S | Drs. Anwar Musadat, M.Pd. | Sosiologi | — (Kepsek) |
| A1 | Firman, M.Ud. | PAI | — |
| A2 | Ulfiyani, S.Pd. | PAI | — |
| A3 | Muhammad Makhrus, S.Pd.I | PAI | — |
| A4 | Deri Hastuti, S.S. | PAKAT | — |
| A6 | Fitri Sihombing, S.Pd. | PAK | — |
| O1 | Sigit Pamungkas, S.Or. | Penjas-Orkes | **X-1** |
| O2 | Hariyanto Gatot Nugroho, S.Pd. | Penjas-Orkes | — |
| O3 | Ardhi Putra Nugroho, S.Pd. | Penjas-Orkes | — |
| M1 | Hj. Ati Susilawatie, S.Pd., M.M. | Matematika | — |
| M2 | Dra. Waris Meiny, S. | Matematika | **XI-7** |
| M3 | Apto Taufan Apteno, M.Pd. | Matematika TL | **XI-3** |
| M4 | Hardiyanto, S.Pd. | Matematika | — (Wakil Akademik) |
| M5 | Syaiful Bahri, M.Pd. | Matematika TL | **XI-1** |
| Bg1 | Bina Rahayu Setyasih, S.Pd. | Biologi | **X-3** |
| Bg2Bi3 | Ria Lestari, S.Pd. | Biologi/B.Indo | — |
| K1 | Heni Purwaningsih, M.Pd. | Kimia | **XI-2** |
| K2 | Drs. Amudi Lumbantoruan | Kimia | — |
| K3Pw4 | Yahdana, S.Pd. | Kimia/PKWU | — |
| K4Pw1 | Gilang Nurbijanudin, S.Pd. | Kimia/PKWU | **X-5, X-6** |
| Pw2Bi2 | Karno, S.E. | PKWU/B.Indo | — |
| E1 | Dra. Niken Sutiyaningsih, M.Pd. | Ekonomi | **XI-3** |
| E2 | Erna Farkah, S.Pd. | Ekonomi | **X-6** |
| E3Pw3 | Refiani, S.Pd. | Ekonomi/PKWU | — |
| F1 | Juni Sudiyo, S.Pd. | Fisika TL/Fisika | — |
| F2 | Sri Subektil, S.Pd. | Fisika TL | — |
| F3 | Kuncoro Tri Muryanto, M.Pd. | Fisika | **XII-2** |
| F4 | Ali Rapsanjani, S.Pd. | Fisika | — |
| S1 | Tendy Christanto, S.Pd. | Sosiologi | **X-2** |
| S2 | Muhammad Novel, S.Pd. | Sosiologi | — |
| Sj1 | Rinta Sarasati, S.Pd. | Sejarah | **XII-5** |
| Sj2Bi4 | Tri Sumardisti, M.Pd. | Sejarah/B.Indo | **X-8** |
| Sj3 | Yulia Rahmah, S.Pd. | Sejarah | — |
| G1 | Ida Royani, S.Pd. | Geografi | **XI-3** |
| G2 | Laili Hadiah, M.Pd. | Geografi | — |
| G3 | Rudi Laksono, S.Pd. | Geografi | — |
| G4 | Sukawati Sri Lestari, S.Pd. | Geografi | — |
| Pn1 | Suhendi, M.Pd. | Pend. Pancasila | — |
| Pn2 | Deli Rosadi, S.Pd. | Pend. Pancasila | — |
| Pn3 | Dra. Rinta Nababan | Pend. Pancasila | — |
| Bi1 | Dra. Supadmi, M.Pd. | Bahasa Indonesia | **XI-6** |
| I1 | Zakiyah, S.Pd. | Bahasa Inggris | **XI-4** |
| I2 | Umayah, S.Pd. | Bahasa Inggris | **XII-8** |
| I3 | Mutu Resfi Kinasih, S.Pd. | Bahasa Inggris | **X-4** |
| TI1 | Dedon Suryana, S.Pd. | Informatika | **X-7** |
| TI2 | Hamzah Purwanto, S.Kom. | Informatika | — |
| TI3 | Widdy Tri Saputra, S.Kom. | Informatika | — |
| BK1 | Nina Maulana, S.Pd. | BK | — |
| BK2 | Neni Rahayati, S.Pd. | BK | — |
| Sb1 | Sukma Parousla Pistera, S.Pd. | Seni Budaya | — |
| Sb2 | Desby Nurtosha, S.Pd. | Seni Budaya | — |
| B5 | Sandy Maheswara | — | — |

### Pre-loaded Demo Data
- **1 Admin** — akun admin sekolah
- **50+ Guru** — sesuai data SMAN 47 (kode guru sebagai username)
- **24 Wali Kelas** — sudah ter-assign
- **24 Kelas** — X-1 s/d X-8, XI-1 s/d XI-8, XII-1 s/d XII-8
- **~30 siswa per kelas** (total ~720 siswa) — di-generate dengan nama Indonesia
- **Jadwal pelajaran** Senin-Jumat sesuai struktur jadwal SMAN 47
- **Data absensi 3 bulan** terakhir (Maret-Mei 2026) — baik wali kelas maupun guru mapel

---

## 6. UI/UX Design Principles

### Design System
- **Color Palette**: Dark navy (#0f172a) sidebar, white content area, accent emerald (#10b981)
- **Absensi Wali Kelas badge**: Gradient emerald-teal
- **Absensi Guru Mapel badge**: Gradient indigo-purple
- **Typography**: Google Fonts — Inter (body), Outfit (headings)
- **Components**: Glassmorphism cards, smooth transitions, micro-animations
- **Layout**: Fixed sidebar navigation + top bar + scrollable content
- **Responsive**: Desktop-first, tapi usable di tablet guru

### Navigation Structure

```
Admin:
├── Dashboard (overview 24 kelas)
├── Manajemen Guru (50+ guru + wali kelas assignment)
├── Manajemen Kelas (24 kelas)
├── Manajemen Siswa (720 siswa)
├── Jadwal Pelajaran (lihat jadwal per kelas)
├── Rekap Absensi
│   ├── Rekap Harian (Wali Kelas)
│   └── Rekap Per Mapel (Guru Mapel)
├── Grafik & Analitik
└── Pengaturan

Wali Kelas:
├── Dashboard
├── Absensi Pagi (Wali Kelas) ← HARIAN
├── Absensi Mapel (Guru Mapel) ← PER SESI
├── Rekap Kelas (Harian + Per Mapel)
├── Grafik Kehadiran
└── Profil

Guru Mapel:
├── Dashboard (jadwal hari ini)
├── Input Absensi Mapel ← PER SESI
├── Rekap Per Mapel
├── Grafik Kehadiran
└── Profil
```

### Key UX Decisions
1. **Visual distinction**: Badge warna berbeda untuk Absensi Wali Kelas (emerald) vs Guru Mapel (indigo)
2. **One-click attendance**: Klik nama siswa → cycle status (Belum → Hadir → Sakit → Izin → Alfa)
3. **Schedule-aware**: Guru mapel melihat jadwal hari ini, langsung klik untuk absensi
4. **Progress tracking**: Progress bar saat input absensi
5. **Smart defaults**: Default "Belum Diabsen", bukan auto-Hadir
6. **Cross-reference**: Di rekap, bisa lihat siswa yang hadir wali kelas tapi alfa di mapel (bolos)

---

## 7. Technical Implementation

### Technology Stack
- **Frontend**: HTML5 + Vanilla CSS + Vanilla JavaScript
- **Data Storage**: localStorage (no backend needed for demo)
- **Charts**: Chart.js via CDN
- **Icons**: Lucide Icons via CDN
- **Fonts**: Google Fonts (Inter, Outfit)

### File Structure

```
si-aktif/
├── index.html          ← Single entry point (login + app)
├── css/
│   └── styles.css      ← Complete design system & components
├── js/
│   ├── app.js          ← Main application controller & routing
│   ├── auth.js         ← Authentication & session management
│   ├── data.js         ← Data layer (localStorage CRUD + seed data + jadwal)
│   ├── admin.js        ← Admin dashboard & management views
│   ├── teacher.js      ← Wali Kelas & Guru Mapel views (attendance input)
│   └── charts.js       ← Chart.js wrapper for analytics
└── assets/
    └── (generated images if needed)
```

---

## 8. Proposed Changes

### [NEW] [index.html](file:///C:/Users/MSI/.gemini/antigravity/scratch/si-aktif/index.html)
- Single-page application entry point
- Login form with SMAN 47 branding & SI-AKTIF logo
- Main app shell: sidebar + topbar + content area
- All page templates as hidden sections
- CDN links for Chart.js, Lucide Icons, Google Fonts
- Separate sections for Absensi Wali Kelas dan Absensi Guru Mapel

### [NEW] [styles.css](file:///C:/Users/MSI/.gemini/antigravity/scratch/si-aktif/css/styles.css)
- CSS custom properties (design tokens)
- Login page styling with gradient background
- Sidebar navigation with active states & role-based highlights
- Card components with glassmorphism
- **Dual attendance badges** — emerald (wali kelas) vs indigo (guru mapel)
- **Status colors**: hadir(green), sakit(yellow), izin(blue), alfa(red), terlambat(orange)
- Table styles with color-coded rows for recap
- Attendance input grid with click-to-cycle animation
- Form components, modals
- Responsive breakpoints
- Smooth animations and transitions

### [NEW] [data.js](file:///C:/Users/MSI/.gemini/antigravity/scratch/si-aktif/js/data.js)
- **Full seed data**: 50+ guru with real names/codes from SMAN 47
- Wali kelas assignments
- 24 kelas, ~720 siswa (auto-generated names)
- **Jadwal pelajaran** Senin-Jumat (simplified version of real schedule)
- **Dual attendance storage**: `attendance_daily` + `attendance_subject`
- localStorage CRUD operations for all entities
- Query functions: by date, class, month, subject, teacher
- Recap calculation engine for both attendance types
- 3 months of demo attendance data for charts

### [NEW] [auth.js](file:///C:/Users/MSI/.gemini/antigravity/scratch/si-aktif/js/auth.js)
- Login/logout flow (kode guru as username)
- Session management (current user in sessionStorage)
- Role detection: admin / guru+wali / guru (mapel only)
- Password validation

### [NEW] [app.js](file:///C:/Users/MSI/.gemini/antigravity/scratch/si-aktif/js/app.js)
- SPA router (hash-based navigation)
- Page rendering dispatcher
- **Role-aware sidebar** menu generation (admin vs wali kelas vs guru mapel)
- Global event handlers
- Toast notification system
- Modal system

### [NEW] [admin.js](file:///C:/Users/MSI/.gemini/antigravity/scratch/si-aktif/js/admin.js)
- Admin dashboard with stat cards (24 kelas, 720 siswa, 50+ guru)
- Guru management (add/edit/delete, toggle wali kelas assignment)
- Kelas management (CRUD)
- Siswa management (CRUD with class assignment)
- Jadwal pelajaran viewer
- **Dual recap view**: Tab harian (wali kelas) + Tab per mapel (guru mapel)
- School-wide attendance overview

### [NEW] [teacher.js](file:///C:/Users/MSI/.gemini/antigravity/scratch/si-aktif/js/teacher.js)
- **Wali Kelas dashboard**: kelas wali info, quick action absensi pagi
- **Guru Mapel dashboard**: jadwal hari ini, quick action per sesi
- **Absensi Wali Kelas page** — the core daily UX:
  - Auto-load kelas wali
  - Date selector (default today)
  - Student list with click-to-cycle status
  - Progress bar
  - Save with confirmation
  - Emerald badge/theme
- **Absensi Guru Mapel page** — per-session UX:
  - Show today's schedule
  - Select class + jam ke (or pick from schedule)
  - Student list with click-to-cycle (includes "Terlambat")
  - Indigo badge/theme
- **Rekap view** with tabs: Harian / Per Mapel
- Individual student detail: both attendance types side by side

### [NEW] [charts.js](file:///C:/Users/MSI/.gemini/antigravity/scratch/si-aktif/js/charts.js)
- Chart.js configuration and theming
- **Student daily trend** line chart (monthly % from wali kelas data)
- **Student subject trend** multi-line chart (% per mapel per month)
- Class comparison bar chart
- Status distribution pie/doughnut chart
- **Anomaly chart**: highlight siswa hadir wali kelas tapi alfa di mapel
- Responsive chart sizing

---

## 9. Verification Plan

### Manual Verification
1. **Login Flow**: Test login sebagai Admin, Wali Kelas, dan Guru Mapel — verify correct dashboard
2. **Absensi Wali Kelas**: Input absensi harian untuk X-1, verify tersimpan
3. **Absensi Guru Mapel**: Input absensi Matematika jam ke-3 di X-1, verify tersimpan terpisah
4. **Dual Recap**: Cek rekap harian DAN rekap per mapel, keduanya akurat
5. **Cross-reference**: Siswa hadir di wali kelas tapi alfa di mapel tertentu, verify terdeteksi
6. **Charts**: Verify grafik tren menampilkan data 3 bulan untuk kedua jenis absensi
7. **Admin CRUD**: Tambah/edit/hapus guru, kelas, siswa
8. **Schedule View**: Jadwal pelajaran sesuai data
9. **Responsive**: Test di berbagai ukuran layar
10. **Data Persistence**: Refresh browser, verify data masih ada

### Automated Tests
- Tidak diperlukan untuk fase MVP ini (pure frontend demo)

---

## 10. Demo Scenario

Setelah build selesai, user dapat:

### Skenario 1: Wali Kelas (Absensi Pagi)
1. Login sebagai **O1** (Sigit Pamungkas — Wali Kelas X-1)
2. Dashboard: Lihat info kelas X-1, klik **"Absensi Pagi Hari Ini"**
3. Panggil siswa satu per satu → Set status → Simpan ✅

### Skenario 2: Guru Mapel (Absensi Per Sesi)
4. Masih sebagai O1, switch ke menu **"Absensi Mapel"**
5. Lihat jadwal hari ini: "Penjas-Orkes — X-2 — Jam ke-5"
6. Klik → Panggil siswa X-2 satu per satu → Simpan ✅

### Skenario 3: Rekap & Grafik
7. Buka **Rekap Kelas** → Tab "Harian" → Pilih Mei 2026 → Lihat tabel lengkap
8. Switch tab **"Per Mapel"** → Pilih "Matematika" → Lihat kehadiran di mapel itu
9. Buka **Grafik** → Pilih siswa → Lihat tren harian + tren per mapel (Maret-Mei)

### Skenario 4: Admin
10. Login sebagai **admin** → Dashboard overview 24 kelas, 720 siswa
11. **Rekap Absensi** → Filter kelas X-1 → Tab Harian vs Tab Per Mapel
12. **Grafik & Analitik** → Perbandingan antar kelas, deteksi anomali bolos

---

> [!IMPORTANT]
> Sistem ini menggunakan **localStorage** sebagai penyimpanan data (client-side only). Cocok untuk demo dan presentasi. Untuk production, perlu migrasi ke backend + database.

> [!TIP]
> Data demo 50+ guru dengan kode guru dan nama asli dari SMAN 47 sudah di-preload, beserta 3 bulan data absensi sehingga grafik tren langsung terlihat saat pertama kali dibuka.

> [!WARNING]
> Karena menggunakan localStorage, data hanya tersimpan di browser yang sama. Membuka di browser lain akan menghasilkan data fresh dari seed. Untuk multi-device sync, diperlukan backend.
