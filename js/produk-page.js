const productGrid = document.querySelector("#produkGrid");
const productPagination = document.querySelector("#produkPagination");
const productRendererUrl = document.currentScript.src;
const productsPerPage = 4;
let validProducts = [];
let currentPage = 1;

function createProductText(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "product-img-wrap";

  const image = document.createElement("img");
  image.className = "product-img";
  image.src = new URL(product.gambar, productRendererUrl).href;
  image.alt = product.alt || product.judul;
  image.width = 1200;
  image.height = 1200;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener(
    "error",
    () => {
      image.remove();
      imageWrap.textContent = "Gambar produk belum tersedia.";
      imageWrap.classList.add("product-img-missing");
    },
    { once: true },
  );
  imageWrap.append(image);

  const info = document.createElement("div");
  info.className = "product-info";
  info.append(
    createProductText("h2", "product-title", product.judul),
    createProductText("p", "product-desc", product.deskripsi),
  );

  const bottom = document.createElement("div");
  bottom.className = "product-bottom";
  bottom.append(createProductText("span", "product-price", product.harga));

  const action = document.createElement("a");
  action.className = "product-action-btn";
  action.href = new URL("../index.html#faq", productRendererUrl).href;
  action.setAttribute("aria-label", `Tanyakan ${product.judul}`);

  const arrow = document.createElement("img");
  arrow.src = new URL("../assets/icons/arrow-up-right.svg", productRendererUrl).href;
  arrow.alt = "";
  arrow.setAttribute("aria-hidden", "true");
  arrow.className = "w-3.5 h-3.5 brightness-0 invert";
  action.append(arrow);
  bottom.append(action);

  info.append(bottom);
  card.append(imageWrap, info);
  return card;
}

function createPaginationButton(label, page, accessibleLabel, disabled = false) {
  const button = document.createElement("button");
  button.className = "produk-page-button";
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-label", accessibleLabel);
  button.disabled = disabled;
  button.addEventListener("click", () => renderProducts(page));
  return button;
}

function renderProducts(page) {
  const totalPages = Math.ceil(validProducts.length / productsPerPage);
  currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * productsPerPage;

  productGrid.replaceChildren(
    ...validProducts
      .slice(start, start + productsPerPage)
      .map(createProductCard),
  );

  const controls = [
    createPaginationButton("‹", currentPage - 1, "Halaman sebelumnya", currentPage === 1),
  ];

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    const button = createPaginationButton(
      String(pageNumber),
      pageNumber,
      `Halaman ${pageNumber}`,
    );
    if (pageNumber === currentPage) {
      button.classList.add("is-active");
      button.setAttribute("aria-current", "page");
    }
    controls.push(button);
  }

  controls.push(
    createPaginationButton(
      "›",
      currentPage + 1,
      "Halaman berikutnya",
      currentPage === totalPages,
    ),
  );
  productPagination.replaceChildren(...controls);
}

if (!productGrid || !productPagination) {
  console.error("Elemen daftar produk atau pagination tidak ditemukan.");
} else if (typeof Produk === "undefined" || !Array.isArray(Produk)) {
  productGrid.append(
    createProductText("p", "produk-error", "Data produk belum dapat dimuat."),
  );
  productPagination.hidden = true;
} else {
  validProducts = Produk.filter(
    (product) =>
      product &&
      product.id &&
      product.judul &&
      product.gambar &&
      product.deskripsi &&
      product.harga,
  );

  if (validProducts.length !== Produk.length) {
    console.error("Sebagian data produk belum memiliki gambar, judul, deskripsi, atau harga.");
  }

  if (validProducts.length === 0) {
    productGrid.append(
      createProductText("p", "produk-error", "Belum ada produk untuk ditampilkan."),
    );
    productPagination.hidden = true;
  } else {
    renderProducts(currentPage);
  }
}
