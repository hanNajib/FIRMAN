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
        // Path gambar di produk.js relatif ke root (../assets/...), preorder ada di page/preorder/
        // jadi perlu adjust path: ganti "../assets/" → "../../assets/"
        function fixImgPath(src) {
            if (!src) return DEFAULT_IMAGE;
            return src.replace(/^\.\.\/assets\//, "../../assets/");
        }

        if (typeof Produk !== "undefined" && Array.isArray(Produk) && Produk.length > 0) {
            return Produk.map((p) => ({
                id: Number(p.id) || Date.now(),
                name: p.judul,
                price: parseInt(String(p.harga).replace(/\D/g, ""), 10) || 20000,
                img: fixImgPath(p.gambar),
                desc: p.deskripsi || "",
            }));
        }
        return [
            { id: 1, name: "Sarden SIP Saus Tomat", price: 20000, img: DEFAULT_IMAGE, desc: "Sehat, lezat dan bergizi, pilihan terbaik olahan sarden TEFA POLIJE" },
            { id: 2, name: "Sarden SIP Asin",       price: 20000, img: DEFAULT_IMAGE, desc: "Olahan ikan sarden dengan cita rasa asin gurih." },
            { id: 3, name: "Sarden SIP Saus Cabai", price: 20000, img: DEFAULT_IMAGE, desc: "Ikan sarden bercita rasa pedas yang menggugah selera." },
            { id: 4, name: "Sarden SIP Saus Tartar",price: 20000, img: DEFAULT_IMAGE, desc: "Saus tartar yang menghadirkan variasi rasa berbeda." },
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
            return Array.isArray(saved) ? saved : [];
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
       5. State Aplikasi (Murni dari Data Pilihan User di LocalStorage)
       ========================================================================== */
    let cart = PreorderStore.getCart();
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
            <p>${formatRupiah(item.price)} <small style="font-size: 11px; color: #888; font-weight: normal;">/ dus (24 kaleng)</small></p>
            <div class="cart-qty-row">
              <div class="cart-qty-stepper">
                <button class="cart-qty-btn" type="button" data-qty-action="minus" data-id="${item.id}" aria-label="Kurangi kuantitas">−</button>
                <input class="cart-qty-input" type="number" min="1" max="99" value="${item.qty || 1}" data-id="${item.id}" aria-label="Jumlah dus ${escapeHTML(item.name)}">
                <button class="cart-qty-btn" type="button" data-qty-action="plus" data-id="${item.id}" aria-label="Tambah kuantitas">+</button>
              </div>
              <span style="font-size: 12px; color: #666; font-weight: 500; margin-left: 6px;">Dus</span>
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
          <p>${escapeHTML(p.desc || "Sehat, lezat dan bergizi, pilihan terbaik olahan sarden TEFA POLIJE")}</p>
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
                        `<div class="row"><span>${escapeHTML(item.name)}<small class="item-breakdown">${item.qty} Dus × ${formatRupiah(item.price)}</small></span><b>${formatRupiah(item.price * item.qty)}</b></div>`
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
                `   ${item.qty} Dus x ${formatRupiah(item.price)} = ${formatRupiah(item.price * item.qty)}`,
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
       7. Modal Navigation & Interactive Slider Buttons
       ========================================================================== */
    function showModal(id, direction = "next") {
        $$("dialog[open]").forEach((d) => d.close());
        const dialog = document.getElementById(id);
        if (dialog) {
            dialog.dataset.transition = direction;
            const slider = dialog.querySelector(".btn-slider");
            if (slider && typeof slider.resetSlider === "function") {
                slider.resetSlider();
            }
            dialog.showModal();

            // Refresh perhitungan lebar slide ketika dialog sudah terbuka
            setTimeout(() => {
                if (slider) {
                    const thumb = slider.querySelector(".circle");
                    const maxSlide = Math.max(0, slider.offsetWidth - (thumb?.offsetWidth || 40) - 10);
                    slider.style.setProperty("--slide-distance", `${maxSlide}px`);
                }
            }, 60);
        }
    }

    function setupPreorderSlider(btn, onTrigger) {
        if (!btn) return;
        const thumb = btn.querySelector(".circle");
        const text = btn.querySelector(".btn-slider-text");
        if (!thumb) return;

        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        let maxSlide = 0;
        let wasDragged = false;

        function updateMetrics() {
            const btnWidth = btn.offsetWidth;
            const thumbWidth = thumb.offsetWidth || 40;
            maxSlide = Math.max(0, btnWidth - thumbWidth - 10);
            btn.style.setProperty("--slide-distance", `${maxSlide}px`);
        }

        updateMetrics();
        window.addEventListener("resize", updateMetrics);

        function reset() {
            btn.classList.remove("active");
            thumb.style.transform = "";
            if (text) text.style.opacity = "";
        }

        function activate() {
            btn.classList.add("active");
            thumb.style.transform = `translateX(${maxSlide}px)`;
            if (text) text.style.opacity = "0";

            setTimeout(() => {
                onTrigger(reset);
            }, 260);
        }

        function startDrag(clientX) {
            if (btn.classList.contains("active")) return;
            updateMetrics();
            isDragging = true;
            wasDragged = false;
            startX = clientX;
            currentX = clientX;
            thumb.style.transition = "none";
            if (text) text.style.transition = "none";
        }

        function moveDrag(clientX) {
            if (!isDragging) return;
            currentX = clientX;
            const delta = currentX - startX;
            if (Math.abs(delta) > 5) {
                wasDragged = true;
            }
            const clampedDelta = Math.max(0, Math.min(delta, maxSlide));
            thumb.style.transform = `translateX(${clampedDelta}px)`;

            if (text) {
                const progress = clampedDelta / (maxSlide || 1);
                text.style.opacity = `${Math.max(0, 1 - progress * 1.5)}`;
            }
        }

        function endDrag() {
            if (!isDragging) return;
            isDragging = false;

            thumb.style.transition = "";
            if (text) text.style.transition = "";

            const delta = currentX - startX;
            if (delta > maxSlide * 0.4) {
                activate();
            } else {
                reset();
            }

            setTimeout(() => {
                wasDragged = false;
            }, 140);
        }

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (wasDragged) return;
            if (btn.classList.contains("active")) {
                reset();
                return;
            }
            updateMetrics();
            activate();
        });

        btn.addEventListener("mousedown", (e) => startDrag(e.clientX));
        window.addEventListener("mousemove", (e) => {
            if (isDragging) moveDrag(e.clientX);
        });
        window.addEventListener("mouseup", () => {
            if (isDragging) endDrag();
        });

        btn.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) startDrag(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener("touchmove", (e) => {
            if (isDragging && e.touches.length === 1) moveDrag(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener("touchend", () => {
            if (isDragging) endDrag();
        });

        btn.resetSlider = reset;
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
        const btnSubmitM1 = $("#btnSubmitM1");
        const btnSubmitM2 = $("#btnSubmitM2");
        const finishBtn = $("#finish");
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
                    cart = cart.filter((i) => Number(i.id) !== idToDelete);
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

            form1.addEventListener("submit", (e) => {
                e.preventDefault();
                if (btnSubmitM1) btnSubmitM1.click();
            });
        }

        // Slider 1: Tombol Sticky "Proses Pesanan"
        if (processBtn) {
            setupPreorderSlider(processBtn, (reset) => {
                if (!cart.length) {
                    toast("Keranjang masih kosong. Mengarahkan ke pemilihan produk...");
                    setTimeout(() => {
                        reset();
                        window.location.href = "../produk/detail.html?id=1";
                    }, 1200);
                    return;
                }
                if (cart.some((i) => !i.qty)) {
                    reset();
                    return toast("Pilih kuantitas untuk semua produk terlebih dahulu");
                }
                showModal("m1", "next");
                setTimeout(reset, 400);
            });
        }

        // Slider 2: Tombol Modal 1 "Lanjutkan" (Data Diri)
        if (btnSubmitM1) {
            setupPreorderSlider(btnSubmitM1, (reset) => {
                const namaVal = $("#nama")?.value.trim();
                const hpVal = hpInput?.value.trim();
                const emailVal = emailInput?.value.trim();
                const alamatVal = $("#alamat")?.value.trim();

                if (!namaVal) {
                    toast("Silakan isi nama lengkap Anda");
                    $("#nama")?.focus();
                    reset();
                    return;
                }

                const hpErr = ValidationService.validatePhone(hpVal);
                const emailErr = ValidationService.validateEmail(emailVal);

                if (hpInput) ValidationService.setFieldError(hpInput, hpError, hpErr);
                if (emailInput) ValidationService.setFieldError(emailInput, emailError, emailErr);

                if (hpErr) {
                    hpInput?.focus();
                    reset();
                    return;
                }

                if (emailErr) {
                    emailInput?.focus();
                    reset();
                    return;
                }

                if (!alamatVal) {
                    toast("Silakan isi alamat lengkap Anda");
                    $("#alamat")?.focus();
                    reset();
                    return;
                }

                order.data = {
                    nama: namaVal,
                    hp: hpVal,
                    email: emailVal,
                    alamat: alamatVal,
                };
                PreorderStore.saveCustomer(order.data);
                showModal("m2", "next");
                setTimeout(reset, 400);
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
                if (btnSubmitM2) btnSubmitM2.click();
            });
        }

        // Slider 3: Tombol Modal 2 "Lanjutkan" (Pembayaran)
        if (btnSubmitM2) {
            setupPreorderSlider(btnSubmitM2, (reset) => {
                const selectedPay = form2 ? new FormData(form2).get("pay") : "DP";
                order.pay = selectedPay || "DP";
                PreorderStore.savePayment(order.pay);
                renderSummary();
                showModal("m3", "next");
                setTimeout(reset, 400);
            });
        }

        // Slider 4: Tombol Modal 3 "Proses Pesanan" (Konfirmasi ke WA)
        if (finishBtn) {
            setupPreorderSlider(finishBtn, (reset) => {
                if (!order.data || !order.pay || !cart.length || cart.some((item) => !item.qty)) {
                    reset();
                    return toast("Data pesanan belum lengkap. Periksa kembali keranjang dan formulir.");
                }
                if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
                    reset();
                    return toast("Nomor WhatsApp tujuan belum dikonfigurasi dengan benar.");
                }

                const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(createWhatsAppMessage())}`;
                PreorderStore.clearOrder();
                window.location.assign(url);
                setTimeout(reset, 1500);
            });
        }

        // Navigasi Kembali Antar Modal (TIDAK menutup dialog, melainkan kembali ke langkah sebelumnya)
        $("#backToDetails")?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            showModal("m1", "back");
        });

        $("#backToPayment")?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            showModal("m2", "back");
        });

        // Handler penutup dialog HANYA saat klik backdrop abu-abu di luar modal
        $$("dialog").forEach((dialog) => {
            dialog.addEventListener("click", (e) => {
                if (e.target === dialog) {
                    dialog.close();
                }
            });
        });

        // Handler tombol silang (x)
        $$("[data-close]").forEach((closeBtn) => {
            closeBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const dialog = closeBtn.closest("dialog");
                if (dialog) dialog.close();
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
