/**
 * SI-AKTIF Student Table Component
 * Renders student management table with skeleton loading, debounced search, and class filter.
 */

window.StudentTable = {
    debounceTimer: null,

    /**
     * Render the full student management page.
     */
    render: async (container) => {
        // Show skeleton loading first
        container.innerHTML = window.StudentTable.renderSkeleton();
        if (window.lucide) lucide.createIcons({ root: container });

        // Fetch classes for the filter dropdown
        const classes = await window.DB.getClasses();
        const result = await window.StudentApi.getAll();

        if (!result.success) {
            container.innerHTML = window.StudentTable.renderError(result.message);
            return;
        }

        container.innerHTML = window.StudentTable.renderTable(result.data, result.total, classes);
        if (window.lucide) lucide.createIcons({ root: container });
    },

    /**
     * Skeleton loading placeholder.
     */
    renderSkeleton: () => {
        const skeletonRows = Array(10).fill(0).map(() => `
            <tr>
                <td><div class="skeleton skeleton-text" style="width: 30px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 100px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 160px;"></div></td>
                <td><div class="skeleton skeleton-badge" style="width: 60px;"></div></td>
                <td><div class="skeleton skeleton-badge" style="width: 80px;"></div></td>
                <td><div class="skeleton skeleton-actions"></div></td>
            </tr>
        `).join('');

        return `
            <div class="card">
                <div class="d-flex justify-between align-center" style="margin-bottom: 1.5rem;">
                    <div>
                        <h2 class="font-heading" style="margin: 0; font-size: 1.5rem;">Manajemen Siswa</h2>
                        <p style="font-size: 0.825rem; color: var(--color-text-light); margin-top: 0.25rem;">Memuat data siswa...</p>
                    </div>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 60px; text-align: center;">No</th>
                                <th>NIS / NISN</th>
                                <th>Nama Siswa</th>
                                <th style="width: 120px;">Kelas</th>
                                <th style="width: 150px; text-align: center;">Jenis Kelamin</th>
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
     * Full table HTML.
     */
    renderTable: (students, total, classes) => {
        return `
            <div class="card">
                <div class="d-flex justify-between align-center" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h2 class="font-heading" style="margin: 0; font-size: 1.5rem;">Manajemen Siswa</h2>
                        <p style="font-size: 0.825rem; color: var(--color-text-light); margin-top: 0.25rem;">Kelola data siswa aktif SMAN 47 Jakarta. <strong>${total}</strong> siswa terdaftar.</p>
                    </div>
                    <div class="d-flex gap-2 align-center" style="flex-wrap: wrap;">
                        <div class="search-bar-wrapper" style="position: relative; width: 230px;">
                            <i data-lucide="search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--color-text-lighter);"></i>
                            <input type="text" id="search-siswa-input" class="form-control" placeholder="Cari NIS, Nama, Kelas..." style="padding-left: 2.25rem; padding-right: 2.5rem; border-radius: 99px; height: 38px; font-size: 0.825rem;" oninput="window.StudentTable.handleSearch()">
                            <div id="search-siswa-spinner" class="search-spinner" style="display: none;">
                                <div class="spinner-sm"></div>
                            </div>
                        </div>
                        <button class="btn btn-outline" style="border-radius: 10px; height: 38px; display: inline-flex; align-items: center; gap: 0.5rem; background: white;" onclick="window.StudentModal.openCSVImport()">
                            <i data-lucide="upload" style="width: 16px;"></i> Import CSV
                        </button>
                        <button class="btn btn-primary" style="border-radius: 10px; height: 38px; display: inline-flex; align-items: center; gap: 0.5rem;" onclick="window.StudentModal.openCreate()">
                            <i data-lucide="plus" style="width: 16px;"></i> Tambah Siswa
                        </button>
                    </div>
                </div>

                <div class="form-group" style="max-width: 250px; margin-bottom: 1.5rem;">
                    <label style="font-weight: 600; color: var(--color-navy-lighter); font-size: 0.825rem;">Filter Kelas</label>
                    <select class="form-control" id="admin-siswa-class" style="border-radius: 10px; height: 40px;" onchange="window.StudentTable.handleSearch()">
                        <option value="">-- Semua Kelas --</option>
                        ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>

                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 60px; text-align: center;">No</th>
                                <th>NIS / NISN</th>
                                <th>Nama Siswa</th>
                                <th style="width: 120px;">Kelas</th>
                                <th style="width: 150px; text-align: center;">Jenis Kelamin</th>
                                <th style="width: 100px; text-align: center;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="siswa-table-body">
                            ${window.StudentTable.generateRows(students)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * Generate table row HTML.
     */
    generateRows: (students) => {
        if (students.length === 0) {
            return `<tr><td colspan="6" class="empty-state">
                <div style="padding: 3rem 1rem; text-align: center;">
                    <i data-lucide="graduation-cap" style="width: 40px; height: 40px; color: var(--color-text-lighter); margin-bottom: 0.75rem;"></i>
                    <p style="color: var(--color-text-light); font-weight: 600;">Tidak ada data siswa yang cocok.</p>
                    <p style="color: var(--color-text-lighter); font-size: 0.8rem;">Coba ubah kata kunci atau filter kelas.</p>
                </div>
            </td></tr>`;
        }

        return students.map((s, index) => {
            const safeData = encodeURIComponent(JSON.stringify(s));
            return `
            <tr>
                <td style="text-align: center; color: var(--color-text-light); font-weight: 500;">${index + 1}</td>
                <td><span style="font-family: monospace; font-weight: 600; color: var(--color-navy);">${s.nis}</span></td>
                <td style="font-weight: 700; color: var(--color-navy);">${s.name}</td>
                <td><span class="badge badge-wali" style="border-radius: 6px;">${s.classId}</span></td>
                <td style="text-align: center;">
                    ${s.gender === 'L' 
                        ? `<span class="status-badge status-izin" style="font-size: 0.725rem; font-weight: 600; text-transform: none; letter-spacing: normal;">Laki-laki</span>` 
                        : `<span class="status-badge" style="font-size: 0.725rem; font-weight: 600; text-transform: none; letter-spacing: normal; background: rgba(245, 158, 11, 0.1); color: #f59e0b;">Perempuan</span>`}
                </td>
                <td>
                    <div class="d-flex gap-2 justify-center">
                        <button class="btn-icon" style="color: var(--color-primary); border-radius: 8px;" title="Edit" onclick="window.StudentModal.openEdit(decodeURIComponent('${safeData}'))"><i data-lucide="edit-2" style="width: 15px;"></i></button>
                        <button class="btn-icon" style="color: var(--color-alfa); border-radius: 8px;" title="Hapus" onclick="window.StudentTable.handleDelete('${s.id}', '${s.name.replace(/'/g, "\\'")}')"><i data-lucide="trash-2" style="width: 15px;"></i></button>
                    </div>
                </td>
            </tr>
        `}).join('');
    },

    /**
     * Debounced search + class filter handler.
     */
    handleSearch: () => {
        const spinner = document.getElementById('search-siswa-spinner');

        clearTimeout(window.StudentTable.debounceTimer);
        if (spinner) spinner.style.display = 'flex';

        window.StudentTable.debounceTimer = setTimeout(async () => {
            const searchInput = document.getElementById('search-siswa-input');
            const classSelect = document.getElementById('admin-siswa-class');
            const query = searchInput ? searchInput.value.trim() : '';
            const classId = classSelect ? classSelect.value : '';

            const result = await window.StudentApi.getAll(query, classId);
            const tbody = document.getElementById('siswa-table-body');

            if (tbody && result.success) {
                tbody.innerHTML = window.StudentTable.generateRows(result.data);
                if (window.lucide) lucide.createIcons({ root: tbody });
            }

            if (spinner) spinner.style.display = 'none';
        }, 300);
    },

    /**
     * Handle delete with confirmation.
     */
    handleDelete: (id, name) => {
        window.Admin.confirmDelete(
            `Apakah Anda yakin ingin menghapus siswa [${name}]? Data yang dihapus tidak dapat dikembalikan.`,
            async () => {
                const result = await window.StudentApi.delete(id);
                if (result.success) {
                    window.App.showToast(result.message, 'success');
                    window.DB.cache.students = null;
                    await window.StudentTable.refresh();
                } else {
                    window.App.showToast(result.message || 'Gagal menghapus siswa.', 'error');
                }
            }
        );
    },

    /**
     * Refresh table without page reload.
     */
    refresh: async () => {
        const searchInput = document.getElementById('search-siswa-input');
        const classSelect = document.getElementById('admin-siswa-class');
        const query = searchInput ? searchInput.value.trim() : '';
        const classId = classSelect ? classSelect.value : '';

        const result = await window.StudentApi.getAll(query, classId);
        const tbody = document.getElementById('siswa-table-body');

        if (tbody && result.success) {
            tbody.innerHTML = window.StudentTable.generateRows(result.data);
            if (window.lucide) lucide.createIcons({ root: tbody });
        }
    },

    /**
     * Error state.
     */
    renderError: (message) => {
        return `
            <div class="card" style="text-align: center; padding: 3rem;">
                <i data-lucide="wifi-off" style="width: 48px; height: 48px; color: var(--color-alfa); margin: 0 auto 1rem; display: block;"></i>
                <h3 class="font-heading" style="margin-bottom: 0.5rem;">Gagal Memuat Data</h3>
                <p style="color: var(--color-text-light); margin-bottom: 1.5rem;">${message}</p>
                <button class="btn btn-primary" onclick="window.StudentTable.render(document.getElementById('page-admin-siswa'))">
                    <i data-lucide="refresh-cw" style="width: 16px;"></i> Coba Lagi
                </button>
            </div>
        `;
    }
};
