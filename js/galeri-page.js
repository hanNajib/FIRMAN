/**
 * FIRMAN - Fish Canning Resource Management
 * Controller Halaman Galeri (js/galeri-page.js)
 *
 * Mengelola rendering kartu galeri, pagination dinamis,
 * serta modal lightbox (popup gambar dan teks interaktif).
 */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const DEFAULT_IMAGE = "../../assets/images/galleri/Praktik-Pengalengan.jpg";

  // State
  let currentPage = 1;
  const itemsPerPage = 4; // Sesuai grid asimetris 4 item per halaman
  let activeIndex = -1; // Index item yang sedang dibuka di modal

  // Elemen DOM
  const galleryContainer = $(".gallery");
  const paginationNav = $(".pagination");
  let modalEl = null;

  /**
   * Helper pembuat elemen dengan class dan teks
   */
  function createEl(tagName, className = "", textContent = "") {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
  }

  /**
   * Bangun elemen kartu galeri (<figure>)
   */
  function createGalleryCard(item, index) {
    const figure = createEl("figure", "gallery-item");
    figure.setAttribute("role", "button");
    figure.setAttribute("tabindex", "0");
    figure.setAttribute("aria-label", `Buka galeri: ${item.judul}`);

    const img = document.createElement("img");
    img.src = item.gambar || DEFAULT_IMAGE;
    img.alt = item.alt || item.judul || "Dokumentasi Galeri TEFA";
    img.loading = "lazy";
    img.onerror = () => {
      img.src = DEFAULT_IMAGE;
    };

    const figcaption = createEl("figcaption", "", item.judul);

    figure.append(img, figcaption);

    // Event klik / keyboard enter untuk membuka modal
    figure.addEventListener("click", () => {
      openLightbox(index);
    });

    figure.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(index);
      }
    });

    return figure;
  }

  /**
   * Render daftar galeri sesuai halaman aktif
   */
  function renderGallery() {
    if (!galleryContainer) return;
    galleryContainer.innerHTML = "";

    if (typeof galeri === "undefined" || !Array.isArray(galeri) || galeri.length === 0) {
      const emptyMsg = createEl("p", "galeri-empty", "Belum ada dokumentasi galeri yang tersedia.");
      galleryContainer.appendChild(emptyMsg);
      if (paginationNav) paginationNav.innerHTML = "";
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = galeri.slice(startIndex, startIndex + itemsPerPage);

    pageItems.forEach((item, idx) => {
      const globalIndex = startIndex + idx;
      const card = createGalleryCard(item, globalIndex);
      galleryContainer.appendChild(card);
    });

    renderPagination();
  }

  /**
   * Render navigasi pagination
   */
  function renderPagination() {
    if (!paginationNav) return;
    paginationNav.innerHTML = "";

    const totalItems = galeri.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
      paginationNav.style.display = "none";
      return;
    }
    paginationNav.style.display = "flex";

    // Tombol Pertama
    const firstBtn = createEl("a", currentPage === 1 ? "disabled" : "", "❮❮");
    firstBtn.href = "#";
    firstBtn.setAttribute("aria-label", "Halaman pertama");
    if (currentPage > 1) {
      firstBtn.addEventListener("click", (e) => {
        e.preventDefault();
        goToPage(1);
      });
    }
    paginationNav.appendChild(firstBtn);

    // Tombol Sebelumnya
    const prevBtn = createEl("a", currentPage === 1 ? "disabled" : "", "‹");
    prevBtn.href = "#";
    prevBtn.setAttribute("aria-label", "Halaman sebelumnya");
    if (currentPage > 1) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        goToPage(currentPage - 1);
      });
    }
    paginationNav.appendChild(prevBtn);

    // Tombol Angka
    for (let p = 1; p <= totalPages; p++) {
      const pageBtn = createEl("a", p === currentPage ? "active" : "", String(p));
      pageBtn.href = "#";
      if (p === currentPage) {
        pageBtn.setAttribute("aria-current", "page");
      } else {
        pageBtn.addEventListener("click", (e) => {
          e.preventDefault();
          goToPage(p);
        });
      }
      paginationNav.appendChild(pageBtn);
    }

    // Tombol Berikutnya
    const nextBtn = createEl("a", currentPage === totalPages ? "disabled" : "", "›");
    nextBtn.href = "#";
    nextBtn.setAttribute("aria-label", "Halaman berikutnya");
    if (currentPage < totalPages) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        goToPage(currentPage + 1);
      });
    }
    paginationNav.appendChild(nextBtn);

    // Tombol Terakhir
    const lastBtn = createEl("a", currentPage === totalPages ? "disabled" : "", "❯❯");
    lastBtn.href = "#";
    lastBtn.setAttribute("aria-label", "Halaman terakhir");
    if (currentPage < totalPages) {
      lastBtn.addEventListener("click", (e) => {
        e.preventDefault();
        goToPage(totalPages);
      });
    }
    paginationNav.appendChild(lastBtn);
  }

  /**
   * Pindah ke halaman tertentu
   */
  function goToPage(page) {
    currentPage = page;
    renderGallery();

    const sheetEl = $(".sheet") || galleryContainer;
    if (sheetEl) {
      sheetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /**
   * Inisialisasi Lightbox Modal DOM
   */
  function initLightboxModal() {
    modalEl = $("#galeriModal");
    if (!modalEl) {
      modalEl = document.createElement("div");
      modalEl.id = "galeriModal";
      modalEl.className = "galeri-modal";
      modalEl.setAttribute("role", "dialog");
      modalEl.setAttribute("aria-modal", "true");
      modalEl.setAttribute("aria-hidden", "true");

      modalEl.innerHTML = `
        <div class="galeri-modal-backdrop" id="galeriModalBackdrop"></div>
        <div class="galeri-modal-dialog">
          <button type="button" class="galeri-modal-close" id="galeriModalClose" aria-label="Tutup gambar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <button type="button" class="galeri-modal-nav galeri-modal-prev" id="galeriModalPrev" aria-label="Gambar sebelumnya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button type="button" class="galeri-modal-nav galeri-modal-next" id="galeriModalNext" aria-label="Gambar selanjutnya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <div class="galeri-modal-content">
            <div class="galeri-modal-img-wrap">
              <img id="galeriModalImg" src="" alt="" />
              <div class="galeri-modal-caption">
                <div class="galeri-modal-meta">
                  <span class="galeri-modal-badge" id="galeriModalCategory">Produksi</span>
                  <span class="galeri-modal-counter" id="galeriModalCounter">1 / 12</span>
                </div>
                <h3 id="galeriModalTitle">Judul Dokumentasi</h3>
                <p id="galeriModalDesc">Deskripsi dokumentasi kegiatan TEFA...</p>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    // Pasang Event Listeners
    const closeBtn = $("#galeriModalClose");
    const backdrop = $("#galeriModalBackdrop");
    const prevBtn = $("#galeriModalPrev");
    const nextBtn = $("#galeriModalNext");

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (backdrop) backdrop.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", prevLightbox);
    if (nextBtn) nextBtn.addEventListener("click", nextLightbox);

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!modalEl || !modalEl.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        prevLightbox();
      } else if (e.key === "ArrowRight") {
        nextLightbox();
      }
    });
  }

  /**
   * Buka Lightbox dengan data index tertentu
   */
  function openLightbox(index) {
    if (typeof galeri === "undefined" || !galeri[index]) return;
    activeIndex = index;

    updateLightboxContent();

    if (modalEl) {
      modalEl.classList.add("is-open");
      modalEl.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // Kunci scroll halaman
    }
  }

  /**
   * Perbarui isi gambar & caption di dalam modal
   */
  function updateLightboxContent() {
    const item = galeri[activeIndex];
    if (!item) return;

    const img = $("#galeriModalImg");
    const title = $("#galeriModalTitle");
    const desc = $("#galeriModalDesc");
    const cat = $("#galeriModalCategory");
    const counter = $("#galeriModalCounter");

    if (img) {
      img.src = item.gambar || DEFAULT_IMAGE;
      img.alt = item.alt || item.judul;
    }
    if (title) title.textContent = item.judul;
    if (desc) desc.textContent = item.deskripsi || "";
    if (cat) cat.textContent = item.kategori || "Galeri TEFA";
    if (counter) counter.textContent = `${activeIndex + 1} / ${galeri.length}`;
  }

  /**
   * Navigasi sebelumnya di modal
   */
  function prevLightbox() {
    if (galeri.length <= 1) return;
    activeIndex = (activeIndex - 1 + galeri.length) % galeri.length;
    updateLightboxContent();
  }

  /**
   * Navigasi berikutnya di modal
   */
  function nextLightbox() {
    if (galeri.length <= 1) return;
    activeIndex = (activeIndex + 1) % galeri.length;
    updateLightboxContent();
  }

  /**
   * Tutup modal
   */
  function closeLightbox() {
    if (modalEl) {
      modalEl.classList.remove("is-open");
      modalEl.setAttribute("aria-hidden", "true");
      document.body.style.overflow = ""; // Pulihkan scroll
    }
  }

  /**
   * Inisialisasi Utama
   */
  function init() {
    initLightboxModal();
    renderGallery();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
