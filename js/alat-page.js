const alatList = document.querySelector("#alatList");

function createAlatText(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
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
  image.src = item.gambar;
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
  body.append(
    title,
    createAlatText("p", "alat-desc", item.deskripsi.join(" ")),
  );

  const specifications = document.createElement("section");
  specifications.className = "alat-specs";
  specifications.append(
    createAlatText("h3", "alat-specs-title", item.judulSpesifikasi || "Spesifikasi"),
  );

  const list = document.createElement("ul");
  item.spesifikasi.forEach((specification) => {
    list.append(createAlatText("li", "", specification));
  });
  specifications.append(list);
  body.append(specifications);
  card.append(image, body);

  return card;
}

if (alatList) {
  if (typeof alat === "undefined" || !Array.isArray(alat)) {
    alatList.append(
      createAlatText(
        "p",
        "alat-error",
        "Data alat produksi belum dapat dimuat.",
      ),
    );
  } else {
    const cards = alat
      .filter(
        (item) =>
          item &&
          item.id &&
          item.judul &&
          item.gambar &&
          Array.isArray(item.deskripsi) &&
          Array.isArray(item.spesifikasi),
      )
      .map(createAlatCard);

    if (cards.length !== alat.length) {
      console.error("Sebagian data alat produksi tidak memiliki format lengkap.");
    }

    if (cards.length === 0) {
      alatList.append(
        createAlatText("p", "alat-error", "Belum ada data alat produksi."),
      );
    } else {
      alatList.append(...cards);

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
          { threshold: 0.01, rootMargin: "0px 0px 12% 0px" },
        );

        cards.forEach((card) => {
          card.classList.add("is-reveal-ready");
          observer.observe(card);
        });
      } else {
        cards.forEach((card) => card.classList.add("is-visible"));
      }
    }
  }
}
