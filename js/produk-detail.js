/**
 * FIRMAN - Fish Canning Resource Management
 * Product Detail Page Controller (js/produk-detail.js)
 *
 * Mengelola tampilan detail produk secara dinamis berdasarkan URL parameter (?id=X),
 * kontrol kuantitas pembelian (stepper +/-), perhitungan subtotal,
 * dan penyimpanan data ke LocalStorage sebelum diarahkan ke halaman Pre-Order.
 */
(() => {
  "use strict";

  const STORAGE_KEY_CART = "FIRMAN_PREORDER_CART";
  const DEFAULT_IMAGE =
    "../../assets/images/kalengsardenpolijesippengensardenpakenasitambahsambelmakanpakekerupukikanaselijemberjosjismantapbujang.png";

  const $ = (selector) => document.querySelector(selector);
  const formatRupiah = (num) =>
    "Rp " + Number(num || 0).toLocaleString("id-ID");

  function parseNumericPrice(priceStr) {
    if (typeof priceStr === "number") return priceStr;
    const cleaned = String(priceStr || "").replace(/\D/g, "");
    return Number(cleaned) || 20000;
  }

  function initProductDetail() {
    if (
      typeof Produk === "undefined" ||
      !Array.isArray(Produk) ||
      Produk.length === 0
    ) {
      console.warn("[ProdukDetail] Data produk tidak ditemukan.");
      return;
    }

    // Ambil ID dari URL query string (contoh: detail.html?id=2)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id") || "1";

    // Cari produk berdasarkan ID atau fallback ke produk pertama
    const product =
      Produk.find((item) => String(item.id) === String(productId)) || Produk[0];

    const numericPrice = parseNumericPrice(product.harga);
    let currentQty = 1;

    // Update meta & DOM detail produk
    document.title = `${product.judul} — TEFA Fish Canning POLIJE`;

    const imgEl = $("#productDetailImg");
    const titleEl = $("#productDetailTitle");
    const descEl = $("#productDetailDesc");
    const priceEl = $("#productDetailPrice");
    const qtyInput = $("#detailQty");
    const qtyMinus = $("#qtyMinus");
    const qtyPlus = $("#qtyPlus");
    const subtotalEl = $("#productSubtotal");
    const btnOrder = $("#btnOrder");

    if (imgEl) {
      imgEl.src = DEFAULT_IMAGE;
      imgEl.alt = product.alt || product.judul;
      imgEl.onerror = () => {
        imgEl.src = DEFAULT_IMAGE;
      };
    }

    if (titleEl) titleEl.textContent = product.judul;
    if (descEl && product.deskripsi) descEl.textContent = product.deskripsi;
    if (priceEl && product.harga) {
      priceEl.innerHTML = `${String(product.harga)} <span class="price-unit">/ kaleng</span>`;
    }

    function updateSubtotal() {
      if (qtyInput) qtyInput.value = currentQty;
      if (subtotalEl)
        subtotalEl.textContent = formatRupiah(numericPrice * currentQty);
    }

    // Listener stepper kuantitas
    if (qtyMinus) {
      qtyMinus.addEventListener("click", () => {
        if (currentQty > 1) {
          currentQty -= 1;
          updateSubtotal();
        }
      });
    }

    if (qtyPlus) {
      qtyPlus.addEventListener("click", () => {
        if (currentQty < 99) {
          currentQty += 1;
          updateSubtotal();
        }
      });
    }

    if (qtyInput) {
      qtyInput.addEventListener("change", () => {
        let val = parseInt(qtyInput.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 99) val = 99;
        currentQty = val;
        updateSubtotal();
      });
    }

    // Listener Tombol Pesan / Pre-Order Sekarang
    if (btnOrder) {
      btnOrder.addEventListener("click", (e) => {
        e.preventDefault();

        const cartItem = {
          id: Number(product.id) || Date.now(),
          name: product.judul,
          price: numericPrice,
          img: DEFAULT_IMAGE,
          qty: currentQty,
        };

        // Simpan ke LocalStorage untuk halaman Pre-Order
        try {
          localStorage.setItem(STORAGE_KEY_CART, JSON.stringify([cartItem]));
        } catch (err) {
          console.warn("[ProdukDetail] Gagal menyimpan ke storage:", err);
        }

        // Arahkan ke halaman pre-order
        window.location.href = "../preorder/index.html";
      });
    }

    updateSubtotal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductDetail);
  } else {
    initProductDetail();
  }
})();
