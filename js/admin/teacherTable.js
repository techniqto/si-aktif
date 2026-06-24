/**
 * SI-AKTIF Teacher Table Component
 * Renders the teacher management table with skeleton loading and debounced search.
 */

window.TeacherTable = {
    debounceTimer: null,

    /**
     * Render the full teacher management page into the given container.
     * Shows skeleton loader first, then fetches data from API.
     */
    render: async (container) => {
        // Show skeleton loading first
        container.innerHTML = window.TeacherTable.renderSkeleton();
        if (window.lucide) lucide.createIcons({ root: container });

        // Fetch data from v1 API
        const result = await window.TeacherApi.getAll();

        if (!result.success) {
            container.innerHTML = window.TeacherTable.renderError(result.message);
            return;
        }

        container.innerHTML = window.TeacherTable.renderTable(result.data, result.total);
        if (window.lucide) lucide.createIcons({ root: container });
    },

    /**
     * Generate skeleton loading placeholder HTML.
     */
    renderSkeleton: () => {
        const skeletonRows = Array(8).fill(0).map(() => `
            <tr>
                <td><div class="skeleton skeleton-text" style="width: 30px;"></div></td>
                <td><div class="skeleton skeleton-badge"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 180px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 140px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 120px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 100px;"></div></td>
                <td><div class="skeleton skeleton-badge" style="width: 100px;"></div></td>
                <td><div class="skeleton skeleton-actions"></div></td>
            </tr>
        `).join('');

        return `
            <div class="card">
                <div class="d-flex justify-between align-center" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h2 class="font-heading" style="margin: 0; font-size: 1.5rem;">Manajemen Guru</h2>
                        <p style="font-size: 0.825rem; color: var(--color-text-light); margin-top: 0.25rem;">Kelola data guru SMAN 47 Jakarta, tugas tambahan, dan hak akses.</p>
                    </div>
                    <div class="d-flex gap-2 align-center">
                        <div class="skeleton" style="width: 220px; height: 38px; border-radius: 99px;"></div>
                        <div class="skeleton" style="width: 160px; height: 38px; border-radius: 10px;"></div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 60px; text-align: center;">No</th>
                                <th style="width: 110px;">Kode Guru</th>
                                <th>Nama Guru (Lengkap)</th>
                                <th>NIP</th>
                                <th>Akun Login</th>
                                <th>Mata Pelajaran</th>
                                <th>Status Tugas Tambahan</th>
                                <th style="width: 100px; text-align: center;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>${skeletonRows}</tbody>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * Generate the full table HTML with data.
     */
    renderTable: (teachers, total) => {
        return `
            <div class="card">
                <div class="d-flex justify-between align-center" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h2 class="font-heading" style="margin: 0; font-size: 1.5rem;">Manajemen Guru</h2>
                        <p style="font-size: 0.825rem; color: var(--color-text-light); margin-top: 0.25rem;">Kelola data guru SMAN 47 Jakarta. <strong>${total}</strong> guru terdaftar.</p>
                    </div>
                    <div class="d-flex gap-2 align-center">
                        <div class="search-bar-wrapper" style="position: relative; width: 250px; margin-right: 0.5rem;">
                            <i data-lucide="search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--color-text-lighter);"></i>
                            <input type="text" id="search-guru-input" class="form-control" placeholder="Cari Kode, Nama, NIP, Mapel..." style="padding-left: 2.25rem; padding-right: 2.5rem; border-radius: 99px; height: 38px; font-size: 0.825rem;" oninput="window.TeacherTable.handleSearch(this.value)">
                            <div id="search-guru-spinner" class="search-spinner" style="display: none;">
                                <div class="spinner-sm"></div>
                            </div>
                        </div>
                        <button class="btn btn-primary" style="border-radius: 10px; height: 38px; display: inline-flex; align-items: center; gap: 0.5rem;" onclick="window.TeacherModal.openCreate()">
                            <i data-lucide="plus" style="width: 16px;"></i> Tambah Guru Baru
                        </button>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 60px; text-align: center;">No</th>
                                <th style="width: 110px;">Kode Guru</th>
                                <th>Nama Guru (Lengkap)</th>
                                <th>NIP</th>
                                <th>Akun Login</th>
                                <th>Mata Pelajaran</th>
                                <th>Status Tugas Tambahan</th>
                                <th style="width: 100px; text-align: center;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="guru-table-body">
                            ${window.TeacherTable.generateRows(teachers)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * Generate table row HTML for an array of teachers.
     */
    generateRows: (teachers) => {
        if (teachers.length === 0) {
            return `<tr><td colspan="8" class="empty-state">
                <div style="padding: 3rem 1rem; text-align: center;">
                    <i data-lucide="users" style="width: 40px; height: 40px; color: var(--color-text-lighter); margin-bottom: 0.75rem;"></i>
                    <p style="color: var(--color-text-light); font-weight: 600;">Tidak ada data guru yang cocok.</p>
                    <p style="color: var(--color-text-lighter); font-size: 0.8rem;">Coba ubah kata kunci pencarian.</p>
                </div>
            </td></tr>`;
        }

        return teachers.map((u, index) => {
            // Safely encode data for onclick
            const safeData = encodeURIComponent(JSON.stringify(u));

            return `
            <tr>
                <td style="text-align: center; color: var(--color-text-light); font-weight: 500;">${index + 1}</td>
                <td><span class="badge badge-mapel" style="font-family: monospace; font-size: 0.8rem; border-radius: 6px;">${u.kodeGuru}</span></td>
                <td style="font-weight: 700; color: var(--color-navy);">${u.name}</td>
                <td><span style="font-family: monospace; font-weight: 500;">${u.nip || '-'}</span></td>
                <td>
                    <div style="font-size: 0.8rem; line-height: 1.4;">
                        <div><span style="color: var(--color-text-lighter); font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">User:</span> <code style="background: #f1f5f9; padding: 0.1rem 0.3rem; border-radius: 4px; color: var(--color-navy); font-weight: 600; font-family: monospace;">${u.username || u.kodeGuru.toLowerCase()}</code></div>
                        <div style="margin-top: 0.2rem;"><span style="color: var(--color-text-lighter); font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">Pass:</span> 
                            <span class="password-container" data-pass="${u.password || 'guru123'}" style="position: relative;">
                                <code class="password-masked" style="background: #f1f5f9; padding: 0.1rem 0.3rem; border-radius: 4px; color: var(--color-text-light); font-family: monospace;">••••••</code>
                                <button class="btn-icon toggle-password-btn" onclick="window.TeacherTable.togglePasswordVisibility(this)" style="padding: 0; background: none; border: none; cursor: pointer; color: var(--color-text-light); margin-left: 0.25rem; vertical-align: middle;">
                                    <i data-lucide="eye" style="width: 12px; height: 12px; display: inline-block;"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </td>
                <td>${u.subjects && u.subjects.length > 0 ? u.subjects.join(', ') : '-'}</td>
                <td>
                    ${u.isWaliKelas 
                        ? `<span class="badge badge-wali" style="margin-right: 0.5rem; border-radius: 6px;">Wali Kelas ${u.waliKelasId}</span>` 
                         : ''}
                    ${u.tugasTambahan && u.tugasTambahan !== '-' && !u.tugasTambahan.startsWith('Wali Kelas')
                        ? `<span class="status-badge status-izin" style="font-size: 0.725rem; font-weight: 600; padding: 0.15rem 0.5rem; text-transform: none; letter-spacing: normal;">${u.tugasTambahan}</span>` 
                        : ''}
                    ${!u.isWaliKelas && (!u.tugasTambahan || u.tugasTambahan === '-') 
                        ? `<span class="status-badge" style="background: #f1f5f9; color: var(--color-text-light); font-size: 0.725rem; text-transform: none; letter-spacing: normal;">-</span>` 
                        : ''}
                </td>
                <td>
                    <div class="d-flex gap-2 justify-center">
                        <button class="btn-icon" style="color: var(--color-primary); border-radius: 8px;" title="Edit" onclick="window.TeacherModal.openEdit(decodeURIComponent('${safeData}'))"><i data-lucide="edit-2" style="width: 15px;"></i></button>
                        <button class="btn-icon" style="color: var(--color-alfa); border-radius: 8px;" title="Hapus" onclick="window.TeacherTable.handleDelete('${u.id}', '${u.name.replace(/'/g, "\\'")}')"><i data-lucide="trash-2" style="width: 15px;"></i></button>
                    </div>
                </td>
            </tr>
        `}).join('');
    },

    /**
     * Toggle password visibility between masked and plain text.
     */
    togglePasswordVisibility: (btn) => {
        const container = btn.closest('.password-container');
        const password = container.getAttribute('data-pass');
        const codeEl = container.querySelector('code');
        
        if (codeEl.textContent === '••••••') {
            codeEl.textContent = password;
            codeEl.style.color = 'var(--color-navy)';
            codeEl.style.fontWeight = '600';
            btn.innerHTML = '<i data-lucide="eye-off" style="width: 12px; height: 12px; display: inline-block;"></i>';
        } else {
            codeEl.textContent = '••••••';
            codeEl.style.color = 'var(--color-text-light)';
            codeEl.style.fontWeight = 'normal';
            btn.innerHTML = '<i data-lucide="eye" style="width: 12px; height: 12px; display: inline-block;"></i>';
        }
        if (window.lucide) lucide.createIcons({ root: container });
    },

    /**
     * Debounced search handler. Waits 300ms after last keystroke before sending request.
     */
    handleSearch: (query) => {
        const spinner = document.getElementById('search-guru-spinner');

        clearTimeout(window.TeacherTable.debounceTimer);

        if (spinner) spinner.style.display = 'flex';

        window.TeacherTable.debounceTimer = setTimeout(async () => {
            const result = await window.TeacherApi.getAll(query.trim());
            const tbody = document.getElementById('guru-table-body');

            if (tbody && result.success) {
                tbody.innerHTML = window.TeacherTable.generateRows(result.data);
                if (window.lucide) lucide.createIcons({ root: tbody });
            }

            if (spinner) spinner.style.display = 'none';
        }, 300);
    },

    /**
     * Handle delete with confirmation modal.
     */
    handleDelete: (id, name) => {
        window.Admin.confirmDelete(
            `Apakah Anda yakin ingin menghapus guru [${name}]? Data yang dihapus tidak dapat dikembalikan.`,
            async () => {
                const result = await window.TeacherApi.delete(id);
                if (result.success) {
                    window.App.showToast(result.message, 'success');
                    // Invalidate legacy cache too
                    window.DB.cache.users = null;
                    await window.TeacherTable.refresh();
                } else {
                    window.App.showToast(result.message || 'Gagal menghapus guru.', 'error');
                }
            }
        );
    },

    /**
     * Refresh the table without full page reload.
     */
    refresh: async () => {
        const searchInput = document.getElementById('search-guru-input');
        const query = searchInput ? searchInput.value.trim() : '';
        const result = await window.TeacherApi.getAll(query);
        const tbody = document.getElementById('guru-table-body');

        if (tbody && result.success) {
            tbody.innerHTML = window.TeacherTable.generateRows(result.data);
            if (window.lucide) lucide.createIcons({ root: tbody });
        }
    },

    /**
     * Render an error state inside the container.
     */
    renderError: (message) => {
        return `
            <div class="card" style="text-align: center; padding: 3rem;">
                <i data-lucide="wifi-off" style="width: 48px; height: 48px; color: var(--color-alfa); margin: 0 auto 1rem; display: block;"></i>
                <h3 class="font-heading" style="margin-bottom: 0.5rem; color: var(--color-navy);">Gagal Memuat Data</h3>
                <p style="color: var(--color-text-light); margin-bottom: 1.5rem;">${message || 'Tidak dapat terhubung ke server.'}</p>
                <button class="btn btn-primary" onclick="window.TeacherTable.render(document.getElementById('page-admin-guru'))">
                    <i data-lucide="refresh-cw" style="width: 16px;"></i> Coba Lagi
                </button>
            </div>
        `;
    }
};
