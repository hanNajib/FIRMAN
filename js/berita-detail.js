/**
 * FIRMAN - Fish Canning Resource Management
 * Detail Berita Controller (js/berita-detail.js)
 *
 * Mengelola rendering detail berita berdasarkan query parameter (?id=X),
 * memuat konten lengkap, sidebar berita unggulan, dan daftar berita terkait.
 */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const DEFAULT_IMAGE = "../../assets/images/Praktik-Pengalengan.jpg";

  function createEl(tagName, className, textContent = "") {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
  }

  function initBeritaDetail() {
    if (typeof berita === "undefined" || !Array.isArray(berita) || berita.length === 0) {
      console.warn("[BeritaDetail] Data berita tidak ditemukan.");
      return;
    }

    // Ambil ID dari URL (?id=...)
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get("id") || "1";

    const article = berita.find((item) => String(item.id) === String(newsId)) || berita[0];

    // Update document title
    document.title = `${article.judul} — TEFA Fish Canning POLIJE`;

    // Update elemen detail utama
    const catEl = $("#detailCategory");
    const titleEl = $("#detailTitle");
    const dateEl = $("#detailDate");
    const coverEl = $("#detailCover");
    const articleEl = $("#detailArticle");

    if (catEl) {
      catEl.textContent = article.kategori || "Berita";
      catEl.href = "index.html";
    }

    if (titleEl) {
      titleEl.textContent = article.judul;
    }

    if (dateEl) {
      dateEl.textContent = article.tanggal || "";
      if (article.datetime) {
        dateEl.setAttribute("datetime", article.datetime);
      }
    }

    if (coverEl) {
      coverEl.src = article.gambar || DEFAULT_IMAGE;
      coverEl.alt = article.alt || article.judul;
      coverEl.onerror = () => {
        coverEl.src = DEFAULT_IMAGE;
      };
    }

    if (articleEl) {
      articleEl.innerHTML = "";
      if (Array.isArray(article.konten) && article.konten.length > 0) {
        article.konten.forEach((paragraf, index) => {
          const p = createEl("p", "", paragraf);
          if (index === 0 && article.penulis) {
            const strong = createEl("strong", "", `${article.penulis} — `);
            p.prepend(strong);
          }
          articleEl.appendChild(p);
        });
      } else if (article.ringkasan) {
        const p = createEl("p", "", article.ringkasan);
        articleEl.appendChild(p);
      }
    }

    // Render Sidebar (Berita Unggulan / Berita Lain)
    const sidebarEl = $("#detailSidebar");
    if (sidebarEl) {
      const heading = createEl("h2", "", "Berita Unggulan");
      sidebarEl.innerHTML = "";
      sidebarEl.appendChild(heading);

      const sideItems = berita.filter((b) => String(b.id) !== String(article.id)).slice(0, 4);

      sideItems.forEach((sideItem) => {
        const sideLink = createEl("a", "side-item");
        sideLink.href = `detail.html?id=${encodeURIComponent(sideItem.id)}`;

        const img = createEl("img");
        img.src = sideItem.gambar || DEFAULT_IMAGE;
        img.alt = sideItem.alt || sideItem.judul;
        img.loading = "lazy";
        img.onerror = () => {
          img.src = DEFAULT_IMAGE;
        };

        const info = createEl("div");
        const cat = createEl("span", "", sideItem.kategori || "Berita");
        const title = createEl("h3", "", sideItem.judul);
        const time = createEl("time", "", sideItem.tanggal || "");
        if (sideItem.datetime) time.setAttribute("datetime", sideItem.datetime);

        info.append(cat, title, time);
        sideLink.append(img, info);
        sidebarEl.appendChild(sideLink);
      });
    }

    // Render Related Section (Berita Lainnya di bagian bawah)
    const relatedCards = $("#detailRelatedCards");
    if (relatedCards) {
      relatedCards.innerHTML = "";
      const relatedItems = berita.filter((b) => String(b.id) !== String(article.id)).slice(0, 3);

      relatedItems.forEach((relItem) => {
        const cardLink = createEl("a", "card");
        cardLink.href = `detail.html?id=${encodeURIComponent(relItem.id)}`;

        const img = createEl("img");
        img.src = relItem.gambar || DEFAULT_IMAGE;
        img.alt = relItem.alt || relItem.judul;
        img.loading = "lazy";
        img.onerror = () => {
          img.src = DEFAULT_IMAGE;
        };

        const body = createEl("div", "card-body");
        const title = createEl("h3", "", relItem.judul);
        const desc = createEl("p", "", relItem.ringkasan);
        const badge = createEl("span", "badge", relItem.kategori || "Berita");
        const time = createEl("time", "", relItem.tanggal || "");
        if (relItem.datetime) time.setAttribute("datetime", relItem.datetime);

        body.append(title, desc, badge, time);
        cardLink.append(img, body);
        relatedCards.appendChild(cardLink);
      });
    }

    // Refresh smooth scroll virtual body height
    window.dispatchEvent(new Event("resize"));
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBeritaDetail);
  } else {
    initBeritaDetail();
  }
})();

