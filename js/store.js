/* =====================================================================
   store.js
   Lapisan data + helper untuk prototype Firman.
   Semua data disimpan di localStorage browser (tanpa database).

   Koleksi : pesanan, stok, produksi
   Kunci   : firman:v1:<koleksi>
   Console : Firman.reset() mengembalikan semua data ke data awal.
   ===================================================================== */
(function (w, d) {
    'use strict';

    var NS = 'firman:v1:';
    var NO_STORAGE = 'Penyimpanan browser tidak tersedia, data tidak akan tersimpan.';
    var memory = {};

    var canStore = (function () {
        try {
            w.localStorage.setItem(NS + '__probe', '1');
            w.localStorage.removeItem(NS + '__probe');
            return true;
        } catch (e) {
            return false;
        }
    })();

    /* ------------------------------------------------------------------
       Data awal (diambil dari mockup). Dipakai sekali, saat kunci
       koleksi belum ada di localStorage.
       ------------------------------------------------------------------ */
    var SEEDS = {
        pesanan: [
            { kode: 'PSN-1037', pelanggan: 'Distributor Nusantara Jaya', produk: 'Tuna dalam Minyak 170 g', qty: 100, total: 48000000, tgl: '2026-10-23', status: 'Selesai' },
            { kode: 'PSN-1038', pelanggan: 'Warung Bahari', produk: 'Sarden Saus Tomat 155 g', qty: 30, total: 9750000, tgl: '2026-10-24', status: 'Selesai' },
            { kode: 'PSN-1039', pelanggan: 'Hotel Mawar Catering', produk: 'Makarel Saus Cabai 425 g', qty: 25, total: 11250000, tgl: '2026-10-25', status: 'Baru' },
            { kode: 'PSN-1040', pelanggan: 'Supermarket Sejahtera', produk: 'Tuna dalam Minyak 170 g', qty: 60, total: 28800000, tgl: '2026-10-25', status: 'Dikirim' },
            { kode: 'PSN-1041', pelanggan: 'Toko Laut Segar', produk: 'Sarden Saus Tomat 155 g', qty: 40, total: 13000000, tgl: '2026-10-26', status: 'Diproses' }
        ],
        stok: [
            { kode: 'BHN-001', nama: 'Ikan Lemuru Segar', kat: 'Ikan', stok: 850, sat: 'kg', min: 500, harga: 14000, sup: 'KUD Mina Samudra' },
            { kode: 'BHN-002', nama: 'Ikan Tuna Loin Beku', kat: 'Ikan', stok: 320, sat: 'kg', min: 400, harga: 52000, sup: 'PT Samudra Beku' },
            { kode: 'BHN-003', nama: 'Kaleng Kosong 155 g', kat: 'Kemasan', stok: 18000, sat: 'pcs', min: 20000, harga: 1800, sup: 'PT Kemasan Logam' },
            { kode: 'BHN-004', nama: 'Saus Tomat Pekat', kat: 'Bahan tambahan', stok: 0, sat: 'kg', min: 150, harga: 22000, sup: 'CV Tomat Prima' },
            { kode: 'BHN-005', nama: 'Garam Industri', kat: 'Bahan tambahan', stok: 260, sat: 'kg', min: 100, harga: 4500, sup: 'PT Garam Nusantara' },
            { kode: 'BHN-006', nama: 'Ikan Lemuru Segar', kat: 'Ikan', stok: 850, sat: 'kg', min: 500, harga: 14000, sup: 'KUD Mina Samudra' }
        ],
        produksi: [
            { kode: 'PRD-221', produk: 'Tuna dalam Minyak 170 g', target: 9000, hasil: 9000, tgl: '2026-10-26', pj: 'Andi', status: 'Selesai' },
            { kode: 'PRD-222', produk: 'Sarden Saus Tomat 155 g', target: 10000, hasil: 6500, tgl: '2026-10-28', pj: 'Rina', status: 'Berjalan' },
            { kode: 'PRD-223', produk: 'Makarel Saus Cabai 425 g', target: 5000, hasil: 0, tgl: '2026-10-29', pj: 'Fajar', status: 'Direncanakan' },
            { kode: 'PRD-224', produk: 'Tuna dalam Minyak 170 g', target: 8000, hasil: 3200, tgl: '2026-10-27', pj: 'Dimas', status: 'Tertunda' },
            { kode: 'PRD-225', produk: 'Sarden Saus Tomat 155 g', target: 12000, hasil: 12000, tgl: '2026-10-25', pj: 'Sari', status: 'Selesai' }
        ]
    };

    /* Urutan tampil default tiap koleksi. */
    function cmp(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
    var SORT = {
        pesanan: function (a, b) { return cmp(b.tgl, a.tgl) || b.createdAt - a.createdAt; },
        produksi: function (a, b) { return b.createdAt - a.createdAt; },
        stok: function (a, b) { return a.createdAt - b.createdAt; }
    };

    /* Warna badge (kelas CSS .badge.<warna> yang sudah ada). */
    var BADGE = {
        pesanan: { Baru: 'gray', Diproses: 'yellow', Dikirim: 'blue', Selesai: 'green', Dibatalkan: 'red' },
        produksi: { Direncanakan: 'gray', Berjalan: 'yellow', Selesai: 'green', Tertunda: 'red' },
        stok: { Aman: 'green', Menipis: 'yellow', Habis: 'red' }
    };

    var LABEL = { pesanan: 'Pesanan', stok: 'Bahan baku', produksi: 'Batch produksi' };

    /* ------------------------------------------------------------------
       Format & utilitas
       ------------------------------------------------------------------ */
    var BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function num(n) {
        n = Math.round(Number(n) || 0);
        return (n < 0 ? '-' : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function rp(n) { return 'Rp ' + num(n); }

    function tgl(iso) {
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
        if (!m) return iso || '-';
        return parseInt(m[3], 10) + ' ' + BULAN[parseInt(m[2], 10) - 1] + ' ' + m[1];
    }

    function byId(id) { return d.getElementById(id); }

    function setText(id, text) {
        var el = byId(id);
        if (el) el.textContent = text;
    }

    function uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function stokStatus(r) {
        if (Number(r.stok) <= 0) return 'Habis';
        if (Number(r.stok) < Number(r.min)) return 'Menipis';
        return 'Aman';
    }

    function badge(kind, label) {
        return '<span class="badge ' + (BADGE[kind][label] || 'gray') + '">' + esc(label) + '</span>';
    }

    var toastTimer;
    function toast(text) {
        var el = byId('toast');
        if (!el) return;
        el.textContent = text;
        el.classList.add('on');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2600);
    }

    /* Pesan singkat yang ditampilkan di halaman berikutnya (setelah redirect). */
    function flash(text) {
        try { w.sessionStorage.setItem(NS + 'flash', text); } catch (e) { /* abaikan */ }
    }
    function takeFlash() {
        try {
            var t = w.sessionStorage.getItem(NS + 'flash');
            w.sessionStorage.removeItem(NS + 'flash');
            return t;
        } catch (e) { return null; }
    }

    /* ------------------------------------------------------------------
       Akses localStorage
       ------------------------------------------------------------------ */
    function seed(name) {
        return SEEDS[name].map(function (r, i) {
            var rec = Object.assign({}, r);
            rec.id = name + '-' + r.kode.toLowerCase();
            rec.createdAt = i + 1; // data baru memakai Date.now(), selalu lebih besar
            return rec;
        });
    }

    function save(name, list) {
        var json = JSON.stringify(list);
        try {
            if (canStore) w.localStorage.setItem(NS + name, json);
            else memory[name] = json;
            return true;
        } catch (e) {
            return false;
        }
    }

    function load(name) {
        var raw = null;
        try { raw = canStore ? w.localStorage.getItem(NS + name) : (memory[name] || null); } catch (e) { /* abaikan */ }
        if (raw != null) {
            try {
                var parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) { /* data rusak: isi ulang dari data awal */ }
        }
        var fresh = seed(name);
        save(name, fresh);
        return fresh;
    }

    /* ------------------------------------------------------------------
       CRUD
       ------------------------------------------------------------------ */
    function all(name) {
        return load(name).slice().sort(SORT[name]);
    }

    function find(name, id) {
        var list = load(name);
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) return list[i];
        }
        return null;
    }

    function kodeTaken(name, kode, exceptId) {
        var k = String(kode).trim().toLowerCase();
        return load(name).some(function (r) {
            return r.id !== exceptId && String(r.kode).trim().toLowerCase() === k;
        });
    }

    function add(name, data) {
        var list = load(name);
        var rec = Object.assign({}, data, { id: uid(), createdAt: Date.now() });
        list.push(rec);
        return save(name, list) ? rec : null;
    }

    function update(name, id, data) {
        var list = load(name);
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                list[i] = Object.assign({}, list[i], data, { id: list[i].id, createdAt: list[i].createdAt });
                return save(name, list) ? list[i] : null;
            }
        }
        return null;
    }

    function remove(name, id) {
        var list = load(name);
        var next = list.filter(function (r) { return r.id !== id; });
        if (next.length === list.length) return false;
        return save(name, next);
    }

    function reset() {
        Object.keys(SEEDS).forEach(function (name) { save(name, seed(name)); });
    }

    /* ------------------------------------------------------------------
       Halaman daftar (dashboard tiap modul)
       cfg: collection, colspan, addLabel, statusOf(r), searchText(r),
            row(r), stats(allRecords)
       Elemen yang dibutuhkan: #tbody #q #fstatus #foot #overlay #dok
       #dcancel #toast
       ------------------------------------------------------------------ */
    function initList(cfg) {
        var tbody = byId('tbody');
        var q = byId('q');
        var sel = byId('fstatus');
        var foot = byId('foot');
        var ov = byId('overlay');
        var dok = byId('dok');
        var dcancel = byId('dcancel');
        var pendingId = null;

        function emptyRow(text) {
            return '<tr><td colspan="' + cfg.colspan + '" style="text-align:center;padding:28px 12px">' + text + '</td></tr>';
        }

        function render() {
            var everything = all(cfg.collection);
            var term = q.value.trim().toLowerCase();
            var status = sel.value;

            var shown = everything.filter(function (r) {
                var okStatus = status === 'Semua status' || cfg.statusOf(r) === status;
                var okText = !term || cfg.searchText(r).toLowerCase().indexOf(term) !== -1;
                return okStatus && okText;
            });

            if (!everything.length) {
                tbody.innerHTML = emptyRow('Belum ada data. Klik “' + esc(cfg.addLabel) + '” untuk menambahkan.');
            } else if (!shown.length) {
                tbody.innerHTML = emptyRow('Tidak ada data yang cocok. Ubah kata kunci atau filter status.');
            } else {
                tbody.innerHTML = shown.map(cfg.row).join('');
            }

            foot.textContent = 'Menampilkan ' + shown.length + ' dari ' + everything.length + ' data';
            cfg.stats(everything);
        }

        function openModal(id) {
            pendingId = id;
            ov.hidden = false;
            if (dcancel) dcancel.focus();
        }

        function closeModal() {
            pendingId = null;
            ov.hidden = true;
        }

        tbody.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('.btn-delete') : null;
            if (!btn) return;
            e.preventDefault();
            openModal(btn.getAttribute('data-id'));
        });

        q.addEventListener('input', render);
        sel.addEventListener('change', render);

        if (dcancel) dcancel.addEventListener('click', closeModal);
        ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(); });
        d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

        dok.addEventListener('click', function () {
            var id = pendingId;
            closeModal();
            if (id && remove(cfg.collection, id)) {
                render();
                toast('Data dihapus');
            } else {
                toast('Data gagal dihapus. Muat ulang halaman, lalu coba lagi.');
            }
        });

        // Data bisa berubah dari tab lain.
        w.addEventListener('storage', function (e) {
            if (e.key === NS + cfg.collection) render();
        });

        render();

        var msg = takeFlash();
        if (msg) toast(msg);
        else if (!canStore) toast(NO_STORAGE);
    }

    /* ------------------------------------------------------------------
       Halaman form (create & edit)
       cfg: collection, mode ('create' | 'edit')
       Nama input (atribut name) = nama properti data.
       Elemen yang dibutuhkan: #form #fcrumb #toast
       ------------------------------------------------------------------ */
    function initForm(cfg) {
        var form = byId('form');
        if (!form) return;

        var editing = cfg.mode === 'edit';
        var backTo = 'dashboard.html';
        var crumb = byId('fcrumb');
        var kodeEl = form.elements.kode;
        var submitBtn = form.querySelector('button[type="submit"]');
        var rec = null;

        function fields() {
            return Array.prototype.filter.call(form.elements, function (el) {
                return el.name && el.type !== 'submit' && el.type !== 'button';
            });
        }

        if (!canStore) toast(NO_STORAGE);

        if (editing) {
            var id = new URLSearchParams(w.location.search).get('id');
            rec = id ? find(cfg.collection, id) : null;

            if (!rec) {
                if (submitBtn) submitBtn.disabled = true;
                toast('Data tidak ditemukan. Kembali ke daftar...');
                setTimeout(function () { w.location.href = backTo; }, 1500);
                return;
            }

            fields().forEach(function (el) {
                if (Object.prototype.hasOwnProperty.call(rec, el.name)) el.value = rec[el.name];
            });
            if (crumb) crumb.textContent = rec.kode;
        } else if (crumb) {
            crumb.textContent = 'Tambah';
        }

        kodeEl.addEventListener('input', function () { kodeEl.setCustomValidity(''); });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var data = {};
            fields().forEach(function (el) {
                data[el.name] = el.type === 'number' ? Number(el.value) : el.value.trim();
            });

            if (kodeTaken(cfg.collection, data.kode, rec && rec.id)) {
                kodeEl.setCustomValidity('Kode sudah dipakai. Gunakan kode lain.');
                kodeEl.reportValidity();
                return;
            }

            var saved = editing ? update(cfg.collection, rec.id, data) : add(cfg.collection, data);
            if (!saved) {
                toast('Data gagal disimpan. Periksa penyimpanan browser, lalu coba lagi.');
                return;
            }

            if (submitBtn) submitBtn.disabled = true;
            flash(LABEL[cfg.collection] + (editing ? ' berhasil diperbarui' : ' berhasil ditambahkan'));
            w.location.href = backTo;
        });
    }

    /* ------------------------------------------------------------------ */
    w.Firman = {
        all: all,
        find: find,
        add: add,
        update: update,
        remove: remove,
        reset: reset,
        kodeTaken: kodeTaken,
        stokStatus: stokStatus,
        badge: badge,
        esc: esc,
        num: num,
        rp: rp,
        tgl: tgl,
        setText: setText,
        toast: toast,
        initList: initList,
        initForm: initForm
    };
})(window, document);