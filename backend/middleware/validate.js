/**
 * SI-AKTIF Validation Middleware
 * Server-side validation for teacher and student CRUD operations.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const readData = (filename) => {
    const filePath = path.join(dataDir, `${filename}.json`);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

/**
 * Validate teacher create/update request body.
 * Checks: name required, NIP digits-only & unique, kodeGuru required, subjects non-empty.
 */
const validateTeacher = (req, res, next) => {
    const { name, nip, kodeGuru, subjects } = req.body;
    const errors = [];
    const isEdit = req.method === 'PUT';

    // Name is required
    if (!name || name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Nama guru wajib diisi.' });
    }

    // NIP must be digits only (if provided)
    if (nip && !/^\d+$/.test(nip)) {
        errors.push({ field: 'nip', message: 'NIP harus berupa angka.' });
    }

    // NIP uniqueness check
    if (nip && nip.trim().length > 0) {
        const users = readData('users');
        const duplicate = users.find(u => u.nip === nip && u.id !== req.params.id);
        if (duplicate) {
            errors.push({ field: 'nip', message: `NIP "${nip}" sudah digunakan oleh ${duplicate.name}.` });
        }
    }

    // KodeGuru is required
    if (!kodeGuru || kodeGuru.trim().length === 0) {
        errors.push({ field: 'kodeGuru', message: 'Kode guru wajib diisi.' });
    }

    // KodeGuru uniqueness check (only on create)
    if (!isEdit && kodeGuru && kodeGuru.trim().length > 0) {
        const users = readData('users');
        const duplicate = users.find(u => u.kodeGuru === kodeGuru);
        if (duplicate) {
            errors.push({ field: 'kodeGuru', message: `Kode guru "${kodeGuru}" sudah digunakan.` });
        }
    }

    // Subjects must be a non-empty array
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        errors.push({ field: 'subjects', message: 'Mata pelajaran wajib diisi minimal satu.' });
    }

    if (errors.length > 0) {
        return res.status(422).json({
            success: false,
            message: 'Validasi gagal. Periksa kembali data Anda.',
            errors
        });
    }

    next();
};

/**
 * Validate student create/update request body.
 * Checks: NIS digits-only & unique, name required, classId required.
 */
const validateStudent = (req, res, next) => {
    const { nis, name, classId, gender } = req.body;
    const errors = [];

    // NIS required and digits-only
    if (!nis || nis.trim().length === 0) {
        errors.push({ field: 'nis', message: 'NIS/NISN wajib diisi.' });
    } else if (!/^\d+$/.test(nis)) {
        errors.push({ field: 'nis', message: 'NIS/NISN harus berupa angka.' });
    }

    // NIS uniqueness check
    if (nis && nis.trim().length > 0) {
        const students = readData('students');
        const duplicate = students.find(s => s.nis === nis && s.id !== req.params.id);
        if (duplicate) {
            errors.push({ field: 'nis', message: `NIS "${nis}" sudah digunakan oleh ${duplicate.name}.` });
        }
    }

    // Name is required
    if (!name || name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Nama siswa wajib diisi.' });
    }

    // ClassId is required
    if (!classId || classId.trim().length === 0) {
        errors.push({ field: 'classId', message: 'Kelas wajib dipilih.' });
    }

    // Gender must be L or P
    if (gender && !['L', 'P'].includes(gender.toUpperCase())) {
        errors.push({ field: 'gender', message: 'Jenis kelamin harus L atau P.' });
    }

    if (errors.length > 0) {
        return res.status(422).json({
            success: false,
            message: 'Validasi gagal. Periksa kembali data Anda.',
            errors
        });
    }

    next();
};

module.exports = { validateTeacher, validateStudent };
