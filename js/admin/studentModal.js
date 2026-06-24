/**
 * SI-AKTIF Student Modal Component
 * Handles create/edit modal for students and CSV import with file upload to backend.
 */

window.StudentModal = {
    /**
     * Open modal for creating a new student.
     */
    openCreate: async () => {
        window.StudentModal._open(null);
    },

    /**
     * Open modal for editing an existing student.
     */
    openEdit: async (encodedData) => {
        try {
            const data = JSON.parse(encodedData);
            window.StudentModal._open(data);
        } catch (e) {
            console.error('Failed to parse student data:', e);
            window.App.showToast('Gagal membuka data siswa.', 'error');
        }
    },

    /**
     * Internal: Open modal with form fields.
     */
    _open: async (data) => {
        const modal = document.getElementById('crud-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const saveBtn = document.getElementById('modal-save-btn');

        const isEdit = data !== null;
        const classes = await window.DB.getClasses();
        const defaultClass = classes.length > 0 ? classes[0].id : '';

        modal.style.display = 'flex';
        title.textContent = isEdit ? 'Edit Data Siswa' : 'Tambah Siswa Baru';
        saveBtn.textContent = 'Simpan';
        saveBtn.disabled = false;

        body.innerHTML = `
            <input type="hidden" id="form-siswa-id" value="${isEdit ? data.id : 'stu_' + Date.now()}">
            <div id="form-siswa-errors" class="form-errors" style="display: none;"></div>
            <div class="form-group">
                <label>NIS / NISN (Hanya Angka) <span class="text-danger">*</span></label>
                <input type="text" id="form-siswa-nis" class="form-control" style="border-radius:10px;" value="${isEdit ? data.nis : ''}" placeholder="20241001" required>
            </div>
            <div class="form-group">
                <label>Nama Lengkap <span class="text-danger">*</span></label>
                <input type="text" id="form-siswa-name" class="form-control" style="border-radius:10px;" value="${isEdit ? data.name : ''}" placeholder="Nama Siswa" required>
            </div>
            <div class="form-group">
                <label>Jenis Kelamin <span class="text-danger">*</span></label>
                <select id="form-siswa-gender" class="form-control" style="border-radius:10px;">
                    <option value="L" ${isEdit && data.gender === 'L' ? 'selected' : ''}>Laki-laki</option>
                    <option value="P" ${isEdit && data.gender === 'P' ? 'selected' : ''}>Perempuan</option>
                </select>
            </div>
            <div class="form-group">
                <label>Kelas <span class="text-danger">*</span></label>
                <select id="form-siswa-class" class="form-control" style="border-radius:10px;">
                    ${classes.map(c => `<option value="${c.id}" ${isEdit && data.classId === c.id ? 'selected' : (c.id === defaultClass ? 'selected' : '')}>${c.name}</option>`).join('')}
                </select>
            </div>
        `;

        saveBtn.onclick = () => window.StudentModal._save(isEdit);
    },

    /**
     * Client-side validation.
     */
    _validate: () => {
        const errors = [];
        const nis = document.getElementById('form-siswa-nis').value.trim();
        const name = document.getElementById('form-siswa-name').value.trim();

        if (!nis) errors.push('NIS/NISN wajib diisi.');
        else if (!/^\d+$/.test(nis)) errors.push('NIS/NISN harus berupa angka.');
        if (!name) errors.push('Nama siswa wajib diisi.');

        return { valid: errors.length === 0, errors };
    },

    /**
     * Save handler.
     */
    _save: async (isEdit) => {
        const errorsDiv = document.getElementById('form-siswa-errors');
        const saveBtn = document.getElementById('modal-save-btn');

        const validation = window.StudentModal._validate();
        if (!validation.valid) {
            errorsDiv.innerHTML = validation.errors.map(e => `<div class="form-error-item"><i data-lucide="alert-circle" style="width: 14px; height: 14px;"></i> ${e}</div>`).join('');
            errorsDiv.style.display = 'block';
            if (window.lucide) lucide.createIcons({ root: errorsDiv });
            return;
        }

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="spinner-sm"></div> Menyimpan...';
        errorsDiv.style.display = 'none';

        const formData = {
            id: document.getElementById('form-siswa-id').value,
            nis: document.getElementById('form-siswa-nis').value.trim(),
            name: document.getElementById('form-siswa-name').value.trim(),
            gender: document.getElementById('form-siswa-gender').value,
            classId: document.getElementById('form-siswa-class').value
        };

        let result;
        if (isEdit) {
            result = await window.StudentApi.update(formData.id, formData);
        } else {
            result = await window.StudentApi.create(formData);
        }

        if (result.success) {
            document.getElementById('crud-modal').style.display = 'none';
            window.App.showToast(result.message, 'success');
            window.DB.cache.students = null;
            await window.StudentTable.refresh();
        } else {
            const serverErrors = (result.errors || []).map(e => e.message);
            const allErrors = serverErrors.length > 0 ? serverErrors : [result.message || 'Terjadi kesalahan.'];
            errorsDiv.innerHTML = allErrors.map(e => `<div class="form-error-item"><i data-lucide="alert-circle" style="width: 14px; height: 14px;"></i> ${e}</div>`).join('');
            errorsDiv.style.display = 'block';
            if (window.lucide) lucide.createIcons({ root: errorsDiv });
            
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Simpan';
        }
    },

    /**
     * Open the CSV import modal with drag-and-drop zone.
     * File is uploaded to backend which saves it to storage and parses it.
     */
    openCSVImport: () => {
        const modal = document.getElementById('crud-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const saveBtn = document.getElementById('modal-save-btn');

        title.textContent = 'Import Siswa via CSV';
        saveBtn.textContent = 'Upload & Import';
        saveBtn.disabled = true;
        modal.style.display = 'flex';

        body.innerHTML = `
            <div id="csv-import-errors" class="form-errors" style="display: none;"></div>
            <div class="form-group">
                <label>Format File CSV yang Diperlukan:</label>
                <div style="background: #f1f5f9; padding: 0.75rem 1rem; border-radius: 8px; font-family: monospace; font-size: 0.75rem; color: var(--color-navy); margin-bottom: 1rem; line-height: 1.4;">
                    nis,name,gender,classId<br>
                    20241001,Andi Pratama,L,X-1<br>
                    20241002,Citra Rahayu,P,X-1
                </div>
            </div>
            <div class="csv-upload-area" id="csv-drop-zone" onclick="document.getElementById('csv-file-input').click()">
                <i data-lucide="upload-cloud" class="csv-upload-icon" style="width: 40px; height: 40px; margin: 0 auto 0.5rem; display: block; color: var(--color-primary);"></i>
                <div class="csv-upload-text" id="csv-file-status"><strong>Pilih File CSV</strong> atau seret dan letakkan di sini</div>
                <input type="file" id="csv-file-input" accept=".csv" style="display: none;" onchange="window.StudentModal._handleCSVSelected(event)">
            </div>
            <div id="csv-preview-container" style="display: none; max-height: 150px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 8px; padding: 0.5rem; margin-top: 1rem;">
                <table style="width: 100%; font-size: 0.75rem;">
                    <thead>
                        <tr><th>NIS</th><th>Nama</th><th>L/P</th><th>Kelas</th></tr>
                    </thead>
                    <tbody id="csv-preview-tbody"></tbody>
                </table>
            </div>
            <p id="csv-storage-info" style="display: none; font-size: 0.75rem; color: var(--color-text-lighter); margin-top: 0.75rem; font-style: italic;">
                <i data-lucide="folder" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i>
                File CSV akan disimpan ke <code>storage/app/students/imports/</code>
            </p>
        `;

        if (window.lucide) lucide.createIcons({ root: body });

        // Drag-and-drop events
        const dropZone = document.getElementById('csv-drop-zone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--color-primary)';
            dropZone.style.background = 'rgba(0, 97, 255, 0.05)';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'var(--color-border)';
            dropZone.style.background = '#f8fafc';
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--color-border)';
            dropZone.style.background = '#f8fafc';
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.name.endsWith('.csv')) {
                    window.StudentModal._previewCSV(file);
                } else {
                    window.App.showToast('Hanya file .csv yang diperbolehkan!', 'error');
                }
            }
        });

        saveBtn.onclick = null; // Will be set after file selection
    },

    /**
     * Handle CSV file selection from input.
     */
    _handleCSVSelected: (event) => {
        const file = event.target.files[0];
        if (file) {
            window.StudentModal._previewCSV(file);
        }
    },

    /**
     * Preview CSV content locally before uploading.
     */
    _previewCSV: (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            if (lines.length < 2) {
                window.App.showToast('File CSV kosong atau format salah!', 'error');
                return;
            }

            const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
            const nisIdx = headers.indexOf('nis');
            const nameIdx = headers.indexOf('name');
            const genderIdx = headers.indexOf('gender');
            const classIdx = headers.indexOf('classid');

            if (nisIdx === -1 || nameIdx === -1 || genderIdx === -1 || classIdx === -1) {
                window.App.showToast('Header CSV harus memiliki: nis, name, gender, classId', 'error');
                return;
            }

            const previewData = [];
            for (let i = 1; i < Math.min(lines.length, 11); i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                if (cols.length >= 4) {
                    previewData.push({ nis: cols[nisIdx], name: cols[nameIdx], gender: cols[genderIdx], classId: cols[classIdx] });
                }
            }

            const totalRows = lines.length - 1;

            // Update UI
            document.getElementById('csv-file-status').innerHTML = `File terpilih: <strong>${file.name}</strong> (${totalRows} baris data)`;
            document.getElementById('csv-storage-info').style.display = 'block';

            const previewTbody = document.getElementById('csv-preview-tbody');
            previewTbody.innerHTML = previewData.map(s => `
                <tr><td>${s.nis}</td><td>${s.name}</td><td>${s.gender}</td><td>${s.classId}</td></tr>
            `).join('') + (totalRows > 10 ? `<tr><td colspan="4" style="text-align: center; color: var(--color-text-lighter); padding: 0.25rem 0;">...dan ${totalRows - 10} baris lagi</td></tr>` : '');
            document.getElementById('csv-preview-container').style.display = 'block';

            // Enable save button and set onclick to upload
            const saveBtn = document.getElementById('modal-save-btn');
            saveBtn.disabled = false;
            saveBtn.onclick = async () => {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<div class="spinner-sm"></div> Mengimpor...';

                const errorsDiv = document.getElementById('csv-import-errors');
                errorsDiv.style.display = 'none';

                const result = await window.StudentApi.importCSV(file);

                if (result.success) {
                    document.getElementById('crud-modal').style.display = 'none';
                    window.App.showToast(result.message, 'success');
                    window.DB.cache.students = null;
                    await window.StudentTable.refresh();
                } else {
                    errorsDiv.innerHTML = `<div class="form-error-item"><i data-lucide="alert-circle" style="width: 14px; height: 14px;"></i> ${result.message}</div>`;
                    errorsDiv.style.display = 'block';
                    if (window.lucide) lucide.createIcons({ root: errorsDiv });
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = 'Upload & Import';
                }
            };
        };
        reader.readAsText(file);
    }
};
