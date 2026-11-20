/**
 * FIRMAN - Fish Canning Resource Management
 * Data Alat & Mesin Produksi TEFA Fish Canning POLIJE (js/data/alat.js)
 *
 * Pola Data Murni (Data ↔ Renderer Pattern)
 */

const alat = [
  {
    id: "1",
    judul: "Mesin Pemotong & Pengiris Ikan (Fish Cutter)",
    gambar: "../assets/images/mesinpengirisikan.webp",
    alt: "Mesin pemotong dan pengiris ikan sarden lemuru",
    deskripsi: [
      "Digunakan untuk memotong kepala, ekor, dan membagi ikan lemuru segar menjadi potongan seragam sesuai tinggi kaleng secara presisi.",
      "Dilengkapi pisau baja tahan karat putar kecepatan tinggi untuk memastikan potongan daging ikan rapi dan tidak merusak tekstur.",
    ],
    judulSpesifikasi: "Spesifikasi",
    spesifikasi: [
      "Jenis: Rotary Blade Fish Cutter",
      "Kapasitas: 150–200 kg/jam",
      "Sistem: Multi-blade revolving cutter",
      "Material: Stainless Steel 304 (Food Grade)",
      "Ketebalan Potong: 8–12 cm (dapat disesuaikan)",
      "Daya Listrik: 1.5 kW / 220V",
    ],
  },
  {
    id: "2",
    judul: "Mesin Pencuci Ikan (Brush Type Washer)",
    gambar: "../assets/images/Sanitary-Food-Processing-Line 1.jpg",
    alt: "Mesin pencuci ikan berputar dengan semprotan air bertekanan",
    deskripsi: [
      "Membersihkan ikan dari sisa darah, lendir, dan sisik menggunakan air mengalir bertekanan serta sikat putar bertekstur lembut.",
      "Menjamin higienitas bahan baku ikan sebelum masuk ke tahap pengisian kaleng dan meminimalkan bau amis berlebih.",
    ],
    judulSpesifikasi: "Spesifikasi",
    spesifikasi: [
      "Jenis: Brush Type Rotary Washer",
      "Kapasitas: 200–250 kg/jam",
      "Sistem: Rotating brush + high-pressure spray nozzle",
      "Material: Stainless Steel 304",
      "Tekanan Air: 3–5 bar",
      "Daya Listrik: 1.5 kW / 380V",
    ],
  },
  {
    id: "3",
    judul: "Exhaust Box (Mesin Exhausting Uap Panas)",
    gambar: "../assets/images/Praktik-Pengalengan.jpg",
    alt: "Exhaust box pemanas uap untuk mengeluarkan udara dari kaleng",
    deskripsi: [
      "Berfungsi menaikkan suhu isi kaleng dan mendesak udara serta oksigen keluar sebelum proses penutupan kaleng (seaming) dilakukan.",
      "Mencegah terjadinya oksidasi dan korosi internal kaleng serta menciptakan kondisi vakum yang sempurna setelah kaleng mendingin.",
    ],
    judulSpesifikasi: "Spesifikasi",
    spesifikasi: [
      "Jenis: Steam Tunnel Conveyor Exhauster",
      "Suhu Operasional: 85°C – 95°C",
      "Waktu Retensi: 5–10 menit di dalam tunnel",
      "Sumber Panas: Direct steam injection dari boiler",
      "Material: Heavy-duty Stainless Steel 304",
      "Kapasitas: Hingga 60 kaleng per menit",
    ],
  },
  {
    id: "4",
    judul: "Mesin Penutup Kaleng (Automatic Can Seamer)",
    gambar: "../assets/images/alat-hero.webp",
    alt: "Mesin penutup kaleng otomatis double seaming",
    deskripsi: [
      "Mesin presisi tinggi yang melakukan pelipatan ganda (double seaming) antara flange badan kaleng dan tutup kaleng secara hermetis kedap udara.",
      "Tingkat kekedapan lipatan diuji secara berkala untuk menjamin standar sterilitas pangan tanpa ada risiko kebocoran mikro.",
    ],
    judulSpesifikasi: "Spesifikasi",
    spesifikasi: [
      "Jenis: Semi-Automatic Double Seamer",
      "Kapasitas: 30–40 kaleng per menit",
      "Ukuran Kaleng: Standar 425g (Diameter 300 / 307)",
      "Akurasi Lipatan: Tightness ratio > 75% (Standar SNI 3223)",
      "Daya Listrik: 2.2 kW / 380V 3-Phase",
      "Material: Food Grade Contact Parts SS304",
    ],
  },
  {
    id: "5",
    judul: "Retort Autoclave Sterilizer (Sterilisasi Tekanan)",
    gambar: "../assets/images/Praktik-Pengalengan.jpg",
    alt: "Mesin retort autoclave sterilisasi uap bertekanan tinggi",
    deskripsi: [
      "Unit sterilisasi termal komersial bertekanan tinggi untuk menginaktivasi seluruh mikroorganisme patogen dan spora tahan panas (Clostridium botulinum).",
      "Dilengkapi pengatur suhu otomatis dan pencatat grafik termal digital untuk memastikan tercapainya kecukupan nilai sterilisasi (F0 value).",
    ],
    judulSpesifikasi: "Spesifikasi",
    spesifikasi: [
      "Jenis: Horizontal Steam Pressure Retort",
      "Suhu Sterilisasi: 121.1°C",
      "Tekanan Kerja: 1.5–2.0 bar (Overpressure counter system)",
      "Kapasitas: 200–300 kaleng per siklus batch",
      "Sistem Kontrol: Digital PLC Controller & Temperature Logger",
      "Sertifikasi: Uji Bejana Tekanan Depnaker & Standar SNI",
    ],
  },
];

// Kompatibilitas environment node/module jika ada
if (typeof module !== "undefined" && module.exports) {
  module.exports = alat;
}
