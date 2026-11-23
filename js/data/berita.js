/**
 * FIRMAN - Fish Canning Resource Management
 * Data Berita & Artikel TEFA Fish Canning POLIJE (js/data/berita.js)
 *
 * Pola Data Murni (Data ↔ Renderer Pattern)
 * Terurut berdasarkan tanggal terbaru (Order by Date Descending).
 */

const berita = [
  {
    id: "1",
    judul: "Sarden SIP Raih Juara Pertama Lomba Inovasi Produk Pangan Nasional",
    kategori: "Pencapaian",
    isFeatured: true,
    tanggal: "2 Maret 2026",
    datetime: "2026-03-02",
    gambar: "../../assets/images/pencapian1.png",
    alt: "Penghargaan Juara Pertama Inovasi Produk Pangan Nasional Sarden SIP POLIJE",
    ringkasan:
      "Sarden SIP berhasil meraih juara pertama dalam ajang bergengsi Lomba Inovasi Produk Pangan Nasional berkat keunggulan cita rasa, formulasi alami, dan standar mutu industri modern.",
    penulis: "Admin TEFA",
    konten: [
      "Sarden SIP produksi Teaching Factory (TEFA) Fish Canning Politeknik Negeri Jember berhasil menorehkan prestasi gemilang dengan meraih juara pertama dalam Lomba Inovasi Produk Pangan Nasional 2026 yang diselenggarakan oleh Kementerian Perindustrian bekerja sama dengan asosiasi industri pangan nasional. Pencapaian ini menjadi bukti konkret bahwa produk olahan pangan hasil riset vokasi dan produksi mahasiswa POLIJE memiliki kualitas kompetitif yang mampu bersaing di pasar nasional.",
      "Ajang kompetisi tahunan ini diikuti oleh puluhan institusi pendidikan tinggi dan pelaku industri pangan dari seluruh Indonesia. Aspek penilaian yang diterapkan tim juri independen meliputi kebaruan inovasi formulasi saus alami tanpa bahan pengawet sintetis, efektivitas proses pengolahan termal dengan teknologi retort, desain kemasan food-grade bersertifikasi SNI, serta kelayakan ekonomi dan rencana komersialisasi produk yang terstruktur.",
      "Direktur Politeknik Negeri Jember bersama jajaran pengelola TEFA menyampaikan apresiasi mendalam atas dedikasi mahasiswa serta dosen pembimbing yang terlibat dalam pengembangan varian unggulan Sarden SIP. Keberhasilan ini tidak lepas dari integrasi kurikulum berbasis Teaching Factory, di mana mahasiswa dilatih secara langsung mempraktikkan regulasi Good Manufacturing Practice (GMP) dan Hazard Analysis Critical Control Point (HACCP).",
      "Melalui penghargaan bergengsi ini, TEFA Fish Canning POLIJE semakin mantap memperluas penetrasi pasar produk Sarden SIP ke jaringan retail modern, distributor daerah, serta pengadaan institusional. Prestasi ini diharapkan dapat memotivasi seluruh civitas akademika untuk terus melahirkan riset terapan yang aplikatif dan berdampak nyata bagi kedaulatan pangan maritim Indonesia.",
    ],
  },
  {
    id: "2",
    judul: "Dosen dan Mahasiswa POLIJE Kembangkan Produk Olahan Surimi Berbasis Ikan Lemuru",
    kategori: "Inovasi",
    isFeatured: false,
    tanggal: "26 Februari 2026",
    datetime: "2026-02-26",
    gambar: "../../assets/images/sarden.png",
    alt: "Ikan lemuru segar bahan baku pengembangan produk olahan surimi",
    ringkasan:
      "Tim riset terapan TEFA POLIJE sukses mengembangkan diversifikasi produk surimi berkualitas tinggi memanfaatkan potensi melimpah ikan lemuru lokal dari pesisir selatan Jember.",
    penulis: "Admin TEFA",
    konten: [
      "Tim kolaborasi dosen peneliti dan mahasiswa Program Studi Pengolahan Hasil Ternak serta Teknologi Industri Pangan POLIJE berhasil mengembangkan terobosan baru berupa produk surimi berbasis ikan lemuru (Sardinella lemuru). Inovasi ini dirancang untuk memanfaatkan potensi tangkapan nelayan lokal di pesisir Puger, Jember, yang selama ini menghadapi fluktuasi harga saat musim panen raya.",
      "Surimi merupakan pasta protein ikan konsentrat yang menjadi bahan baku utama pembuatan berbagai olahan bernilai tambah tinggi seperti kamaboko, fish cake, baso ikan, dan crab stick imitasi. Penggunaan ikan lemuru sebagai bahan baku surimi menghadapi tantangan tingginya kandungan lemak dan mioglobin gelap. Namun, melalui teknik pencucian bertingkat dengan larutan alkali encer dan pemisahan sentrifugal dingin yang dikembangkan di laboratorium TEFA, pasta surimi yang dihasilkan berhasil mencapai derajat putih di atas 70% dengan elastisitas gel yang sangat kuat.",
      "Uji organoleptik dan uji tekstur gelometer menunjukkan bahwa surimi lemuru TEFA POLIJE memenuhi standar mutu ekspor. Mahasiswa yang terlibat dalam proyek riset ini mendapatkan pengalaman berharga dalam mengoperasikan alat refiner, mesin dewatering, dan silent cutter berkapasitas pilot plant, sehingga kompetensi industri mereka terasah secara komprehensif.",
      "Ke depan, produk surimi lemuru ini akan diproduksi dalam skala komersial terbatas oleh unit TEFA Canning untuk memenuhi kebutuhan UMKM pengolahan makanan beku di Jawa Timur. Langkah ini sejalan dengan misi hilirisasi riset terapan kampus vokasi menuju kemandirian industri bahan baku pangan nasional.",
    ],
  },
  {
    id: "3",
    judul: "Inovasi Kemasan Ramah Lingkungan untuk Produk Sarden Kaleng TEFA POLIJE",
    kategori: "Inovasi",
    isFeatured: false,
    tanggal: "22 Februari 2026",
    datetime: "2026-02-22",
    gambar: "../../assets/images/inovasi2.jpg",
    alt: "Kemasan sarden kaleng ramah lingkungan TEFA POLIJE",
    ringkasan:
      "Pengembangan kemasan ramah lingkungan yang dapat didaur ulang dan mengurangi dampak terhadap lingkungan.",
    penulis: "Admin TEFA",
    konten: [
      "Sebagai wujud komitmen terhadap pelestarian lingkungan dan keberlanjutan industri hijau, TEFA Fish Canning Politeknik Negeri Jember resmi memperkenalkan inovasi kemasan ramah lingkungan untuk seluruh varian produk Sarden SIP. Kemasan baru ini mengusung konsep eco-packaging yang mengombinasikan material tinplate baja bermutu tinggi dengan proses pencetakan label ramah biosfer.",
      "Kemasan kaleng baja ini memiliki sifat 100% recyclable tanpa penurunan kualitas material (infinite recycling). Selain itu, lapisan interior kaleng kini menggunakan food-safe coating berbasis resin organik bebas BPA (BPA-NI) yang terbukti aman bagi kesehatan konsumen dan tidak meninggalkan residu kimia berbahaya pada saus sarden meski disimpan dalam jangka waktu lama.",
      "Pada bagian eksterior, TEFA beralih menggunakan tinta cetak berbasis minyak kedelai (soy-based ink) dan pelapis luar biodegradable yang cepat terurai saat proses daur ulang. Pengurangan ketebalan dinding kaleng sebesar 8% juga berhasil dicapai melalui optimasi struktural geometri kaleng, yang secara langsung menekan bobot logistik dan jejak karbon transportasi tanpa mengurangi ketahanan terhadap tekanan retort hingga 1,5 bar.",
      "Inovasi kemasan ini telah lolos uji migrasi kemasan di balai sertifikasi kemasan pangan dan mendapat apresiasi luas dari mitra industri. TEFA POLIJE terus membuktikan bahwa produk pangan kaleng lokal dapat tampil higienis, aman, berdaya saing modern, sekaligus peduli terhadap kelestarian ekosistem bumi.",
    ],
  },
  {
    id: "4",
    judul: "TEFA POLIJE Implementasikan Teknologi Retort Terbaru untuk Tingkatkan Efisiensi Produksi",
    kategori: "Inovasi",
    isFeatured: false,
    tanggal: "15 Februari 2026",
    datetime: "2026-02-15",
    gambar: "../../assets/images/inovasi1.jpg",
    alt: "Penerapan mesin retort modern di lini produksi TEFA Canning",
    ringkasan:
      "TEFA POLIJE telah mengimplementasikan teknologi mesin retort generasi terbaru yang dilengkapi sistem otomasi presisi guna meningkatkan efisiensi energi dan kapasitas sterilisasi.",
    penulis: "Admin TEFA",
    konten: [
      "Unit Pengalengan Ikan TEFA POLIJE kembali memperkuat kapabilitas fasilitas produksinya dengan mengintegrasikan mesin retort uap bertekanan generasi terbaru. Mesin sterilisasi modern ini dilengkapi modul Programmable Logic Controller (PLC) dan sensor digital multi-titik yang memantau distribusi panas di seluruh keranjang kaleng secara real-time.",
      "Dalam industri pengalengan ikan, tahap sterilisasi termal adalah jantung penentu keamanan mikrobiologis. Mesin retort baru ini mampu mempertahankan stabilitas temperatur kerja pada rentang 115°C hingga 121°C dengan deviasi sangat rendah (±0,3°C). Presisi ini memastikan nilai letalitas panas (F0) tercapai sempurna untuk memusnahkan spora Clostridium botulinum tanpa merusak tekstur daging ikan dan kandungan nutrisi asam lemak Omega-3.",
      "Penerapan sistem sirkulasi uap tertutup dan penukar panas efisiensi tinggi pada unit baru ini terbukti berhasil memangkas konsumsi uap hingga 35% dan mempercepat siklus pendinginan pasca-sterilisasi hingga 25 menit per batch. Peningkatan efisiensi ini memungkinkan TEFA meningkatkan output harian hingga 2.500 kaleng per hari operasional praktik.",
      "Kehadiran teknologi mutakhir ini sekaligus menjadi sarana pembelajaran industri yang sangat berharga bagi para mahasiswa. Mahasiswa tidak hanya belajar teori pengolahan termal, namun langsung mengoperasikan antarmuka HMI (Human-Machine Interface), memverifikasi grafik termokopel, dan menjalankan prosedur sanitasi bejana bertekanan sesuai standar K3 ketel uap industri.",
    ],
  },
  {
    id: "5",
    judul: "TEFA POLIJE Gelar Praktik Pengalengan Ikan dengan Penerapan Standar Higienis Global",
    kategori: "Kegiatan",
    isFeatured: false,
    tanggal: "8 Februari 2026",
    datetime: "2026-02-08",
    gambar: "../../assets/images/pemberian saus.jpg",
    alt: "Mahasiswa menerapkan standar higienis dan sanitasi saat pengisian saus",
    ringkasan:
      "Kegiatan praktik pengalengan ikan di TEFA POLIJE menerapkan protokol sanitasi ketat berstandar global, membekali mahasiswa dengan disiplin kerja industri pangan profesional.",
    penulis: "Admin TEFA",
    konten: [
      "Teaching Factory (TEFA) Canning POLIJE menyelenggarakan kegiatan praktik terpadu pengalengan ikan bagi mahasiswa semester akhir dengan pengawasan ketat instruktur industri. Seluruh rangkaian kegiatan dijalankan dengan mematuhi protokol higienis internasional sesuai pedoman Codex Alimentarius dan standar Hazard Analysis Critical Control Point (HACCP).",
      "Sebelum memasuki ruang pengolahan steril, setiap mahasiswa wajib melalui serangkaian zona sanitasi yang mencakup penggantian pakaian kerja khusus, pemakaian penutup kepala ganda, masker medis, sepatu boot anti-slip, cuci tangan bertahap dengan sabun antiseptik berbusa, pengeringan udara bertekanan, dan perlintasan bak larutan klorin. Disiplin ketat ini diterapkan guna mengeliminasi potensi kontaminasi silang sejak langkah pertama.",
      "Pada stasiun kerja pengisian saus dan penimbangan kaleng, mahasiswa mempraktikkan teknik pengisian panas (hot filling) pada suhu minimal 80°C guna menciptakan ruang hampa (headspace vacuum) yang optimal setelah proses seaming. Setiap kaleng ditimbang secara acak menggunakan timbangan digital terkalibrasi untuk menjamin kepatuhan bobot tuntas (drained weight) sesuai label kemasan.",
      "Praktik berbasis simulasi nyata industri ini dirancang agar lulusan Politeknik Negeri Jember memiliki mentalitas kerja tanpa kompromi terhadap higienitas. Pengalaman langsung dalam lingkungan yang memenuhi standar audit industri menjadi modal utama alumni Polije untuk langsung terserap di berbagai perusahaan multinasional sektor food and beverage.",
    ],
  },
  {
    id: "6",
    judul: "Jamin Mutu Pangan: Mahasiswa POLIJE Pelajari Proses Krusial Sterilisasi di Mesin Retort",
    kategori: "Kegiatan",
    isFeatured: false,
    tanggal: "28 Januari 2026",
    datetime: "2026-01-28",
    gambar: "../../assets/images/Proses Sterilisasi.jpg",
    alt: "Proses sterilisasi komersial suhu tinggi mesin retort TEFA POLIJE",
    ringkasan:
      "Mahasiswa Politeknik Negeri Jember mendalami teknik operasional dan kalkulasi kecukupan panas proses sterilisasi komersial pada bejana retort pengalengan ikan.",
    penulis: "Admin TEFA",
    konten: [
      "Sebanyak 45 mahasiswa jurusan teknologi pertanian Politeknik Negeri Jember mengikuti modul praktik intensif pengoperasian dan validasi termal bejana retort di fasilitas TEFA Canning. Kegiatan ini menitikberatkan pada pemahaman proses sterilisasi komersial sebagai benteng utama jaminan mutu dan keamanan produk pangan berasam rendah (low-acid canned foods).",
      "Selama sesi praktik, mahasiswa dibimbing melakukan kalkulasi penetrasi panas dengan memasang kabel termokopel tepat pada cold point di bagian tengah kaleng sarden. Data temperatur yang terekam setiap 30 detik kemudian diolah menggunakan metode integrasi numerik Ball dan General Method untuk menghitung nilai F0 sterilisasi secara matematis presisi.",
      "Pemahaman mendalam mengenai kecukupan panas sangat krusial agar produk mencapai sterilitas komersial tanpa mengalami over-cooking yang dapat merusak tekstur daging ikan lemuru maupun membuat saus menjadi gosong (caramelized). Mahasiswa juga dilatih menangani prosedur darurat seperti penurunan tekanan mendadak (pressure drop) dan pencegahan deformasi kaleng saat proses pendinginan air bertekanan (counter pressure cooling).",
      "Kepala Laboratorium TEFA menegaskan bahwa penguasaan teknologi retort merupakan kompetensi langka yang sangat dicari oleh industri pengalengan ikan nasional. Dengan sertifikasi kompetensi teknis yang diperoleh setelah praktik ini, mahasiswa siap berkontribusi sebagai operator handal, quality control officer, maupun thermal process specialist.",
    ],
  },
  {
    id: "7",
    judul: "SARDEN SIP POLIJE: Produk Pangan Kaleng Higienis Hasil Produksi Mahasiswa Kompeten",
    kategori: "Kegiatan",
    isFeatured: false,
    tanggal: "24 Januari 2026",
    datetime: "2026-01-24",
    gambar: "../../assets/images/berita2.jpg",
    alt: "Mahasiswa POLIJE memeriksa kemasan kaleng sarden siap edar",
    ringkasan:
      "Sarden SIP POLIJE membuktikan kapabilitas mahasiswa vokasi dalam menghasilkan produk pangan kaleng lezat, higienis, dan bernutrisi tinggi yang siap bersaing di pasar modern.",
    penulis: "Admin TEFA",
    konten: [
      "Sarden SIP (Sarden Ikan Pilihan) merupakan salah satu produk unggulan kebanggaan Politeknik Negeri Jember yang diproduksi secara langsung oleh mahasiswa di bawah bimbingan teknisi profesional Teaching Factory. Menggunakan bahan baku utama ikan lemuru segar hasil tangkapan perairan Selat Bali dan Samudra Hindia, produk ini diproses secara higienis dalam hitungan jam pasca-pendaratan ikan.",
      "Keunggulan utama Sarden SIP terletak pada kesegaran bahan baku utamanya yang memiliki tekstur daging padat dan kaya akan minyak ikan alami yang mengandung Omega-3 (EPA dan DHA). Formulasi saus tomat dan bumbu rempah nusantara diolah dari sayuran segar pilihan tanpa tambahan pewarna buatan maupun pengawet kimiawi, sehingga menghasilkan rasa gurih alami yang disukai seluruh anggota keluarga.",
      "Setiap batch produksi diawasi ketat melalui lembar kendali mutu di sembilan titik kritis (Critical Control Points). Mulai dari pemotongan kepala dan pembuangan isi perut (gutting), pencucian air es mengalir, pengukusan awal (exhausting) untuk mengeluarkan udara jaringan ikan, hingga penutupan ganda (double seaming) kaleng yang diuji secara mikroskopis dengan projector seam-check.",
      "Produk Sarden SIP saat ini telah tersedia di gerai resmi Polije Mart, toko oleh-oleh khas Jember, dan melayani pemesanan pre-order secara daring melalui sistem informasi FIRMAN. Kehadiran produk ini menjadi bukti nyata bahwa sistem pendidikan vokasi mampu bertransformasi menjadi unit usaha produktif yang mencetak wirausahawan dan profesional industri pangan yang berdaya saing.",
    ],
  },
  {
    id: "8",
    judul: "Politeknik Negeri Jember Laksanakan Audit SNI untuk Produk Sarden Kaleng",
    kategori: "Kegiatan",
    isFeatured: false,
    tanggal: "20 Januari 2026",
    datetime: "2026-01-20",
    gambar: "../../assets/images/Praktik-Pengalengan.jpg",
    alt: "Tim auditor dan teknisi memeriksa lini pengalengan TEFA POLIJE",
    ringkasan:
      "Politeknik Negeri Jember sukses melaksanakan audit sertifikasi Standar Nasional Indonesia (SNI 3223:2022) pada fasilitas Teaching Factory Canning guna memastikan mutu pangan berstandar nasional.",
    penulis: "Admin TEFA",
    konten: [
      "Politeknik Negeri Jember (Polije) telah sukses menuntaskan rangkaian audit sertifikasi Standar Nasional Indonesia (SNI) untuk lini produk ikan sarden dalam kemasan kaleng di fasilitas Teaching Factory (TEFA) Canning. Audit komprehensif ini dilakukan sebagai langkah strategis dalam menjamin kepatuhan mutu produk terhadap regulasi pangan nasional dan standar keamanan konsumen.",
      "Pelaksanaan audit selama tiga hari penuh melibatkan tim auditor teknis dari Lembaga Sertifikasi Produk (LSPro) dan Badan Standardisasi Nasional (BSN). Ruang lingkup asesmen mencakup audit dokumen sistem manajemen mutu, verifikasi kalibrasi instrumen laboratorium, pengujian residu logam berat dan histamin pada bahan baku, hingga inspeksi fisik higienitas ruang produksi dan kelayakan mesin penutup kaleng otomatis.",
      "Tim auditor memberikan apresiasi tinggi terhadap komitmen civitas akademika TEFA POLIJE yang berhasil mempertahankan dokumentasi traceability (keterlacakan produk) yang sangat rapi. Melalui sistem pencatatan batch digital, setiap kaleng sarden yang diproduksi dapat ditelusuri kembali hingga ke tanggal kedatangan ikan di pelabuhan pendaratan nelayan dan nomor lot saus yang digunakan.",
      "Dengan terpenuhinya seluruh klausul dalam SNI 3223:2022 tentang Ikan Sarden dan Ikan Mekerel Dalam Kemasan Kaleng, TEFA Polije berhak mencantumkan tanda SNI pada seluruh label kemasannya. Pencapaian ini kian memperkokoh reputasi TEFA Canning Polije sebagai teaching factory rujukan nasional di bidang teknologi pengolahan perikanan tangkap.",
    ],
  },
];

// Kompatibilitas jika dipanggil dari environment node/module
if (typeof module !== "undefined" && module.exports) {
  module.exports = berita;
}
