const productionTimeline = document.querySelector("#productionTimeline");

function createProductionText(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createProductionStage(stage, index) {
  const row = document.createElement("article");
  row.className = "production-step";
  row.dataset.side = index % 2 === 0 ? "left" : "right";

  const cardColumn = document.createElement("div");
  cardColumn.className = "production-card-col";
  cardColumn.append(
    createProductionText(
      "h2",
      "production-label",
      `Tahap ${stage.nomor}`,
    ),
  );

  const card = document.createElement("div");
  card.className = "production-card";

  const image = document.createElement("img");
  image.className = "production-img";
  image.src = stage.gambar;
  image.alt = stage.alt || stage.judul;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.remove();
    const notice = createProductionText(
      "p",
      "production-img-missing",
      "Gambar untuk tahap ini belum tersedia.",
    );
    card.prepend(notice);
  }, { once: true });

  card.append(
    image,
    createProductionText("h3", "production-title", stage.judul),
    createProductionText(
      "p",
      "production-summary",
      stage.deskripsiKartu,
    ),
  );
  cardColumn.append(card);

  const marker = document.createElement("span");
  marker.className = "production-marker";
  marker.setAttribute("aria-hidden", "true");

  const details = document.createElement("div");
  details.className = "production-detail";
  stage.deskripsi.forEach((paragraph) => {
    details.append(
      createProductionText("p", "production-desc", paragraph),
    );
  });

  const criteria = document.createElement("section");
  criteria.className = "production-criteria";
  criteria.append(
    createProductionText(
      "h3",
      "production-criteria-title",
      stage.judulKriteria,
    ),
  );

  const criteriaList = document.createElement("ul");
  stage.kriteria.forEach((criterion) => {
    criteriaList.append(createProductionText("li", "", criterion));
  });
  criteria.append(criteriaList);
  details.append(criteria);

  row.append(cardColumn, marker, details);
  return row;
}

if (productionTimeline) {
  if (typeof tahapanProduksi === "undefined" || !Array.isArray(tahapanProduksi)) {
    productionTimeline.append(
      createProductionText(
        "p",
        "production-error",
        "Data tahapan produksi belum dapat dimuat.",
      ),
    );
  } else {
    const stages = tahapanProduksi
      .filter(
        (stage) =>
          stage &&
          stage.nomor &&
          stage.judul &&
          Array.isArray(stage.deskripsi) &&
          Array.isArray(stage.kriteria),
      )
      .map(createProductionStage);

    if (stages.length !== tahapanProduksi.length) {
      console.error("Sebagian data tahapan produksi tidak memiliki format lengkap.");
    }

    if (stages.length === 0) {
      productionTimeline.append(
        createProductionText(
          "p",
          "production-error",
          "Belum ada data tahapan produksi untuk ditampilkan.",
        ),
      );
    } else {
      productionTimeline.append(...stages);

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
          { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
        );

        stages.forEach((stage) => {
          stage.classList.add("is-reveal-ready");
          observer.observe(stage);
        });
      } else {
        stages.forEach((stage) => stage.classList.add("is-visible"));
      }
    }
  }
}
