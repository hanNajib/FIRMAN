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
    if (priceEl && product.harga) priceEl.textContent = String(product.harga);

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

        const imgPath = product.gambar
          ? product.gambar.replace(/^\.\.\/assets\//, "../../assets/")
          : DEFAULT_IMAGE;

        const cartItem = {
          id: Number(product.id) || Date.now(),
          name: product.judul,
          price: numericPrice,
          img: imgPath,
          qty: currentQty || 1,
        };

        // Simpan / update ke LocalStorage untuk halaman Pre-Order
        try {
          let existingCart = [];
          const raw = localStorage.getItem(STORAGE_KEY_CART);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) existingCart = parsed;
          }

          // Cek apakah produk sudah ada di keranjang
          const existingIndex = existingCart.findIndex(
            (item) =>
              Number(item.id) === Number(cartItem.id) ||
              item.name === cartItem.name
          );

          if (existingIndex > -1) {
            existingCart[existingIndex].qty =
              (Number(existingCart[existingIndex].qty) || 0) + cartItem.qty;
          } else {
            existingCart.push(cartItem);
          }

          localStorage.setItem(
            STORAGE_KEY_CART,
            JSON.stringify(existingCart)
          );
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
