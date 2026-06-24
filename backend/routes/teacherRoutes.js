/**
 * SI-AKTIF Teacher Routes (API v1)
 * RESTful endpoints for teacher CRUD with server-side search.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { validateTeacher } = require('../middleware/validate');

const dataDir = path.join(__dirname, '..', 'data');

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
 * GET /api/v1/teachers
 * List all teachers. Supports ?search= query param for server-side filtering.
 */
router.get('/teachers', (req, res) => {
    const users = readData('users');
    let teachers = users.filter(u => u.role !== 'admin');

    // Server-side search
    const search = (req.query.search || '').toLowerCase().trim();
    if (search) {
        teachers = teachers.filter(t => {
            return (t.name || '').toLowerCase().includes(search) ||
                   (t.kodeGuru || '').toLowerCase().includes(search) ||
                   (t.nip || '').toLowerCase().includes(search) ||
                   (t.subjects || []).some(s => s.toLowerCase().includes(search)) ||
                   (t.tugasTambahan || '').toLowerCase().includes(search);
        });
    }

    res.json({
        success: true,
        data: teachers,
        total: teachers.length,
        message: 'Data guru berhasil diambil.'
    });
});

/**
 * GET /api/v1/teachers/:id
 * Get a single teacher by ID.
 */
router.get('/teachers/:id', (req, res) => {
    const users = readData('users');
    const teacher = users.find(u => u.id === req.params.id && u.role !== 'admin');

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Guru tidak ditemukan.',
            errors: []
        });
    }

    res.json({
        success: true,
        data: teacher,
        message: 'Data guru ditemukan.'
    });
});

/**
 * POST /api/v1/teachers
 * Create a new teacher. Validated by middleware.
 */
router.post('/teachers', validateTeacher, (req, res) => {
    const data = readData('users');
    const { name, nip, kodeGuru, username, password, subjects, isWaliKelas, waliKelasId, tugasTambahan, teachingClasses } = req.body;

    const newTeacher = {
        id: req.body.id || 'user_' + Date.now(),
        kodeGuru: kodeGuru.trim(),
        username: (username || kodeGuru).toLowerCase().trim(),
        password: password || 'guru123',
        name: name.trim(),
        role: 'guru',
        subjects: subjects || [],
        isWaliKelas: isWaliKelas || false,
        waliKelasId: waliKelasId || null,
        teachingClasses: teachingClasses || [],
        nip: (nip || '').trim(),
        tugasTambahan: tugasTambahan || '-'
    };

    data.push(newTeacher);
    writeData('users', data);

    res.status(201).json({
        success: true,
        data: newTeacher,
        message: `Guru "${name}" berhasil ditambahkan.`
    });
});

/**
 * PUT /api/v1/teachers/:id
 * Update an existing teacher. Validated by middleware.
 */
router.put('/teachers/:id', validateTeacher, (req, res) => {
    const data = readData('users');
    const idx = data.findIndex(u => u.id === req.params.id);

    if (idx < 0) {
        return res.status(404).json({
            success: false,
            message: 'Guru tidak ditemukan.',
            errors: []
        });
    }

    const { name, nip, kodeGuru, username, password, subjects, isWaliKelas, waliKelasId, tugasTambahan, teachingClasses } = req.body;

    // Preserve password and merge
    const originalPassword = data[idx].password || 'guru123';
    data[idx] = {
        ...data[idx],
        name: name.trim(),
        nip: (nip || '').trim(),
        kodeGuru: kodeGuru.trim(),
        username: (username || kodeGuru).toLowerCase().trim(),
        subjects: subjects || data[idx].subjects,
        isWaliKelas: isWaliKelas !== undefined ? isWaliKelas : data[idx].isWaliKelas,
        waliKelasId: waliKelasId !== undefined ? waliKelasId : data[idx].waliKelasId,
        teachingClasses: teachingClasses || data[idx].teachingClasses,
        tugasTambahan: tugasTambahan || data[idx].tugasTambahan,
        password: password || originalPassword
    };

    writeData('users', data);

    res.json({
        success: true,
        data: data[idx],
        message: `Data guru "${name}" berhasil diperbarui.`
    });
});

/**
 * DELETE /api/v1/teachers/:id
 * Delete a teacher by ID.
 */
router.delete('/teachers/:id', (req, res) => {
    const data = readData('users');
    const teacher = data.find(u => u.id === req.params.id);

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Guru tidak ditemukan.',
            errors: []
        });
    }

    const filtered = data.filter(u => u.id !== req.params.id);
    writeData('users', filtered);

    res.json({
        success: true,
        data: null,
        message: `Guru "${teacher.name}" berhasil dihapus.`
    });
});

module.exports = router;
