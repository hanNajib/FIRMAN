/**
 * FIRMAN - Fish Canning Resource Management
 * Controller Halaman Alat (js/alat-page.js)
 *
 * Mengelola rendering data alat produksi dari js/data/alat.js ke dalam DOM,
 * animasi reveal scroll, penanganan fallback gambar error, dan sinkronisasi tinggi scroll.
 */

(() => {
  "use strict";

  const alatList = document.querySelector("#alatList");
  const DEFAULT_IMAGE = "../assets/images/mesinpengirisikan.webp";

  function createAlatText(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function createAlatCard(item) {
    const card = document.createElement("article");
    card.className = "alat-card";
    card.id = `alat-item-${item.id}`;
    card.setAttribute("aria-labelledby", `alat-title-${item.id}`);

    const image = document.createElement("img");
    image.className = "alat-img";

    // Normalisasi path gambar: pastikan relatif terhadap page/
    let imgSrc = item.gambar || DEFAULT_IMAGE;
    if (imgSrc.startsWith("/")) {
      imgSrc = ".." + imgSrc;
    }
    image.src = imgSrc;
    image.alt = item.alt || item.judul;
    image.width = 700;
    image.height = 1244;
    image.loading = "lazy";
    image.decoding = "async";

    image.addEventListener(
      "error",
      () => {
        image.remove();
        const placeholder = createAlatText(
          "p",
          "alat-img-missing",
          "Gambar alat belum tersedia.",
        );
        card.prepend(placeholder);
      },
      { once: true },
    );

    const body = document.createElement("div");
    body.className = "alat-body";

    const title = createAlatText("h2", "alat-title", item.judul);
    title.id = `alat-title-${item.id}`;

    const descText = Array.isArray(item.deskripsi)
      ? item.deskripsi.join(" ")
      : String(item.deskripsi || "");
    const desc = createAlatText("p", "alat-desc", descText);

    body.append(title, desc);

    const specifications = document.createElement("section");
    specifications.className = "alat-specs";
    specifications.append(
      createAlatText(
        "h3",
        "alat-specs-title",
        item.judulSpesifikasi || "Spesifikasi",
      ),
    );

    const list = document.createElement("ul");
    if (Array.isArray(item.spesifikasi)) {
      item.spesifikasi.forEach((specification) => {
        list.append(createAlatText("li", "", specification));
      });
    }
    specifications.append(list);
    body.append(specifications);

    card.append(image, body);

    return card;
  }

  function initAlatPage() {
    if (!alatList) return;

    if (typeof alat === "undefined" || !Array.isArray(alat)) {
      alatList.append(
        createAlatText(
          "p",
          "alat-error",
          "Data alat produksi belum dapat dimuat.",
        ),
      );
      return;
    }

    const cards = alat
      .filter(
        (item) =>
          item &&
          item.id &&
          item.judul &&
          item.gambar &&
          (Array.isArray(item.deskripsi) || typeof item.deskripsi === "string") &&
          Array.isArray(item.spesifikasi),
      )
      .map(createAlatCard);

    if (cards.length === 0) {
      alatList.append(
        createAlatText("p", "alat-error", "Belum ada data alat produksi."),
      );
      return;
    }

    alatList.innerHTML = "";
    alatList.append(...cards);

    // Animasi Reveal saat masuk viewport
    if (
      "IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const observer = new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px 15% 0px" },
      );

      cards.forEach((card) => {
        card.classList.add("is-reveal-ready");
        observer.observe(card);
      });
    } else {
      cards.forEach((card) => card.classList.add("is-visible"));
    }

    // Fallback: pastikan kartu selalu visible & refresh body height untuk smooth-scroll virtual
    setTimeout(() => {
      cards.forEach((card) => card.classList.add("is-visible"));
      window.dispatchEvent(new Event("resize"));
    }, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAlatPage);
  } else {
    initAlatPage();
  }
})();
