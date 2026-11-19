/**
 * FIRMAN - Fish Canning Resource Management
 * Data Berita & Artikel TEFA Fish Canning POLIJE (js/data/berita.js)
 *
 * Pola Data Murni (Data ↔ Renderer Pattern)
 */

const berita = [
  {
    id: "1",
    judul: "Politeknik Negeri Jember laksanakan audit SNI untuk produk sarden",
    kategori: "Kegiatan",
    isFeatured: true,
    tanggal: "20 Januari 2026",
    datetime: "2026-01-20",
    gambar: "../../assets/images/Praktik-Pengalengan.jpg",
    alt: "Petugas TEFA menjalani audit SNI",
    ringkasan:
      "Politeknik Negeri Jember (Polije) telah berhasil melaksanakan audit Standar Nasional Indonesia (SNI) untuk produk Sarden kaleng di Teaching Factory (TEFA) Canning guna menjamin mutu pangan nasional.",
    penulis: "Humas Polije",
    konten: [
      "Politeknik Negeri Jember (Polije) telah berhasil melaksanakan audit Standar Nasional Indonesia (SNI) untuk produk sarden kaleng di Teaching Factory (TEFA) Canning. Audit ini merupakan langkah krusial dalam memastikan kualitas, keamanan, dan standardisasi produk sarden yang dihasilkan oleh mahasiswa dan tim teknis.",
      "Proses audit berlangsung selama tiga hari dengan melibatkan tim auditor independen dari Badan Standardisasi Nasional (BSN). Evaluasi mencakup seluruh rantai produksi, mulai dari seleksi bahan baku ikan lemuru segar, higienitas lini pengolahan, proses seaming kaleng, hingga proses sterilisasi retort dengan suhu dan tekanan tinggi.",
      "Hasil audit menunjukkan bahwa fasilitas dan operasional TEFA Canning Polije telah memenuhi parameter kepatuhan SNI 3223:2022 tentang Ikan Dalam Kemasan Kaleng, menegaskan komitmen vokasi Polije dalam menghasilkan produk bermutu industri bagi masyarakat luas."
    ]
  },
  {
    id: "2",
    judul: "Sarden SIP POLIJE: Produk pangan kaleng higienis inovasi mahasiswa vokasi",
    kategori: "Kegiatan",
    isFeatured: false,
    tanggal: "22 Januari 2026",
    datetime: "2026-01-22",
    gambar: "../../assets/images/fototefapengalengansardensipmantapjiwajosjis.png",
    alt: "Mahasiswa mengemas sarden kaleng",
    ringkasan:
      "Sarden SIP POLIJE merupakan produk pangan kaleng higienis yang dihasilkan oleh mahasiswa berbasis Teaching Factory dengan cita rasa lezat dan kaya nutrisi.",
    penulis: "Tim Media TEFA",
    konten: [
      "Sarden SIP POLIJE merupakan wujud nyata penerapan kurikulum berbasis industri di Politeknik Negeri Jember. Mahasiswa dilibatkan langsung dalam alur kerja profesional pabrik pengalengan ikan komersial.",
      "Dengan formula saus pilihan tanpa bahan pengawet sintetis berbahaya, Sarden SIP menawarkan sumber protein tinggi, asam lemak omega-3, serta kalsium yang baik bagi konsumsi harian keluarga."
    ]
  },
  {
    id: "3",
    judul: "Riset Formulasi Saus Tomat Alami Berbasis Komoditas Lokal Jember",
    kategori: "Riset",
    isFeatured: false,
    tanggal: "28 Januari 2026",
    datetime: "2026-01-28",
    gambar: "../../assets/images/tomat.png",
    alt: "Riset formulasi saus tomat alami",
    ringkasan:
      "Dosen dan mahasiswa jurusan Teknologi Pertanian Polije mengembangkan saus tomat alami dengan viskositas optimal dan antioksidan likopen tinggi.",
    penulis: "Pusat Riset Terapan Polije",
    konten: [
      "Pengembangan formula media saus pengalengan ikan terus dioptimalkan melalui riset terapan di TEFA Fish Canning Polije. Salah satu riset unggulan berfokus pada pemanfaatan tomat segar dari petani lokal Jember.",
      "Riset ini berhasil menciptakan pasta tomat dengan tingkat keasaman (pH) seimbang, warna merah cerah alami, dan stabilitas termal yang tahan terhadap suhu sterilisasi retort 121°C."
    ]
  },
  {
    id: "4",
    judul: "Edukasi Kunjungan Industri Siswa SMK: Mengenal Teknologi Retort Bertekanan",
    kategori: "Edukasi",
    isFeatured: false,
    tanggal: "3 Februari 2026",
    datetime: "2026-02-03",
    gambar: "../../assets/images/Sanitary-Food-Processing-Line 1.jpg",
    alt: "Kunjungan edukasi industri di lini TEFA Canning",
    ringkasan:
      "TEFA Canning Polije menyambut kunjungan siswa SMK Kejuruan Pengolahan Hasil Perikanan untuk mempelajari teknologi retort dan sanitasi industri modern.",
    penulis: "Unit Kemitraan Vokasi",
    konten: [
      "Sebagai pusat keunggulan pendidikan vokasi, TEFA Canning Polije secara berkala menyelenggarakan program edukasi dan transfer teknologi bagi generasi muda dan siswa SMK.",
      "Dalam kunjungan ini, peserta diajak melihat langsung pengoperasian mesin seamer otomatis, prinsip kerja retort bertekanan, dan pengujian kualitas mutu kemasan kaleng."
    ]
  },
  {
    id: "5",
    judul: "Uji Mutu Organoleptik & Mikrobiologi Produk Ikan Kaleng Lemuru",
    kategori: "Riset",
    isFeatured: false,
    tanggal: "10 Februari 2026",
    datetime: "2026-02-10",
    gambar: "../../assets/images/Praktik-Pengalengan.jpg",
    alt: "Pengujian laboratorium mutu ikan sarden",
    ringkasan:
      "Laboratorium Pengawasan Mutu Polije melakukan uji mikrobiologi berkala untuk memastikan produk ikan kaleng bebas bakteri pembusuk dan aman dikonsumsi.",
    penulis: "Lab Pengendalian Mutu",
    konten: [
      "Pengendalian mutu (Quality Control) adalah pilar terpenting dalam industri makanan kaleng. Setiap batch produksi Sarden SIP wajib melewati tahap inkubasi dan pengujian mikrobiologis sebelum didistribusikan.",
      "Hasil uji stabilitas komersial mengonfirmasi sterilitas produk dengan zero-defect pada parameter mikroba patogen seperti Clostridium botulinum."
    ]
  },
  {
    id: "6",
    judul: "Workshop Higienitas & Sanitasi Standar HACCP bagi Mahasiswa TEFA",
    kategori: "Edukasi",
    isFeatured: false,
    tanggal: "15 Februari 2026",
    datetime: "2026-02-15",
    gambar: "../../assets/images/alat-hero.webp",
    alt: "Penerapan standar sanitasi dan higienitas pekerja",
    ringkasan:
      "Pelatihan ketat mengenai Hazard Analysis and Critical Control Points (HACCP) diberikan sebelum mahasiswa memasuki lini produksi pengalengan ikan.",
    penulis: "Divisi QA/QC TEFA",
    konten: [
      "Kedisiplinan sanitasi menjadi keharusan di TEFA Canning. Setiap personel wajib mematuhi protokol pemakaian APD steril, air shower, sanitasi tangan, dan desinfeksi peralatan.",
      "Workshop ini membekali mahasiswa dengan standar sertifikasi kompetensi industri pengolahan makanan berskala global."
    ]
  },
  {
    id: "7",
    judul: "Optimalisasi Rantai Pasok Ikan Lemuru Segar dari Nelayan Puger Jember",
    kategori: "Kegiatan",
    isFeatured: false,
    tanggal: "22 Februari 2026",
    datetime: "2026-02-22",
    gambar: "../../assets/images/sarden.png",
    alt: "Pasokan ikan lemuru segar kualitas pilihan",
    ringkasan:
      "Kerja sama strategis TEFA Canning Polije dengan kelompok nelayan pantai Puger menjamin pasokan ikan segar berkualitas tinggi dan menopang ekonomi nelayan lokal.",
    penulis: "Humas Polije",
    konten: [
      "Kualitas ikan kaleng berawal dari kesegaran bahan baku. TEFA Polije menjalin kemitraan erat dengan nelayan lokal Puger, Jember selatan, menerapkan rantai dingin (cold chain) sejak kapal bersandar.",
      "Ikan lemuru langsung disortir dan diproses dalam kondisi kesegaran maksimal untuk mempertahankan tekstur kenyal dan rasa gurih alami."
    ]
  },
  {
    id: "8",
    judul: "Inovasi Varian Sarden Saus Cabai dan Tartar: Riset Preferensi Pasar",
    kategori: "Riset",
    isFeatured: false,
    tanggal: "2 Maret 2026",
    datetime: "2026-03-02",
    gambar: "../../assets/images/kalengsardenpolijesippengensardenpakenasitambahsambelmakanpakekerupuk.png",
    alt: "Varian produk sarden inovatif",
    ringkasan:
      "Diversifikasi produk sarden dengan sensasi pedas saus cabai dan kelezatan saus tartar mendapatkan respons antusias dalam uji preferensi konsumen muda.",
    penulis: "Divisi R&D TEFA",
    konten: [
      "Merespons selera pasar generasi muda yang menginginkan variasi rasa baru, tim R&D TEFA merilis varian Saus Cabai Pedas Gurih dan Saus Tartar Creamy.",
      "Uji kesukaan (hedonik) mencatatkan skor kepuasan lebih dari 88%, memperluas potensi jangkauan produk ke segmen konsumen yang lebih luas."
    ]
  }
];

// Kompatibilitas jika dipanggil dari environment node/module
if (typeof module !== "undefined" && module.exports) {
  module.exports = berita;
}

