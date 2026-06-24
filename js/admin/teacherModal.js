/**
 * SI-AKTIF Teacher Modal Component
 * Handles create/edit modal for teacher CRUD with client-side + server-side validation.
 */

window.TeacherModal = {
    /**
     * Open modal for creating a new teacher.
     */
    openCreate: async () => {
        window.TeacherModal._open(null);
    },

    /**
     * Open modal for editing an existing teacher.
     * @param {string} encodedData - URI-encoded JSON string of teacher data
     */
    openEdit: async (encodedData) => {
        try {
            const data = JSON.parse(encodedData);
            window.TeacherModal._open(data);
        } catch (e) {
            console.error('Failed to parse teacher data:', e);
            window.App.showToast('Gagal membuka data guru.', 'error');
        }
    },

    /**
     * Internal: Open the modal with form fields.
     */
    _open: async (data) => {
        const modal = document.getElementById('crud-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const saveBtn = document.getElementById('modal-save-btn');

        const isEdit = data !== null;
        const classes = await window.DB.getClasses();

        modal.style.display = 'flex';
        title.textContent = isEdit ? 'Edit Data Guru' : 'Tambah Guru Baru';
        saveBtn.textContent = 'Simpan';
        saveBtn.disabled = false;

        body.innerHTML = `
            <input type="hidden" id="form-guru-id" value="${isEdit ? data.id : 'user_' + Date.now()}">
            <div id="form-guru-errors" class="form-errors" style="display: none;"></div>
            <div class="form-group">
                <label>Nama Lengkap (dengan Gelar) <span class="text-danger">*</span></label>
                <input type="text" id="form-guru-name" class="form-control" style="border-radius:10px;" value="${isEdit ? data.name : ''}" placeholder="Drs. Nama Guru, M.Pd." required>
            </div>
            <div class="form-group">
                <label>NIP (Hanya Angka) <span class="text-danger">*</span></label>
                <input type="text" id="form-guru-nip" class="form-control" style="border-radius:10px;" value="${isEdit ? (data.nip || '') : ''}" placeholder="196509301992031010" pattern="\\d+">
            </div>
            <div class="form-group">
                <label>Kode Guru <span class="text-danger">*</span></label>
                <input type="text" id="form-guru-kode" class="form-control" style="border-radius:10px;" value="${isEdit ? data.kodeGuru : ''}" placeholder="A1, O2, T11..." ${isEdit ? 'readonly style="border-radius:10px; background: #f1f5f9;"' : 'oninput="document.getElementById(\'form-guru-username\').value = this.value.toLowerCase().trim()"' } required>
                ${isEdit ? '<small style="color: var(--color-text-lighter); font-size: 0.75rem;">Kode guru tidak dapat diubah.</small>' : ''}
            </div>
            <div class="form-group">
                <label>Username Akun <span class="text-danger">*</span></label>
                <input type="text" id="form-guru-username" class="form-control" style="border-radius:10px;" value="${isEdit ? (data.username || data.kodeGuru.toLowerCase()) : ''}" placeholder="username_login" required>
            </div>
            <div class="form-group">
                <label>Password Akun <span class="text-danger">*</span></label>
                <div class="input-icon-wrapper" style="position: relative;">
                    <input type="password" id="form-guru-password" class="form-control" style="border-radius:10px; padding-right: 2.5rem;" value="${isEdit ? (data.password || 'guru123') : 'guru123'}" placeholder="Password" required>
                    <button type="button" class="btn-icon" onclick="const p = document.getElementById('form-guru-password'); p.type = p.type === 'password' ? 'text' : 'password'; this.querySelector('i').setAttribute('data-lucide', p.type === 'password' ? 'eye' : 'eye-off'); if(window.lucide) lucide.createIcons({root: this});" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-light); height: 100%; display: flex; align-items: center; justify-content: center;">
                        <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Mata Pelajaran (pisahkan dengan koma) <span class="text-danger">*</span></label>
                <input type="text" id="form-guru-subjects" class="form-control" style="border-radius:10px;" value="${isEdit && data.subjects ? data.subjects.join(', ') : ''}" placeholder="Sosiologi, Matematika..." required>
            </div>
            <div class="form-group">
                <label>Wali Kelas Dari (kosongkan jika bukan)</label>
                <select id="form-guru-wali" class="form-control" style="border-radius:10px;">
                    <option value="">-- Bukan Wali Kelas --</option>
                    ${classes.map(c => `<option value="${c.id}" ${isEdit && data.isWaliKelas && data.waliKelasId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Tugas Tambahan Lainnya</label>
                <input type="text" id="form-guru-tugas" class="form-control" style="border-radius:10px;" value="${isEdit ? (data.tugasTambahan || '') : ''}" placeholder="Wakasek, Pembina Ekskul Rohis...">
            </div>
            <div class="form-group">
                <label>Kelas yang Diajar (Pilih Kelas)</label>
                <div class="classes-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; max-height: 120px; overflow-y: auto; border: 1px solid var(--color-border); padding: 0.75rem; border-radius: 10px; background: white; margin-top: 0.25rem;">
                    ${classes.map(c => `
                        <label style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; font-weight: 500; cursor: pointer; color: var(--color-navy);">
                            <input type="checkbox" name="form-guru-classes" value="${c.id}" ${isEdit && data.teachingClasses && data.teachingClasses.includes(c.id) ? 'checked' : ''} style="margin: 0;">
                            ${c.name}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons({ root: body });

        saveBtn.onclick = () => window.TeacherModal._save(isEdit, data);
    },

    /**
     * Client-side validation.
     * @returns {{valid: boolean, errors: Array}}
     */
    _validate: () => {
        const errors = [];
        const name = document.getElementById('form-guru-name').value.trim();
        const nip = document.getElementById('form-guru-nip').value.trim();
        const kode = document.getElementById('form-guru-kode').value.trim();
        const username = document.getElementById('form-guru-username').value.trim();
        const password = document.getElementById('form-guru-password').value.trim();
        const subjects = document.getElementById('form-guru-subjects').value.trim();

        if (!name) errors.push('Nama guru wajib diisi.');
        if (nip && !/^\d+$/.test(nip)) errors.push('NIP harus berupa angka.');
        if (!kode) errors.push('Kode guru wajib diisi.');
        if (!username) errors.push('Username akun wajib diisi.');
        if (!password) errors.push('Password akun wajib diisi.');
        if (!subjects) errors.push('Mata pelajaran wajib diisi minimal satu.');

        return { valid: errors.length === 0, errors };
    },

    /**
     * Save handler: validate client-side, then submit to API.
     */
    _save: async (isEdit, originalData) => {
        const errorsDiv = document.getElementById('form-guru-errors');
        const saveBtn = document.getElementById('modal-save-btn');

        // Client-side validation
        const validation = window.TeacherModal._validate();
        if (!validation.valid) {
            errorsDiv.innerHTML = validation.errors.map(e => `<div class="form-error-item"><i data-lucide="alert-circle" style="width: 14px; height: 14px;"></i> ${e}</div>`).join('');
            errorsDiv.style.display = 'block';
            if (window.lucide) lucide.createIcons({ root: errorsDiv });
            return;
        }

        // Show saving state
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="spinner-sm"></div> Menyimpan...';
        errorsDiv.style.display = 'none';

        // Gather form data
        const wali = document.getElementById('form-guru-wali').value;
        const tugas = document.getElementById('form-guru-tugas').value.trim();
        const checkedClasses = Array.from(document.querySelectorAll('input[name="form-guru-classes"]:checked')).map(el => el.value);

        // Auto-add wali kelas class to teaching classes
        if (wali && !checkedClasses.includes(wali)) {
            checkedClasses.push(wali);
        }

        const formData = {
            id: document.getElementById('form-guru-id').value,
            name: document.getElementById('form-guru-name').value.trim(),
            nip: document.getElementById('form-guru-nip').value.trim(),
            kodeGuru: document.getElementById('form-guru-kode').value.trim(),
            username: document.getElementById('form-guru-username').value.trim().toLowerCase(),
            password: document.getElementById('form-guru-password').value.trim(),
            subjects: document.getElementById('form-guru-subjects').value.trim().split(',').map(s => s.trim()).filter(s => s),
            isWaliKelas: wali.length > 0,
            waliKelasId: wali || null,
            tugasTambahan: tugas || (wali ? `Wali Kelas ${wali}` : '-'),
            teachingClasses: checkedClasses
        };

        // Submit to API
        let result;
        if (isEdit) {
            result = await window.TeacherApi.update(formData.id, formData);
        } else {
            result = await window.TeacherApi.create(formData);
        }

        // Handle response
        if (result.success) {
            document.getElementById('crud-modal').style.display = 'none';
            window.App.showToast(result.message, 'success');
            // Invalidate legacy cache
            window.DB.cache.users = null;
            await window.TeacherTable.refresh();
        } else {
            // Show server-side validation errors
            const serverErrors = (result.errors || []).map(e => e.message);
            const allErrors = serverErrors.length > 0 ? serverErrors : [result.message || 'Terjadi kesalahan.'];
            errorsDiv.innerHTML = allErrors.map(e => `<div class="form-error-item"><i data-lucide="alert-circle" style="width: 14px; height: 14px;"></i> ${e}</div>`).join('');
            errorsDiv.style.display = 'block';
            if (window.lucide) lucide.createIcons({ root: errorsDiv });
            
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Simpan';
        }
    }
};
