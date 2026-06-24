/**
 * SI-AKTIF Student Routes (API v1)
 * RESTful endpoints for student CRUD with server-side search, class filter, and CSV import.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { validateStudent } = require('../middleware/validate');

const dataDir = path.join(__dirname, '..', 'data');
const storageDir = path.join(__dirname, '..', 'storage', 'app', 'students', 'imports');

// Multer config for CSV uploads
const csvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }
        cb(null, storageDir);
    },
    filename: (req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        cb(null, `import_${timestamp}_${file.originalname}`);
    }
});

const uploadCSV = multer({
    storage: csvStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file CSV yang diperbolehkan.'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const readData = (filename) => {
    const filePath = path.join(dataDir, `${filename}.json`);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeData = (filename, data) => {
    const filePath = path.join(dataDir, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

/**
 * GET /api/v1/students
 * List students. Supports ?search= and ?classId= query params.
 */
router.get('/students', (req, res) => {
    let students = readData('students');

    // Filter by class
    const classId = req.query.classId;
    if (classId) {
        students = students.filter(s => s.classId === classId);
    }

    // Server-side search
    const search = (req.query.search || '').toLowerCase().trim();
    if (search) {
        students = students.filter(s => {
            return (s.name || '').toLowerCase().includes(search) ||
                   (s.nis || '').toLowerCase().includes(search) ||
                   (s.classId || '').toLowerCase().includes(search);
        });
    }

    res.json({
        success: true,
        data: students,
        total: students.length,
        message: 'Data siswa berhasil diambil.'
    });
});

/**
 * GET /api/v1/students/:id
 * Get a single student by ID.
 */
router.get('/students/:id', (req, res) => {
    const students = readData('students');
    const student = students.find(s => s.id === req.params.id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Siswa tidak ditemukan.',
            errors: []
        });
    }

    res.json({
        success: true,
        data: student,
        message: 'Data siswa ditemukan.'
    });
});

/**
 * POST /api/v1/students
 * Create a new student. Validated by middleware.
 */
router.post('/students', validateStudent, (req, res) => {
    const data = readData('students');
    const { nis, name, gender, classId } = req.body;

    const newStudent = {
        id: req.body.id || 'stu_' + Date.now(),
        nis: nis.trim(),
        name: name.trim(),
        gender: (gender || 'L').toUpperCase(),
        classId: classId.trim()
    };

    data.push(newStudent);
    writeData('students', data);

    res.status(201).json({
        success: true,
        data: newStudent,
        message: `Siswa "${name}" berhasil ditambahkan.`
    });
});

/**
 * PUT /api/v1/students/:id
 * Update an existing student. Validated by middleware.
 */
router.put('/students/:id', validateStudent, (req, res) => {
    const data = readData('students');
    const idx = data.findIndex(s => s.id === req.params.id);

    if (idx < 0) {
        return res.status(404).json({
            success: false,
            message: 'Siswa tidak ditemukan.',
            errors: []
        });
    }

    const { nis, name, gender, classId } = req.body;
    data[idx] = {
        ...data[idx],
        nis: nis.trim(),
        name: name.trim(),
        gender: (gender || data[idx].gender).toUpperCase(),
        classId: classId.trim()
    };

    writeData('students', data);

    res.json({
        success: true,
        data: data[idx],
        message: `Data siswa "${name}" berhasil diperbarui.`
    });
});

/**
 * DELETE /api/v1/students/:id
 * Delete a student by ID.
 */
router.delete('/students/:id', (req, res) => {
    const data = readData('students');
    const student = data.find(s => s.id === req.params.id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Siswa tidak ditemukan.',
            errors: []
        });
    }

    const filtered = data.filter(s => s.id !== req.params.id);
    writeData('students', filtered);

    res.json({
        success: true,
        data: null,
        message: `Siswa "${student.name}" berhasil dihapus.`
    });
});

/**
 * POST /api/v1/students/import-csv
 * Upload and parse a CSV file. Saves file to storage and imports students to DB.
 */
router.post('/students/import-csv', uploadCSV.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'File CSV wajib diunggah.',
            errors: [{ field: 'csvFile', message: 'Tidak ada file yang diunggah.' }]
        });
    }

    try {
        const csvContent = fs.readFileSync(req.file.path, 'utf8');
        const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length < 2) {
            return res.status(422).json({
                success: false,
                message: 'File CSV kosong atau hanya memiliki header.',
                errors: []
            });
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const nisIdx = headers.indexOf('nis');
        const nameIdx = headers.indexOf('name');
        const genderIdx = headers.indexOf('gender');
        const classIdx = headers.indexOf('classid');

        if (nisIdx === -1 || nameIdx === -1 || genderIdx === -1 || classIdx === -1) {
            return res.status(422).json({
                success: false,
                message: 'Header CSV tidak valid. Wajib memiliki: nis, name, gender, classId',
                errors: [{ field: 'csvFile', message: 'Header kolom tidak sesuai format.' }]
            });
        }

        const existingStudents = readData('students');
        const existingNIS = new Set(existingStudents.map(s => s.nis));
        const imported = [];
        const skipped = [];

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim());
            if (cols.length < 4) continue;

            const nis = cols[nisIdx];
            const name = cols[nameIdx];
            const gender = cols[genderIdx].toUpperCase();
            const classId = cols[classIdx];

            if (!nis || !name || !classId) continue;

            // Skip duplicates
            if (existingNIS.has(nis)) {
                skipped.push({ nis, name, reason: 'NIS sudah terdaftar.' });
                continue;
            }

            const newStudent = {
                id: 'stu_' + Date.now() + '_' + i,
                nis, name, gender, classId
            };

            existingStudents.push(newStudent);
            existingNIS.add(nis);
            imported.push(newStudent);
        }

        writeData('students', existingStudents);

        res.json({
            success: true,
            data: {
                imported: imported.length,
                skipped: skipped.length,
                skippedDetails: skipped,
                filePath: req.file.filename
            },
            message: `Berhasil mengimpor ${imported.length} siswa. ${skipped.length} data dilewati (duplikat).`
        });

    } catch (err) {
        console.error('CSV import error:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memproses file CSV.',
            errors: [{ field: 'csvFile', message: err.message }]
        });
    }
});

module.exports = router;
