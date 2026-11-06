(() => {
    const $ = (s) => document.querySelector(s);
    const rp = (n) => "Rp " + n.toLocaleString("id-ID");

    const ARROW = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D33131" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16M13 5l7 7-7 7"/></svg>';
    const TRASH = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg>';
    const STEPS = ["Data Diri", "Pembayaran", "Konfirmasi"];

    const PRODUCTS = [
        { name: "Sarden SIP Saus Tomat", price: 20000, img: "images/produk-1.jpg" },
        { name: "Sarden SIP Asin", price: 20000, img: "images/produk-2.jpg" },
        { name: "Sarden SIP Saus Cabai", price: 20000, img: "images/produk-3.jpg" },
        { name: "Sarden SIP Saus Tartar", price: 20000, img: "images/produk-4.jpg" },
    ];

    let uid = 3;
    let cart = [1, 2, 3].map((id) => ({ id, name: "Sarden SIP", price: 25000, img: "images/sarden-sip.jpg", qty: 0 }));
    const order = {};

    /* ---------- Toast ---------- */
    let toastTimer;
    function toast(msg) {
        const t = $("#toast");
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
    }

    /* ---------- Render ---------- */
    function renderCart() {
        $("#cart").innerHTML = cart.length
            ? cart.map((i) => `
      <article class="cart-item">
        <img src="${i.img}" alt="${i.name}">
        <div class="cart-info">
          <h3>${i.name}</h3>
          <p>Rp. ${i.price.toLocaleString("id-ID")}</p>
          <select data-id="${i.id}" aria-label="Kuantitas ${i.name}">
            <option value=""${i.qty ? "" : " selected"} disabled hidden>Masukkan Kuantitas</option>
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<option value="${n}"${n === i.qty ? " selected" : ""}>${n}</option>`).join("")}
          </select>
        </div>
        <button class="del" type="button" data-del="${i.id}" aria-label="Hapus ${i.name}">${TRASH}</button>
      </article>`).join("")
            : '<p class="empty">Keranjang masih kosong. Pilih produk di bawah.</p>';
    }

    function renderRecs() {
        $("#recs").innerHTML = PRODUCTS.map((p, i) => `
    <article class="rec">
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>Sehat, lezat dan bergizi, sppg mending beli sarden disini</p>
      <div class="rec-foot">
        <strong>${rp(p.price)}</strong>
        <button class="add" type="button" data-add="${i}" aria-label="Tambah ${p.name} ke pesanan">+</button>
      </div>
    </article>`).join("");
    }

    function renderStepper() {
        document.querySelectorAll(".stepper").forEach((el) => {
            const cur = +el.dataset.step;
            el.innerHTML = STEPS.map((label, i) => {
                const n = i + 1;
                const state = n < cur ? "done" : n === cur ? "active" : "todo";
                return `<span class="step ${state}"${n === cur ? ' aria-current="step"' : ""}><span class="dot">${n}</span><span class="lbl">${label}</span></span>`
                    + (n < STEPS.length ? `<span class="line${n < cur ? " done" : ""}" aria-hidden="true"></span>` : "");
            }).join("");
        });
    }

    function renderSummary() {
        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
        $("#summary").innerHTML = "<h3>Ringkasan Pesanan</h3>"
            + cart.map((i) => `<div class="row"><span>${i.name}${i.qty > 1 ? " ×" + i.qty : ""}</span><b>${rp(i.price * i.qty)}</b></div>`).join("")
            + `<div class="total"><span>Total Harga</span><b>${rp(total)}</b></div>`;
        $("#note").textContent = `Pemesan: ${order.data.nama} • Metode pembayaran: ${order.pay}`;
    }

    /* ---------- Modal berurutan ---------- */
    function show(id) {
        document.querySelectorAll("dialog[open]").forEach((d) => d.close());
        document.getElementById(id).showModal();
    }

    /* ---------- Event ---------- */
    $("#cart").addEventListener("change", (e) => {
        const sel = e.target.closest("select");
        if (sel) cart.find((i) => i.id === +sel.dataset.id).qty = +sel.value;
    });

    $("#cart").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-del]");
        if (!btn) return;
        cart = cart.filter((i) => i.id !== +btn.dataset.del);
        renderCart();
    });

    $("#recs").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-add]");
        if (!btn) return;
        const p = PRODUCTS[btn.dataset.add];
        if (cart.some((i) => i.name === p.name)) return toast("Produk sudah ada di pesanan");
        cart.push({ id: ++uid, ...p, qty: 0 });
        renderCart();
        toast(p.name + " ditambahkan");
    });

    $("#processBtn").addEventListener("click", () => {
        if (!cart.length) return toast("Pesanan masih kosong");
        if (cart.some((i) => !i.qty)) return toast("Pilih kuantitas untuk semua produk dulu");
        show("m1");
    });

    $("#f1").addEventListener("submit", (e) => {
        e.preventDefault();
        order.data = Object.fromEntries(new FormData(e.target));
        show("m2");
    });

    $("#f2").addEventListener("submit", (e) => {
        e.preventDefault();
        order.pay = new FormData(e.target).get("pay");
        renderSummary();
        show("m3");
    });

    $("#finish").addEventListener("click", () => {
        $("#m3").close();
        toast(`Pesanan berhasil diproses. Terima kasih, ${order.data.nama}!`);
    });

    document.querySelectorAll("dialog").forEach((d) => {
        d.addEventListener("click", (e) => { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
    });

    /* ---------- Init ---------- */
    document.querySelectorAll(".po-circle").forEach((c) => (c.innerHTML = ARROW));
    renderCart();
    renderRecs();
    renderStepper();
})();