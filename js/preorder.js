/**
 * FIRMAN - Fish Canning Resource Management
 * Pre-Order Page Controller (js/preorder.js)
 *
 * Mengelola keranjang pesanan nyata yang dipilih oleh user dari halaman detail produk,
 * validasi formulir pemesan, persistensi LocalStorage, navigasi bertahap modal,
 * dan checkout konfirmasi via WhatsApp.
 */
(() => {
    "use strict";

    /* ==========================================================================
       1. Konfigurasi & Konstanta
       ========================================================================== */
    const WHATSAPP_NUMBER = "6285648793646";

    const STORAGE_KEYS = {
        CART: "FIRMAN_PREORDER_CART",
        CUSTOMER: "FIRMAN_PREORDER_CUSTOMER",
        PAYMENT: "FIRMAN_PREORDER_PAYMENT",
    };

    const DEFAULT_IMAGE =
        "../../assets/images/kalengsardenpolijesippengensardenpakenasitambahsambelmakanpakekerupukikanaselijemberjosjismantapbujang.png";

    const ARROW_ICON =
        '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D33131" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16M13 5l7 7-7 7"/></svg>';

    const TRASH_ICON =
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg>';

    const STEPS = ["Data Diri", "Pembayaran", "Konfirmasi"];

    // Daftar rekomendasi diambil dari data master Produk
    function getProductCatalog() {
        if (typeof Produk !== "undefined" && Array.isArray(Produk) && Produk.length > 0) {
            return Produk.map((p) => ({
                id: Number(p.id) || Date.now(),
                name: p.judul,
                price: parseInt(String(p.harga).replace(/\D/g, ""), 10) || 20000,
                img: DEFAULT_IMAGE,
            }));
        }
        return [
            { id: 1, name: "Sarden SIP Saus Tomat", price: 20000, img: DEFAULT_IMAGE },
            { id: 2, name: "Sarden SIP Asin", price: 20000, img: DEFAULT_IMAGE },
            { id: 3, name: "Sarden SIP Saus Cabai", price: 20000, img: DEFAULT_IMAGE },
            { id: 4, name: "Sarden SIP Saus Tartar", price: 20000, img: DEFAULT_IMAGE },
        ];
    }

    const PRODUCTS = getProductCatalog();

    /* ==========================================================================
       2. Helper Utilitas
       ========================================================================== */
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    const formatRupiah = (num) => "Rp " + Number(num || 0).toLocaleString("id-ID");

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        })[char]);
    }

    /* ==========================================================================
       3. LocalStorage Service (PreorderStore)
       ========================================================================== */
    const PreorderStore = {
        _get(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (err) {
                console.warn("[PreorderStore] Gagal membaca storage:", err);
                return null;
            }
        },

        _set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (err) {
                console.warn("[PreorderStore] Gagal menyimpan storage:", err);
            }
        },

        _remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (err) {
                console.warn("[PreorderStore] Gagal menghapus storage:", err);
            }
        },

        getCart() {
            const saved = this._get(STORAGE_KEYS.CART);
            return Array.isArray(saved) && saved.length > 0 ? saved : null;
        },

        saveCart(cartItems) {
            this._set(STORAGE_KEYS.CART, cartItems);
        },

        getCustomer() {
            return this._get(STORAGE_KEYS.CUSTOMER) || {};
        },

        saveCustomer(customerData) {
            this._set(STORAGE_KEYS.CUSTOMER, customerData);
        },

        getPayment() {
            return this._get(STORAGE_KEYS.PAYMENT) || "DP";
        },

        savePayment(paymentMethod) {
            this._set(STORAGE_KEYS.PAYMENT, paymentMethod);
        },

        clearOrder() {
            Object.values(STORAGE_KEYS).forEach((key) => this._remove(key));
        },
    };

    /* ==========================================================================
       4. Validation Service
       ========================================================================== */
    const ValidationService = {
        validatePhone(phone) {
            const clean = String(phone || "").trim().replace(/[\s-]/g, "");
            if (!clean) {
                return "Nomor handphone wajib diisi.";
            }
            const phoneRegex = /^(?:\+?62|0)8[0-9]{8,12}$/;
            if (!phoneRegex.test(clean)) {
                return "Format nomor HP tidak valid (contoh: 081234567890).";
            }
            return "";
        },

        validateEmail(email) {
            const clean = String(email || "").trim();
            if (!clean) {
                return "Email wajib diisi.";
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailRegex.test(clean)) {
                return "Format email tidak valid (contoh: nama@email.com).";
            }
            return "";
        },

        setFieldError(inputEl, errorEl, message) {
            if (!inputEl) return;
            if (message) {
                inputEl.classList.add("is-invalid");
                if (errorEl) {
                    errorEl.textContent = message;
                    errorEl.classList.add("show");
                }
            } else {
                inputEl.classList.remove("is-invalid");
                if (errorEl) {
                    errorEl.textContent = "";
                    errorEl.classList.remove("show");
                }
            }
        },
    };

    /* ==========================================================================
       5. State Aplikasi (Murni dari Data Pilihan User)
       ========================================================================== */
    const DEFAULT_CART_ITEMS = [
        { id: 1, name: "Sarden SIP", price: 25000, img: DEFAULT_IMAGE, qty: 1 },
        { id: 2, name: "Sarden SIP", price: 25000, img: DEFAULT_IMAGE, qty: 1 },
        { id: 3, name: "Sarden SIP", price: 25000, img: DEFAULT_IMAGE, qty: 1 },
    ];

    let cart = PreorderStore.getCart();
    if (!cart || !cart.length) {
        cart = DEFAULT_CART_ITEMS;
        PreorderStore.saveCart(cart);
    }
    let uid = cart.length ? Math.max(10, ...cart.map((i) => Number(i.id) || 0)) : 10;

    const order = {
        data: PreorderStore.getCustomer(),
        pay: PreorderStore.getPayment(),
    };

    /* ==========================================================================
       6. UI & Render
       ========================================================================== */
    let toastTimer;
    function toast(msg) {
        const t = $("#toast");
        if (!t) return;
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
    }

    function renderCart() {
        const container = $("#cart");
        if (!container) return;

        if (!cart.length) {
            container.innerHTML = `
                <div class="cart-empty-box">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D33131" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <h3>Belum Ada Produk yang Dipilih</h3>
                    <p>Silakan pilih produk sarden dan tentukan jumlah kaleng yang Anda inginkan di halaman detail produk terlebih dahulu.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = cart
            .map(
                (item) => `
        <article class="cart-item">
          <img src="${escapeHTML(item.img || DEFAULT_IMAGE)}" alt="${escapeHTML(item.name)}" loading="lazy" onerror="this.src='${DEFAULT_IMAGE}'">
          <div class="cart-info">
            <h3>${escapeHTML(item.name)}</h3>
            <p>${formatRupiah(item.price)}</p>
            <div class="cart-qty-row">
              <div class="cart-qty-stepper">
                <button class="cart-qty-btn" type="button" data-qty-action="minus" data-id="${item.id}" aria-label="Kurangi kuantitas">−</button>
                <input class="cart-qty-input" type="number" min="1" max="99" value="${item.qty || 1}" data-id="${item.id}" aria-label="Jumlah kuantitas ${escapeHTML(item.name)}">
                <button class="cart-qty-btn" type="button" data-qty-action="plus" data-id="${item.id}" aria-label="Tambah kuantitas">+</button>
              </div>
            </div>
          </div>
          <button class="del" type="button" data-del="${item.id}" aria-label="Hapus ${escapeHTML(item.name)}">${TRASH_ICON}</button>
        </article>`
            )
            .join("");
    }

    function renderRecs() {
        const container = $("#recs");
        if (!container) return;

        container.innerHTML = PRODUCTS.map(
            (p, idx) => `
        <article class="rec">
          <img src="${escapeHTML(p.img || DEFAULT_IMAGE)}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.src='${DEFAULT_IMAGE}'">
          <h3>${escapeHTML(p.name)}</h3>
          <p>Sehat, lezat dan bergizi, pilihan terbaik olahan sarden TEFA POLIJE</p>
          <div class="rec-foot">
            <strong>${formatRupiah(p.price)}</strong>
            <button class="add" type="button" data-add="${idx}" aria-label="Tambah ${escapeHTML(p.name)} ke pesanan">+</button>
          </div>
        </article>`
        ).join("");
    }

    function renderStepper() {
        $$(".stepper").forEach((el) => {
            const cur = Number(el.dataset.step) || 1;
            el.innerHTML = STEPS.map((label, idx) => {
                const n = idx + 1;
                const state = n < cur ? "done" : n === cur ? "active" : "todo";
                return (
                    `<span class="step ${state}"${n === cur ? ' aria-current="step"' : ""}>` +
                    `<span class="dot">${n}</span><span class="lbl">${escapeHTML(label)}</span></span>` +
                    (n < STEPS.length ? `<span class="line${n < cur ? " done" : ""}" aria-hidden="true"></span>` : "")
                );
            }).join("");
        });
    }

    function renderSummary() {
        const summaryEl = $("#summary");
        const noteEl = $("#note");
        if (!summaryEl) return;

        const total = cart.reduce((sum, item) => sum + item.price * (item.qty || 0), 0);
        const customer = order.data || {};

        summaryEl.innerHTML =
            "<h3>Data Pemesan</h3>" +
            `<div class="customer-row"><span>Nama lengkap</span><strong>${escapeHTML(customer.nama || "-")}</strong></div>` +
            `<div class="customer-row"><span>No. handphone</span><strong>${escapeHTML(customer.hp || "-")}</strong></div>` +
            `<div class="customer-row"><span>Email</span><strong>${escapeHTML(customer.email || "-")}</strong></div>` +
            `<div class="customer-row"><span>Alamat</span><strong>${escapeHTML(customer.alamat || "-")}</strong></div>` +
            "<h3>Rincian Pesanan</h3>" +
            cart
                .map(
                    (item) =>
                        `<div class="row"><span>${escapeHTML(item.name)}<small class="item-breakdown">${item.qty} × ${formatRupiah(item.price)}</small></span><b>${formatRupiah(item.price * item.qty)}</b></div>`
                )
                .join("") +
            `<div class="total"><span>Total Harga</span><b>${formatRupiah(total)}</b></div>`;

        if (noteEl) {
            noteEl.textContent = `Metode pembayaran: ${order.pay || "DP"}`;
        }
    }

    function createWhatsAppMessage() {
        const total = cart.reduce((sum, item) => sum + item.price * (item.qty || 0), 0);
        const details = cart
            .map((item, index) => [
                `${index + 1}. *${item.name}*`,
                `   ${item.qty} x ${formatRupiah(item.price)} = ${formatRupiah(item.price * item.qty)}`,
            ].join("\n"))
            .join("\n");

        return [
            "Halo Admin FIRMAN, saya ingin mengonfirmasi pemesanan produk. Berikut detail pesanan saya:",
            "",
            "*🧾 INVOICE PEMESANAN*",
            "-----------------------------------",
            "*👤 DATA PEMESAN*",
            `Nama : ${order.data.nama || "-"}`,
            `No. HP : ${order.data.hp || "-"}`,
            `Email: ${order.data.email || "-"}`,
            `Alamat: ${order.data.alamat || "-"}`,
            "",
            "*🛒 DETAIL PESANAN*",
            details,
            "-----------------------------------",
            `*💰 TOTAL TAGIHAN : ${formatRupiah(total)}*`,
            `*💳 Metode Pembayaran :* ${order.pay || "DP"}`,
            "",
            "Mohon konfirmasi pesanan dan informasi rekening/pembayarannya. Terima kasih! 🙏",
        ].join("\n");
    }

    /* ==========================================================================
       7. Modal Navigation
       ========================================================================== */
    function showModal(id, direction = "next") {
        $$("dialog[open]").forEach((d) => d.close());
        const dialog = document.getElementById(id);
        if (dialog) {
            dialog.dataset.transition = direction;
            dialog.showModal();
        }
    }

    /* ==========================================================================
       8. Event Listeners & Binding
       ========================================================================== */
    function initEventListeners() {
        const cartEl = $("#cart");
        const recsEl = $("#recs");
        const form1 = $("#f1");
        const form2 = $("#f2");
        const processBtn = $("#processBtn");
        const hpInput = $("#hp");
        const emailInput = $("#email");
        const hpError = $("#hpError");
        const emailError = $("#emailError");

        // Perubahan kuantitas produk di keranjang (input number & tombol +/-)
        if (cartEl) {
            cartEl.addEventListener("click", (e) => {
                // Stepper tombol +/-
                const qtyBtn = e.target.closest("[data-qty-action]");
                if (qtyBtn) {
                    const action = qtyBtn.dataset.qtyAction;
                    const id = Number(qtyBtn.dataset.id);
                    const item = cart.find((i) => i.id === id);
                    if (item) {
                        const input = cartEl.querySelector(`.cart-qty-input[data-id="${id}"]`);
                        let current = Number(item.qty || 1);
                        if (action === "plus" && current < 99) {
                            current += 1;
                        } else if (action === "minus" && current > 1) {
                            current -= 1;
                        }
                        item.qty = current;
                        if (input) input.value = current;
                        PreorderStore.saveCart(cart);
                    }
                    return;
                }

                // Hapus item dari keranjang
                const btn = e.target.closest("[data-del]");
                if (btn) {
                    const idToDelete = Number(btn.dataset.del);
                    cart = cart.filter((i) => i.id !== idToDelete);
                    PreorderStore.saveCart(cart);
                    renderCart();
                }
            });

            // Perubahan langsung pada input number kuantitas
            cartEl.addEventListener("change", (e) => {
                const input = e.target.closest(".cart-qty-input");
                if (input) {
                    const id = Number(input.dataset.id);
                    const item = cart.find((i) => i.id === id);
                    if (item) {
                        let val = parseInt(input.value, 10);
                        if (isNaN(val) || val < 1) val = 1;
                        if (val > 99) val = 99;
                        item.qty = val;
                        input.value = val;
                        PreorderStore.saveCart(cart);
                    }
                }
            });
        }

        // Tambah varian produk dari rekomendasi
        if (recsEl) {
            recsEl.addEventListener("click", (e) => {
                const btn = e.target.closest("[data-add]");
                if (!btn) return;
                const prod = PRODUCTS[Number(btn.dataset.add)];
                if (!prod) return;

                if (cart.some((i) => i.name === prod.name)) {
                    return toast("Produk sudah ada di pesanan Anda");
                }

                uid += 1;
                cart.push({ id: uid, ...prod, qty: 1 });
                PreorderStore.saveCart(cart);
                renderCart();
                toast(`${prod.name} berhasil ditambahkan`);
            });
        }

        // Validasi real-time input no HP
        if (hpInput) {
            const validateHpField = () => {
                const err = ValidationService.validatePhone(hpInput.value);
                ValidationService.setFieldError(hpInput, hpError, err);
                return !err;
            };
            hpInput.addEventListener("input", validateHpField);
            hpInput.addEventListener("blur", validateHpField);
        }

        // Validasi real-time input Email
        if (emailInput) {
            const validateEmailField = () => {
                const err = ValidationService.validateEmail(emailInput.value);
                ValidationService.setFieldError(emailInput, emailError, err);
                return !err;
            };
            emailInput.addEventListener("input", validateEmailField);
            emailInput.addEventListener("blur", validateEmailField);
        }

        // Auto-save form data diri saat user mengetik
        if (form1) {
            form1.addEventListener("input", () => {
                const currentData = {
                    nama: $("#nama")?.value || "",
                    hp: $("#hp")?.value || "",
                    email: $("#email")?.value || "",
                    alamat: $("#alamat")?.value || "",
                };
                order.data = currentData;
                PreorderStore.saveCustomer(currentData);
            });
        }

        // Tombol Proses Pesanan (Buka Modal 1)
        if (processBtn) {
            processBtn.addEventListener("click", () => {
                if (!cart.length) {
                    toast("Keranjang masih kosong. Mengarahkan ke pemilihan produk...");
                    setTimeout(() => {
                        window.location.href = "../produk/detail.html?id=1";
                    }, 1400);
                    return;
                }
                if (cart.some((i) => !i.qty)) {
                    return toast("Pilih kuantitas untuk semua produk terlebih dahulu");
                }
                showModal("m1", "next");
            });
        }

        // Submit Modal 1 (Data Diri)
        if (form1) {
            form1.addEventListener("submit", (e) => {
                e.preventDefault();

                const hpValid = hpInput ? !ValidationService.validatePhone(hpInput.value) : true;
                const emailValid = emailInput ? !ValidationService.validateEmail(emailInput.value) : true;

                if (hpInput) {
                    ValidationService.setFieldError(
                        hpInput,
                        hpError,
                        ValidationService.validatePhone(hpInput.value)
                    );
                }
                if (emailInput) {
                    ValidationService.setFieldError(
                        emailInput,
                        emailError,
                        ValidationService.validateEmail(emailInput.value)
                    );
                }

                if (!hpValid) {
                    hpInput?.focus();
                    return;
                }
                if (!emailValid) {
                    emailInput?.focus();
                    return;
                }

                order.data = Object.fromEntries(new FormData(form1));
                PreorderStore.saveCustomer(order.data);
                showModal("m2", "next");
            });
        }

        // Auto-save & submit Modal 2 (Pembayaran)
        if (form2) {
            form2.addEventListener("change", (e) => {
                const payRadio = e.target.closest('input[name="pay"]');
                if (payRadio) {
                    order.pay = payRadio.value;
                    PreorderStore.savePayment(payRadio.value);
                }
            });

            form2.addEventListener("submit", (e) => {
                e.preventDefault();
                order.pay = new FormData(form2).get("pay") || "DP";
                PreorderStore.savePayment(order.pay);
                renderSummary();
                showModal("m3", "next");
            });
        }

        // Navigasi Kembali Antar Modal
        $("#backToDetails")?.addEventListener("click", () => showModal("m1", "back"));
        $("#backToPayment")?.addEventListener("click", () => showModal("m2", "back"));

        // Tombol Selesai (Buka WhatsApp)
        $("#finish")?.addEventListener("click", () => {
            if (!order.data || !order.pay || !cart.length || cart.some((item) => !item.qty)) {
                return toast("Data pesanan belum lengkap. Periksa kembali keranjang dan formulir.");
            }
            if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
                return toast("Nomor WhatsApp tujuan belum dikonfigurasi dengan benar.");
            }

            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(createWhatsAppMessage())}`;

            // Kosongkan riwayat pesanan setelah checkout selesai
            PreorderStore.clearOrder();

            window.location.assign(url);
        });

        // Handler penutup dialog (backdrop atau tombol x)
        $$("dialog").forEach((dialog) => {
            dialog.addEventListener("click", (e) => {
                if (e.target === dialog || e.target.closest("[data-close]")) {
                    dialog.close();
                }
            });
        });
    }

    /* ==========================================================================
       9. Form Pre-fill dari LocalStorage
       ========================================================================== */
    function restoreFormData() {
        const savedCustomer = PreorderStore.getCustomer();
        if (savedCustomer.nama && $("#nama")) $("#nama").value = savedCustomer.nama;
        if (savedCustomer.hp && $("#hp")) $("#hp").value = savedCustomer.hp;
        if (savedCustomer.email && $("#email")) $("#email").value = savedCustomer.email;
        if (savedCustomer.alamat && $("#alamat")) $("#alamat").value = savedCustomer.alamat;

        const savedPayment = PreorderStore.getPayment();
        if (savedPayment) {
            const radio = $(`input[name="pay"][value="${savedPayment}"]`);
            if (radio) radio.checked = true;
        }
    }

    /* ==========================================================================
       10. Inisialisasi
       ========================================================================== */
    function init() {
        $$(".po-circle").forEach((circle) => {
            circle.innerHTML = ARROW_ICON;
        });

        restoreFormData();
        renderCart();
        renderRecs();
        renderStepper();
        initEventListeners();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
