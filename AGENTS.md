# AGENTS.md — Panduan Kerja Project FIRMAN

> Dokumen ini adalah panduan praktis untuk agent AI (dan kontributor)
> yang bekerja di project **FIRMAN – Fish Canning Resource Management**.

---

## 1. Tech Stack

| Layer       | Detail                                                  |
| ----------- | ------------------------------------------------------- |
| Markup      | HTML biasa (tanpa framework/templating)                 |
| Styling     | **Tailwind CSS v4** (`@tailwindcss/cli ^4.3.3`)        |
| JavaScript  | Vanilla JS (ES Modules / script tag), tanpa bundler     |
| Build       | `npx @tailwindcss/cli -i ./src/input.css -o ./style.css`|
| Package mgr | npm (ada juga pnpm-lock.yaml)                           |

---

## 2. Struktur Direktori

```
FIRMAN/
├── index.html              ← Halaman utama (landing page)
├── script.js               ← JS utama untuk index.html
├── style.css               ← ⚠️ OUTPUT BUILD — jangan edit langsung
├── tailwind.config.js      ← Config Tailwind (content paths, custom colors)
├── package.json            ← Scripts: dev, build
│
├── src/
│   └── input.css           ← ✅ Sumber CSS — semua perubahan CSS di sini
│
├── js/
│   ├── alat-page.js        ← Renderer halaman alat (prefix: alat-*)
│   ├── production-page.js  ← Renderer halaman produksi (prefix: production-*)
│   ├── script.js           ← JS tambahan / shared utilities
│   └── data/
│       ├── alat.js          ← Data array: const alat = [...]
│       └── produksi.js      ← Data array: const tahapanProduksi = [...]
│
├── page/
│   ├── alat.html            ← Halaman daftar alat produksi
│   ├── produksi.html        ← Halaman tahapan produksi
│   ├── contact.html         ← Halaman kontak
│   ├── login.html           ← Halaman login
│   ├── admin/               ← Dashboard admin (index, manajemen-*)
│   └── berita/              ← Halaman berita (index, detail)
│
├── assets/
│   ├── icons/               ← SVG icons
│   ├── images/              ← Gambar produk, foto tefa, dll
│   ├── logo.svg             ← Logo utama
│   └── logo-footer.svg      ← Logo footer
│
└── node_modules/            ← (gitignored)
```

---

## 3. Aturan Kerja

### 3.1 CSS — Edit Sumber, Bukan Output

- ✅ Ubah `src/input.css`
- ❌ **Jangan** edit `style.css` secara langsung — file ini di-generate oleh build
- Tailwind v4 menggunakan `@theme {}` untuk custom design tokens (warna, font)
- Custom class menggunakan `@apply` dalam `@layer base` atau langsung di selector
- Breakpoint yang sudah dipakai:
  - `max-width: 380px` — ultra-small
  - `max-width: 480px` — mobile kecil
  - `max-width: 640px` — mobile
  - `max-width: 768px` — tablet portrait
  - `max-width: 900px` — tablet landscape
  - `max-width: 1024px` — tablet/small desktop
  - Tailwind breakpoints: `sm`, `md`, `lg`, `md:max-lg`, `max-md`

### 3.2 Class Naming & Prefix

Setiap halaman/section memiliki prefix class tersendiri. **Pertahankan prefix ini:**

| Halaman/Section | Prefix                    | Contoh                                     |
| --------------- | ------------------------- | ------------------------------------------ |
| Navbar          | `main-navbar`, `nav-*`, `mobile-nav-*` | `.nav-item`, `.mobile-nav-link`  |
| Hero            | `hero-*`, `kaleng-*`, `btn-slider*`    | `.hero-text-headline`, `.kaleng-tengah` |
| About           | `about-*`                 | `.about-feature`, `.about-photo-main`      |
| Products        | `product-*`, `products-*` | `.product-card`, `.products-grid`          |
| Gallery         | `gallery-*`               | `.gallery-card`, `.gallery-fan-container`  |
| Article         | `article-*`, `recent-*`   | `.article-card`, `.recent-item`            |
| FAQ             | `faq-*`, `form-*`         | `.faq-item`, `.form-input`                 |
| Footer          | `site-footer-*`           | `.site-footer-brand`, `.site-footer-nav`   |
| Alat            | `alat-*`                  | `.alat-card`, `.alat-img`                  |
| Produksi        | `production-*`            | `.production-step`, `.production-card`     |
| Title           | `title-section`, `title-*`| `.title-eyebrow`, `.title-heading`         |

> ⚠️ Jangan rename atau refactor class yang tidak diminta.

### 3.3 JavaScript — Pisahkan Data dari Renderer

Project sudah menerapkan pola **data ↔ renderer**:

```
js/data/alat.js       → const alat = [...]          ← data murni
js/alat-page.js       → createAlatCard(item)        ← renderer / DOM builder
```

- **Pertahankan pola ini** untuk halaman baru
- Data file hanya berisi array/object, tanpa manipulasi DOM
- Renderer membaca data, membangun element, dan memasukkan ke container
- Validasi data dan tampilkan kondisi error secara eksplisit (bukan diam-diam):
  ```js
  if (!Array.isArray(data) || data.length === 0) {
    container.textContent = "Data tidak tersedia.";
    return;
  }
  ```
- Gunakan `loading="lazy"` pada gambar dan tangani `error` event untuk placeholder

### 3.4 Jaga Konsistensi & Jangan Merusak

- Perubahan di satu halaman **tidak boleh** merusak navbar, footer, atau halaman lain
- Jika diminta perbaikan mobile, **jangan mengubah** tampilan desktop
- Jangan ubah konten teks, gambar, desain, atau dependency tanpa alasan terkait langsung
- Halaman di `page/` menggunakan path relatif ke root (`../style.css`, `../assets/`, `../js/`)

### 3.5 Responsive & Aksesibilitas

**Responsive:**
- Tidak boleh ada overflow horizontal (`overflow-x`)
- Konten tidak terpotong di layar kecil
- Teks harus nyaman dibaca (min ~12px body text di mobile)
- Elemen tidak menempel langsung ke tepi layar — beri padding
- Gunakan breakpoint yang sudah ada sebelum menambah yang baru
- Test pada: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1024px, 1440px

**Aksesibilitas:**
- Gunakan elemen HTML semantik (`<nav>`, `<section>`, `<article>`, `<aside>`, `<footer>`)
- Semua gambar harus punya `alt` deskriptif
- Tombol dan link harus punya label jelas (`aria-label` kalau tidak ada teks visible)
- Form input harus punya `<label>` yang terhubung
- `aria-expanded` pada tombol toggle (sudah dipakai di navbar & FAQ)

---

## 4. Design Tokens

Didefinisikan di `src/input.css` dalam block `@theme {}`:

```css
--font-poppins: 'Poppins', sans-serif;
--font-jakarta: 'Plus Jakarta Sans', sans-serif;

--color-primary: #D33131;
--color-primary-hover: #c92b2b;
--color-text-main: #222222;
--color-bg-hero: #ffffff;
--color-bg-surface: #ffffff;
```

Ada juga custom colors di `tailwind.config.js`: `ocean`, `tuna`, `coral`.

---

## 5. Build & Verifikasi

### Build CSS
```bash
npx @tailwindcss/cli -i ./src/input.css -o ./style.css
```

### Development (watch mode)
```bash
npm run dev
# atau: npx @tailwindcss/cli -i ./src/input.css -o ./style.css --watch
```

### Production build
```bash
npm run build
# atau: npx @tailwindcss/cli -i ./src/input.css -o ./style.css --minify
```

### Verifikasi setelah perubahan
1. Build CSS:
   ```bash
   npx @tailwindcss/cli -i ./src/input.css -o ./style.css
   ```
2. Cek whitespace / conflict:
   ```bash
   git diff --check
   ```
3. Untuk perubahan UI, periksa tampilan browser pada **desktop (1440px)** dan **mobile (375px)**
4. Belum ada script `test` atau `lint` — verifikasi manual

---

## 6. Checklist Sebelum Commit

- [ ] Hanya file yang relevan dengan permintaan yang berubah
- [ ] CSS diedit di `src/input.css`, bukan `style.css`
- [ ] `style.css` di-rebuild setelah perubahan CSS
- [ ] Tidak ada class yang di-rename tanpa alasan
- [ ] Prefix halaman dipertahankan (`alat-*`, `production-*`, dll)
- [ ] Tidak ada overflow horizontal di mobile
- [ ] Navbar & footer tetap berfungsi normal
- [ ] Gambar punya alt text
- [ ] Tombol/link punya label yang jelas
- [ ] `git diff --check` bersih (tanpa trailing whitespace / conflict markers)

---

## 7. Catatan untuk Agent AI

Saat melaporkan hasil perubahan, sertakan:

1. **Daftar file yang diubah** beserta ringkasan perubahan
2. **Cara verifikasi** — langkah browser/manual untuk mengecek hasilnya
3. **Selector/nilai penting** yang bisa dikustomisasi oleh user
4. **Alasan** untuk setiap perubahan di luar permintaan (jika ada)

### Prompt singkat untuk agent lain:

> Kerjakan perubahan di project ini dengan mengikuti struktur dan pola yang sudah ada.
> Project memakai HTML, CSS, JavaScript biasa dan Tailwind CSS v4.
> Halaman ada di `page/`, sumber CSS ada di `src/input.css`, JavaScript ada di `js/`,
> dan data ada di `js/data/`. Jangan edit `style.css` secara langsung karena itu file
> hasil build. Pertahankan class naming/prefix yang sudah dipakai, seperti `alat-*` dan
> `production-*`. Ubah hanya bagian yang berkaitan dengan permintaan; jangan merusak
> halaman lain, navbar/footer, data, atau tampilan desktop jika tidak diminta.
> Pastikan responsive, tidak ada overflow horizontal, dan konten nyaman dibaca di mobile
> maupun desktop. Gunakan HTML semantik dan tangani error secara jelas.
> Setelah perubahan, build CSS dengan
> `npx @tailwindcss/cli -i ./src/input.css -o ./style.css`,
> jalankan `git diff --check`, lalu laporkan file yang diubah, cara verifikasi,
> dan selector/nilai penting yang bisa dikustom sendiri.

