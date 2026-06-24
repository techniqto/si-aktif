/**
 * SI-AKTIF Backend Server
 * Express API with versioned routes, file storage, and legacy backward compatibility.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Directories ---
const dataDir = path.join(__dirname, 'data');
const storageDir = path.join(__dirname, 'storage');

// Ensure data exists
if (!fs.existsSync(dataDir) || !fs.existsSync(path.join(dataDir, 'users.json'))) {
    console.log("Data not found, running seed script...");
    require('./seed.js')();
}

// Ensure storage directories exist
const storagePaths = [
    'app/teachers/profiles',
    'app/teachers/documents',
    'app/students/profiles',
    'app/students/imports'
];
storagePaths.forEach(p => {
    const fullPath = path.join(storageDir, p);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Static serving for storage files
app.use('/storage', express.static(storageDir));

// Static serving for frontend
app.use(express.static(path.join(__dirname, '..')));


// --- Versioned API Routes (v1) ---
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');

app.use('/api/v1', teacherRoutes);
app.use('/api/v1', studentRoutes);

// =============================================
// LEGACY ENDPOINTS (backward compatibility)
// Used by: auth, schedule, attendance, calendar
// =============================================

// Helper functions
const readData = (filename) => {
    const filePath = path.join(dataDir, `${filename}.json`);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeData = (filename, data) => {
    const filePath = path.join(dataDir, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- AUTH ENDPOINT ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const users = readData('users');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const sessionData = { ...user };
        delete sessionData.password;
        res.json({ success: true, user: sessionData });
    } else {
        res.status(401).json({ success: false, message: 'Username atau password salah' });
    }
});

// --- LEGACY DATA READ ENDPOINTS ---
app.get('/api/users', (req, res) => {
    const users = readData('users');
    const safeUsers = users.map(u => {
        const { password, ...safeUser } = u;
        return safeUser;
    });
    res.json(safeUsers);
});

app.get('/api/classes', (req, res) => {
    res.json(readData('classes'));
});

app.get('/api/students', (req, res) => {
    res.json(readData('students'));
});

app.get('/api/schedules', (req, res) => {
    res.json(readData('schedules'));
});

app.get('/api/attendance-daily', (req, res) => {
    res.json(readData('attendance_daily'));
});

app.get('/api/attendance-subject', (req, res) => {
    res.json(readData('attendance_subject'));
});

// --- LEGACY DATA WRITE ENDPOINTS ---
app.post('/api/attendance-daily', (req, res) => {
    const record = req.body;
    const data = readData('attendance_daily');
    
    const existingIdx = data.findIndex(d => d.id === record.id);
    if (existingIdx >= 0) {
        data[existingIdx] = record;
    } else {
        data.push(record);
    }
    
    writeData('attendance_daily', data);
    res.json({ success: true, message: 'Absensi harian berhasil disimpan' });
});

app.post('/api/attendance-subject', (req, res) => {
    const record = req.body;
    const data = readData('attendance_subject');
    
    const existingIdx = data.findIndex(d => d.id === record.id);
    if (existingIdx >= 0) {
        data[existingIdx] = record;
    } else {
        data.push(record);
    }
    
    writeData('attendance_subject', data);
    res.json({ success: true, message: 'Absensi mapel berhasil disimpan' });
});

// --- LEGACY ADMIN CRUD (kept for backward compat) ---
app.post('/api/users', (req, res) => {
    const data = readData('users');
    data.push(req.body);
    writeData('users', data);
    res.json({ success: true });
});
app.put('/api/users/:id', (req, res) => {
    const data = readData('users');
    const idx = data.findIndex(u => u.id === req.params.id);
    if (idx >= 0) {
        const originalPassword = data[idx].password || 'guru123';
        data[idx] = { ...data[idx], ...req.body, password: req.body.password || originalPassword };
    }
    writeData('users', data);
    res.json({ success: true });
});
app.delete('/api/users/:id', (req, res) => {
    const data = readData('users').filter(u => u.id !== req.params.id);
    writeData('users', data);
    res.json({ success: true });
});

app.post('/api/classes', (req, res) => {
    const data = readData('classes');
    data.push(req.body);
    writeData('classes', data);
    res.json({ success: true });
});
app.put('/api/classes/:id', (req, res) => {
    const data = readData('classes');
    const idx = data.findIndex(c => c.id === req.params.id);
    if (idx >= 0) data[idx] = req.body;
    writeData('classes', data);
    res.json({ success: true });
});
app.delete('/api/classes/:id', (req, res) => {
    const data = readData('classes').filter(c => c.id !== req.params.id);
    writeData('classes', data);
    res.json({ success: true });
});

app.post('/api/students', (req, res) => {
    const data = readData('students');
    data.push(req.body);
    writeData('students', data);
    res.json({ success: true });
});
app.put('/api/students/:id', (req, res) => {
    const data = readData('students');
    const idx = data.findIndex(s => s.id === req.params.id);
    if (idx >= 0) data[idx] = req.body;
    writeData('students', data);
    res.json({ success: true });
});
app.delete('/api/students/:id', (req, res) => {
    const data = readData('students').filter(s => s.id !== req.params.id);
    writeData('students', data);
    res.json({ success: true });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`SI-AKTIF Backend API running on http://localhost:${PORT}`);
    console.log(`  → Legacy API:    /api/*`);
    console.log(`  → Versioned API: /api/v1/teachers, /api/v1/students`);
    console.log(`  → Storage:       /storage/*`);
});
