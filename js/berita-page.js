/**
 * FIRMAN - Fish Canning Resource Management
 * Controller Halaman Berita (js/berita-page.js)
 *
 * Mengelola rendering berita unggulan, daftar berita, pencarian (search bar),
 * filter kategori, pagination, serta sinkronisasi tinggi scroll virtual.
 */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const DEFAULT_IMAGE = "../../assets/images/Praktik-Pengalengan.jpg";

  // State pencarian & filter
  let searchQuery = "";
  let selectedCategory = "";
  let currentPage = 1;
  const itemsPerPage = 6;

  // Elemen DOM
  const featuredSection = $("#featuredSection");
  const featuredContainer = $("#featuredContainer");
  const beritaListSection = $("#beritaListSection");
  const cardsGrid = $("#beritaCardsGrid");
  const paginationNav = $("#beritaPagination");
  const searchInput = $("#beritaSearchInput");
  const categorySelect = $("#beritaCategorySelect");
  const searchForm = $("#beritaSearchForm");

  /**
   * Helper pembuat elemen teks sederhana
   */
  function createEl(tagName, className, textContent = "") {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
  }

  /**
   * Filter data berdasarkan pencarian dan kategori,
   * terurut berdasarkan tanggal terbaru (Order by Date Descending).
   */
  function getFilteredData() {
    if (typeof berita === "undefined" || !Array.isArray(berita)) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();

    const filtered = berita.filter((item) => {
      // Filter kategori jika dipilih
      const matchCategory =
        !selectedCategory ||
        (item.kategori &&
          item.kategori.toLowerCase() === selectedCategory.toLowerCase());

      // Filter search pada judul, ringkasan, atau penulis
      const matchQuery =
        !query ||
        (item.judul && item.judul.toLowerCase().includes(query)) ||
        (item.ringkasan && item.ringkasan.toLowerCase().includes(query)) ||
        (item.kategori && item.kategori.toLowerCase().includes(query)) ||
        (item.penulis && item.penulis.toLowerCase().includes(query));

      return matchCategory && matchQuery;
    });

    // Urutkan berdasarkan tanggal terbaru
    return filtered.sort((a, b) => {
      const timeA = new Date(a.datetime || a.tanggal || 0).getTime();
      const timeB = new Date(b.datetime || b.tanggal || 0).getTime();
      return timeB - timeA;
    });
  }

  /**
   * Render kartu berita unggulan (Featured)
   */
  function renderFeatured(filteredList) {
    if (!featuredContainer || !featuredSection) return;

    // Jika sedang memfilter dan tidak ada hasil
    if (filteredList.length === 0) {
      featuredSection.style.display = "none";
      featuredContainer.innerHTML = "";
      return;
    }

    // Cari item yang ditandai isFeatured atau gunakan item pertama
    const featuredItem =
      filteredList.find((item) => item.isFeatured) || filteredList[0];

    featuredSection.style.display = "";
    featuredContainer.innerHTML = "";

    const link = document.createElement("a");
    link.className = "featured";
    link.href = `detail.html?id=${encodeURIComponent(featuredItem.id)}`;
    link.setAttribute("aria-label", `Baca berita unggulan: ${featuredItem.judul}`);

    const img = document.createElement("img");
    img.src = featuredItem.gambar || DEFAULT_IMAGE;
    img.alt = featuredItem.alt || featuredItem.judul;
    img.loading = "lazy";
    img.onerror = () => {
      img.remove();
      const placeholder = createEl("div", "berita-img-missing", "Gambar berita belum tersedia");
      link.prepend(placeholder);
    };
    link.appendChild(img);

    const body = createEl("div", "featured-body");

    const badge = createEl("span", "badge", featuredItem.kategori || "Kegiatan");
    const title = createEl("h3", "", featuredItem.judul);
    const summary = createEl("p", "", featuredItem.ringkasan);
    const time = createEl("time", "", featuredItem.tanggal || "");
    if (featuredItem.datetime) {
      time.setAttribute("datetime", featuredItem.datetime);
    }

    body.append(badge, title, summary, time);
    link.appendChild(body);
    featuredContainer.appendChild(link);
  }

  /**
   * Render satu kartu berita biasa
   */
  function createCardElement(item) {
    const cardLink = document.createElement("a");
    cardLink.className = "card";
    cardLink.href = `detail.html?id=${encodeURIComponent(item.id)}`;
    cardLink.setAttribute("aria-label", `Baca berita: ${item.judul}`);

    const img = document.createElement("img");
    img.src = item.gambar || DEFAULT_IMAGE;
    img.alt = item.alt || item.judul;
    img.loading = "lazy";
    img.onerror = () => {
      img.remove();
      const placeholder = createEl("div", "berita-img-missing", "Gambar berita belum tersedia");
      cardLink.prepend(placeholder);
    };
    cardLink.appendChild(img);

    const body = createEl("div", "card-body");
    const title = createEl("h3", "", item.judul);
    const desc = createEl("p", "", item.ringkasan);
    const badge = createEl("span", "badge", item.kategori || "Berita");
    const time = createEl("time", "", item.tanggal || "");
    if (item.datetime) {
      time.setAttribute("datetime", item.datetime);
    }

    body.append(title, desc, badge, time);
    cardLink.appendChild(body);

    return cardLink;
  }

  /**
   * Render daftar kartu berita
   */
  function renderCards(filteredList) {
    if (!cardsGrid) return;
    cardsGrid.innerHTML = "";

    // Tampilkan pesan kosong jika tidak ada hasil
    if (filteredList.length === 0) {
      const emptyBox = createEl("div", "berita-empty");
      const emptyTitle = createEl(
        "h3",
        "",
        "Tidak ada berita yang ditemukan"
      );
      const emptyDesc = createEl(
        "p",
        "",
        "Coba gunakan kata kunci lain atau pilih kategori yang berbeda."
      );
      const resetBtn = createEl("button", "berita-reset-btn", "Reset Filter");
      resetBtn.type = "button";
      resetBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (categorySelect) categorySelect.value = "";
        searchQuery = "";
        selectedCategory = "";
        currentPage = 1;
        applyFilters();
      });

      emptyBox.append(emptyTitle, emptyDesc, resetBtn);
      cardsGrid.appendChild(emptyBox);
      return;
    }

    // Hitung pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredList.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    paginatedItems.forEach((item) => {
      const cardEl = createCardElement(item);
      cardsGrid.appendChild(cardEl);
    });
  }

  /**
   * Render navigasi pagination
   */
  function renderPagination(totalItems) {
    if (!paginationNav) return;
    paginationNav.innerHTML = "";

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Sembunyikan pagination jika 1 halaman atau kosong
    if (totalPages <= 1) {
      paginationNav.style.display = "none";
      return;
    }

    paginationNav.style.display = "flex";

    // Tombol Pertama
    const firstBtn = createEl("a", currentPage === 1 ? "disabled" : "", "❮❮");
    firstBtn.href = "javascript:void(0)";
    firstBtn.setAttribute("aria-label", "Halaman pertama");
    if (currentPage > 1) {
      firstBtn.addEventListener("click", (e) => {
        e.preventDefault();
        changePage(1);
      });
    }
    paginationNav.appendChild(firstBtn);

    // Tombol Sebelumnya
    const prevBtn = createEl("a", currentPage === 1 ? "disabled" : "", "‹");
    prevBtn.href = "javascript:void(0)";
    prevBtn.setAttribute("aria-label", "Halaman sebelumnya");
    if (currentPage > 1) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        changePage(currentPage - 1);
      });
    }
    paginationNav.appendChild(prevBtn);

    // Tombol Halaman (1..totalPages)
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = createEl(
        "a",
        i === currentPage ? "active" : "",
        String(i)
      );
      pageBtn.href = "javascript:void(0)";
      if (i === currentPage) {
        pageBtn.setAttribute("aria-current", "page");
      } else {
        pageBtn.addEventListener("click", (e) => {
          e.preventDefault();
          changePage(i);
        });
      }
      paginationNav.appendChild(pageBtn);
    }

    // Tombol Berikutnya
    const nextBtn = createEl(
      "a",
      currentPage === totalPages ? "disabled" : "",
      "›"
    );
    nextBtn.href = "javascript:void(0)";
    nextBtn.setAttribute("aria-label", "Halaman berikutnya");
    if (currentPage < totalPages) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        changePage(currentPage + 1);
      });
    }
    paginationNav.appendChild(nextBtn);

    // Tombol Terakhir
    const lastBtn = createEl(
      "a",
      currentPage === totalPages ? "disabled" : "",
      "❯❯"
    );
    lastBtn.href = "javascript:void(0)";
    lastBtn.setAttribute("aria-label", "Halaman terakhir");
    if (currentPage < totalPages) {
      lastBtn.addEventListener("click", (e) => {
        e.preventDefault();
        changePage(totalPages);
      });
    }
    paginationNav.appendChild(lastBtn);
  }

  /**
   * Pindah ke halaman tertentu
   */
  function changePage(page) {
    currentPage = page;
    const filteredList = getFilteredData();
    const featuredItem =
      filteredList.find((item) => item.isFeatured) || filteredList[0];
    const cardItems =
      !searchQuery && !selectedCategory && featuredItem
        ? filteredList.filter((item) => String(item.id) !== String(featuredItem.id))
        : filteredList;

    renderCards(cardItems);
    renderPagination(cardItems.length);
    updateLayoutHeight();

    // Scroll halus ke daftar berita
    if (beritaListSection) {
      const targetPos = beritaListSection.offsetTop || 0;
      window.scrollTo({
        top: Math.max(0, targetPos - 80),
        behavior: "smooth"
      });
    }
  }

  /**
   * Sinkronisasi tinggi body untuk sistem smooth-scroll virtual FIRMAN
   */
  function updateLayoutHeight() {
    window.dispatchEvent(new Event("resize"));
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 120);
  }

  /**
   * Terapkan pencarian dan filter
   */
  function applyFilters() {
    const filteredList = getFilteredData();

    // Tentukan berita unggulan (Featured)
    let featuredItem = null;
    if (filteredList.length > 0) {
      featuredItem =
        filteredList.find((item) => item.isFeatured) || filteredList[0];
    }

    // Kecualikan berita yang sudah tampil di banner unggulan agar tidak duplikat
    const cardItems =
      !searchQuery && !selectedCategory && featuredItem
        ? filteredList.filter((item) => String(item.id) !== String(featuredItem.id))
        : filteredList;

    // Sesuaikan currentPage jika di luar batas hasil
    const totalPages = Math.ceil(cardItems.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = 1;
    }

    // Update judul section jika ada filter
    const listTitle = $("#beritaListTitle");
    if (listTitle) {
      if (searchQuery || selectedCategory) {
        listTitle.textContent = `Hasil Berita (${filteredList.length})`;
      } else {
        listTitle.textContent = "Berita Terbaru";
      }
    }

    renderFeatured(filteredList);
    renderCards(cardItems);
    renderPagination(cardItems.length);
    updateLayoutHeight();
  }

  /**
   * Inisialisasi event listener search bar dan filter
   */
  function initEvents() {
    // Form submit
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (searchInput) searchQuery = searchInput.value;
        currentPage = 1;
        applyFilters();
      });
    }

    // Input live-search
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value;
        currentPage = 1;
        applyFilters();
      });
    }

    // Dropdown filter kategori
    if (categorySelect) {
      categorySelect.addEventListener("change", () => {
        selectedCategory = categorySelect.value;
        currentPage = 1;
        applyFilters();
      });
    }
  }

  /**
   * Booting controller
   */
  function init() {
    if (typeof berita === "undefined" || !Array.isArray(berita)) {
      console.warn("[BeritaPage] Data berita tidak ditemukan.");
      if (cardsGrid) {
        cardsGrid.innerHTML =
          '<div class="berita-empty"><h3>Data berita tidak tersedia.</h3></div>';
      }
      return;
    }

    initEvents();
    applyFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

