const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

const readData = (filename) => {
    return JSON.parse(fs.readFileSync(path.join(dataDir, `${filename}.json`), 'utf8'));
};

const writeData = (filename, data) => {
    fs.writeFileSync(path.join(dataDir, `${filename}.json`), JSON.stringify(data, null, 2));
};

const classes = readData('classes');
const users = readData('users');

const teachers = users.filter(u => u.role === 'guru');
const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];
const maxJam = 10;

const times = [
    "06.30-07.20", // 1 (Upacara/Wali Kelas)
    "07.20-08.00", // 2
    "08.00-08.40", // 3
    "08.40-09.20", // 4
    "09.20-09.40", // Istirahat
    "09.40-10.20", // 5
    "10.20-11.00", // 6
    "11.00-11.40", // 7
    "11.40-12.20", // 8
    "12.20-13.00", // Istirahat
    "13.00-13.40", // 9
    "13.40-14.20"  // 10
];

const newSchedules = [];

classes.forEach(c => {
    const classId = c.id;
    // Find all teachers teaching this class
    const classTeachers = teachers.filter(t => t.teachingClasses && t.teachingClasses.includes(classId));
    
    // We want to distribute these teachers across the week.
    // Let's create a pool of slots they need to teach.
    // Usually a teacher teaches a subject for 2-4 hours per week per class.
    // Let's just randomly assign them.
    let teacherIndex = 0;
    
    days.forEach(day => {
        const scheduleRow = {
            day: day,
            classId: classId,
            slots: []
        };
        
        for (let jam = 1; jam <= maxJam; jam++) {
            // Assign a teacher from the pool
            if (classTeachers.length > 0) {
                const teacher = classTeachers[teacherIndex % classTeachers.length];
                scheduleRow.slots.push({
                    jamKe: jam,
                    time: times[jam],
                    teacherId: teacher.kodeGuru,
                    subject: teacher.subjects[0] || 'Umum'
                });
                
                // Change teacher every 2 hours to simulate blocks
                if (jam % 2 === 0) {
                    teacherIndex++;
                }
            }
        }
        
        newSchedules.push(scheduleRow);
    });
});

writeData('schedules', newSchedules);
console.log(`Generated ${newSchedules.length} schedule records across all classes and days!`);
