const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

// Media query yang sinkron dengan CSS (@media (max-width: 768px))
const mobileQuery = window.matchMedia("(max-width: 768px)");

function isMobileView() {
    return mobileQuery.matches;
}

const viewport = $(".viewport");
const content = $(".content");
const navbar = $("#navbar");

// Kunci scroll viewport bawaan browser pada desktop (mencegah desync dengan translate3d)
if (viewport) {
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
    viewport.addEventListener("scroll", () => {
        if (!isMobileView()) {
            if (viewport.scrollTop !== 0 || viewport.scrollLeft !== 0) {
                viewport.scrollTop = 0;
                viewport.scrollLeft = 0;
            }
        }
    }, { passive: false });
}

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

window.addEventListener("scroll", () => {
    if (!isMobileView()) {
        if (window.scrollY !== 0 || window.scrollX !== 0) {
            window.scrollTo(0, 0);
        }
    } else {
        updateGlobalNavbar(window.scrollY);
    }
}, { passive: true });

function updateGlobalNavbar(y) {
    if (!navbar) return;
    if (y > 35) {
        navbar.classList.add("nav-blur", "scrolled");
    } else if (y < 15) {
        navbar.classList.remove("nav-blur", "scrolled");
    }
}

// Helper untuk menghitung jarak absolut suatu elemen dari puncak kontainer (.content)
function getElementContentOffset(el, containerEl) {
    let top = 0;
    let curr = el;
    while (curr && curr !== containerEl && curr !== document.body) {
        top += curr.offsetTop || 0;
        curr = curr.offsetParent;
    }
    return top;
}

class SmoothScroller {
    constructor() {
        this.viewport = $(".viewport");
        this.content = $(".content");
        this.navbar = $("#navbar");
        this.currentY = 0;
        this.targetY = 0;
        this.maxScroll = 0;
        this.decay = 8.5;
        this.lastTime = performance.now();
        this.rafId = null;
        this.isScrolling = false;
        this.touchStartY = 0;
        this.scrollListeners = new Set();
        this.resizeObserver = null;

        if (!this.content) return;
        this.init();
    }

    init() {
        if (this.viewport) {
            this.viewport.scrollTop = 0;
            this.viewport.scrollLeft = 0;
        }
        if (this.content) {
            this.content.scrollTop = 0;
            this.content.scrollLeft = 0;
        }
        window.scrollTo(0, 0);

        this.updateBounds(false);
        this.applyTransform(0);

        window.addEventListener("resize", () => this.updateBounds(true), { passive: true });

        if (window.ResizeObserver && this.content) {
            this.resizeObserver = new ResizeObserver(() => {
                this.updateBounds(true);
            });
            this.resizeObserver.observe(this.content);
        }

        window.addEventListener("load", () => {
            this.updateBounds(false);
            this.checkInitialHash();
        }, { passive: true });

        window.addEventListener("hashchange", () => {
            this.checkInitialHash();
        });

        window.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
        window.addEventListener("keydown", (e) => this.onKeyDown(e));

        window.addEventListener("touchstart", (e) => {
            if (isMobileView()) return;
            if (e.touches && e.touches.length === 1) {
                this.touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener("touchmove", (e) => {
            if (isMobileView()) return;
            if (e.touches && e.touches.length === 1) {
                const touchY = e.touches[0].clientY;
                const delta = this.touchStartY - touchY;
                this.touchStartY = touchY;
                this.targetY += delta * 1.2;
                this.clampTarget();
            }
        }, { passive: true });

        this.bindAnchorLinks();
        this.checkInitialHash();
    }

    checkInitialHash() {
        const hash = window.location.hash;
        if (!hash || hash === "#") return;

        const run = () => {
            if (isMobileView()) return;
            if (this.viewport) {
                this.viewport.scrollTop = 0;
                this.viewport.scrollLeft = 0;
            }
            if (this.content) {
                this.content.scrollTop = 0;
                this.content.scrollLeft = 0;
            }
            window.scrollTo(0, 0);

            this.updateBounds(false);

            const targetEl = document.querySelector(hash);
            if (!targetEl) return;

            const offsetTop = getElementContentOffset(targetEl, this.content);
            const navbarHeight = this.navbar ? this.navbar.offsetHeight : 0;
            const targetPos = Math.max(0, Math.min(
                Math.round(offsetTop - navbarHeight),
                this.maxScroll
            ));

            this.currentY = targetPos;
            this.targetY = targetPos;
            this.applyTransform(targetPos);
            this.updateNavbar(targetPos);
        };

        run();
        requestAnimationFrame(run);
        setTimeout(run, 50);
        setTimeout(run, 150);
        setTimeout(run, 300);
        setTimeout(run, 600);
    }

    updateBounds(clamp = true) {
        if (!this.content || isMobileView()) return;
        if (this.viewport) {
            this.viewport.scrollTop = 0;
            this.viewport.scrollLeft = 0;
        }
        const totalHeight = this.content.scrollHeight || this.content.offsetHeight;
        this.maxScroll = Math.max(0, totalHeight - window.innerHeight);
        const h = `${Math.ceil(totalHeight)}px`;
        if (document.body.style.height !== h) {
            document.body.style.height = h;
        }
        if (clamp) this.clampTarget();
    }

    clampTarget() {
        if (isMobileView()) return;
        this.targetY = Math.max(0, Math.min(this.targetY, this.maxScroll));
        this.currentY = Math.max(0, Math.min(this.currentY, this.maxScroll));
        this.requestTick();
    }

    onWheel(e) {
        if (isMobileView()) return;
        e.preventDefault();

        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 35;
        else if (e.deltaMode === 2) delta *= window.innerHeight;

        this.targetY += delta * 0.95;
        this.clampTarget();
    }

    onKeyDown(e) {
        if (isMobileView()) return;
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
        if (["input", "textarea", "select"].includes(activeTag)) return;

        let delta = 0;
        switch (e.key) {
            case "ArrowDown":
                delta = 80;
                break;
            case "ArrowUp":
                delta = -80;
                break;
            case "PageDown":
            case " ":
                delta = window.innerHeight * 0.85;
                break;
            case "PageUp":
                delta = -window.innerHeight * 0.85;
                break;
            case "Home":
                this.scrollTo(0);
                return;
            case "End":
                this.scrollTo(this.maxScroll);
                return;
            default:
                return;
        }

        e.preventDefault();
        this.targetY += delta;
        this.clampTarget();
    }

    scrollTo(target, immediate = false) {
        if (isMobileView()) {
            window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
            return;
        }
        this.targetY = Math.max(0, Math.min(target, this.maxScroll));
        if (immediate) {
            this.currentY = this.targetY;
            this.applyTransform(this.currentY);
            this.updateNavbar(this.currentY);
        } else {
            this.requestTick();
        }
    }

    scrollToElement(element) {
        if (!element) return;
        if (isMobileView()) {
            const navbarEl = $("#navbar");
            const navH = navbarEl ? navbarEl.offsetHeight : 0;
            const topPos = element.getBoundingClientRect().top + window.scrollY - navH;
            window.scrollTo({
                top: Math.max(0, topPos),
                behavior: "smooth"
            });
            return;
        }
        this.updateBounds();
        const offsetTop = getElementContentOffset(element, this.content);
        const navbarHeight = this.navbar ? this.navbar.offsetHeight : 0;
        const targetPos = Math.max(0, Math.min(
            Math.round(offsetTop - navbarHeight),
            this.maxScroll
        ));
        this.scrollTo(targetPos);
    }

    bindAnchorLinks() {
        document.addEventListener("click", (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            const hash = link.getAttribute("href");
            if (!hash || hash === "#") return;

            const targetEl = document.querySelector(hash);
            if (targetEl) {
                e.preventDefault();
                if (isMobileView()) {
                    const navbarEl = $("#navbar");
                    const navH = navbarEl ? navbarEl.offsetHeight : 0;
                    const topPos = targetEl.getBoundingClientRect().top + window.scrollY - navH;
                    window.scrollTo({
                        top: Math.max(0, topPos),
                        behavior: "smooth"
                    });
                } else {
                    this.scrollToElement(targetEl);
                }
                if (history.pushState) {
                    history.pushState(null, null, hash);
                }
            }
        });
    }

    onScroll(fn) {
        this.scrollListeners.add(fn);
    }

    requestTick() {
        if (!this.rafId) {
            this.lastTime = performance.now();
            if (!this.isScrolling && this.content) {
                this.content.classList.add("is-scrolling");
                this.isScrolling = true;
            }
            this.rafId = requestAnimationFrame((now) => this.update(now));
        }
    }

    update(now = performance.now()) {
        this.rafId = null;

        const dt = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        const diff = this.targetY - this.currentY;

        if (Math.abs(diff) < 0.08) {
            this.currentY = this.targetY;
        } else {
            const factor = 1 - Math.exp(-this.decay * dt);
            this.currentY += diff * factor;
        }

        this.applyTransform(this.currentY);
        this.updateNavbar(this.currentY);

        this.scrollListeners.forEach((fn) => fn(this.currentY));

        if (this.currentY !== this.targetY) {
            this.requestTick();
        } else {
            if (this.content) {
                this.content.classList.remove("is-scrolling");
            }
            this.isScrolling = false;
        }
    }

    applyTransform(y) {
        if (this.viewport && (this.viewport.scrollTop !== 0 || this.viewport.scrollLeft !== 0)) {
            this.viewport.scrollTop = 0;
            this.viewport.scrollLeft = 0;
        }
        if (window.scrollY !== 0 || window.scrollX !== 0) {
            window.scrollTo(0, 0);
        }
        if (this.content) {
            this.content.style.transform = `translate3d(0, -${y}px, 0)`;
        }
    }

    updateNavbar(y) {
        updateGlobalNavbar(y);
    }
}

// Inisialisasi Native Mobile Scrolling vs Desktop Scroller
let scroller = null;

function syncScrollMode() {
    if (isMobileView()) {
        // Mobile / Small Screen: 100% Native Scrolling
        document.body.style.height = "auto";
        if (content) {
            content.style.transform = "none";
        }
    } else {
        // Desktop (> 768px): Smooth virtual scroller
        if (!scroller && content) {
            scroller = new SmoothScroller();
        } else if (scroller) {
            scroller.updateBounds(true);
        }
    }
}

// Inisialisasi awal
syncScrollMode();

// Tangani perubahan viewport (misal resize browser / rotasi device)
mobileQuery.addEventListener("change", () => {
    syncScrollMode();
});

// Mobile hash on-load handling
const checkMobileHashOnLoad = () => {
    if (!isMobileView()) return;
    const hash = window.location.hash;
    if (!hash || hash === "#") return;
    const targetEl = document.querySelector(hash);
    if (targetEl) {
        const navbarEl = $("#navbar");
        const navH = navbarEl ? navbarEl.offsetHeight : 0;
        const topPos = targetEl.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({
            top: Math.max(0, topPos),
            behavior: "smooth"
        });
    }
};

if (isMobileView()) {
    checkMobileHashOnLoad();
}
window.addEventListener("load", checkMobileHashOnLoad, { passive: true });
window.addEventListener("hashchange", checkMobileHashOnLoad, { passive: true });

function setBodyHeight() {
    if (scroller && !isMobileView()) scroller.updateBounds();
}

// mobile navbar menu toggle
function initMobileNavbar() {
    const toggleBtn = $("#navToggleBtn");
    const closeBtn = $("#mobileNavCloseBtn");
    const menu = $("#mobileNavMenu");
    const backdrop = $("#mobileNavBackdrop");

    if (!toggleBtn || !menu || !backdrop) return;

    function openMenu() {
        toggleBtn.classList.add("is-active");
        toggleBtn.setAttribute("aria-expanded", "true");
        menu.classList.add("is-open");
        backdrop.classList.add("is-open");
        document.body.style.overflowY = "hidden";
    }

    function closeMenu() {
        toggleBtn.classList.remove("is-active");
        toggleBtn.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        backdrop.classList.remove("is-open");
        document.body.style.overflowY = "";
    }

    toggleBtn.addEventListener("click", () => {
        const isOpen = menu.classList.contains("is-open");
        if (isOpen) closeMenu();
        else openMenu();
    });

    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    backdrop.addEventListener("click", closeMenu);

    const mobileLinks = menu.querySelectorAll(".mobile-nav-link, .mobile-nav-sublink, .mobile-nav-cta");
    mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeMenu();
        });
    });

    // Mobile nav accordion toggle
    const dropdownToggles = menu.querySelectorAll(".mobile-nav-dropdown-toggle");
    dropdownToggles.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const parent = btn.closest(".mobile-nav-item-dropdown");
            if (parent) {
                const isOpen = parent.classList.contains("is-open");
                parent.classList.toggle("is-open", !isOpen);
                btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
            }
        });
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("is-open")) {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 768 && menu.classList.contains("is-open")) {
            closeMenu();
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileNavbar);
} else {
    initMobileNavbar();
}

// handle tombol slider
function setupSliderButton(btn) {
    // Jangan override slider custom di dalam dialog atau checkout preorder
    if (btn.closest("dialog") || btn.closest(".checkout") || btn.hasAttribute("data-custom-slider")) {
        return;
    }

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
        const thumbWidth = thumb.offsetWidth || 48;
        maxSlide = Math.max(0, btnWidth - thumbWidth - 12);
        btn.style.setProperty("--slide-distance", `${maxSlide}px`);
    }

    updateMetrics();
    window.addEventListener("resize", updateMetrics);
    window.addEventListener("load", updateMetrics);

    function startDrag(clientX) {
        if (btn.classList.contains("active")) return;
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
        if (delta > maxSlide * 0.45) {
            activate();
        } else {
            reset();
        }

        setTimeout(() => {
            wasDragged = false;
        }, 150);
    }

    function activate() {
        btn.classList.add("active");
        thumb.style.transform = "";
        if (text) text.style.opacity = "";

        setTimeout(() => {
            const detail = { button: btn };
            const customEvent = new CustomEvent("slide:complete", {
                detail,
                bubbles: true,
                cancelable: true
            });
            const eventAllowed = btn.dispatchEvent(customEvent);

            if (typeof btn.onSlideComplete === "function") {
                btn.onSlideComplete(btn);
                return;
            }

            const actionAttr = btn.getAttribute("data-action") || (text ? text.getAttribute("data-action") : null);
            if (actionAttr) {
                if (typeof window[actionAttr] === "function") {
                    window[actionAttr](btn);
                    return;
                }
                try {
                    const fn = new Function("button", actionAttr);
                    fn.call(btn, btn);
                    return;
                } catch (err) {
                    console.error("Error executing data-action:", err);
                }
            }

            if (!eventAllowed) return;

            const targetAttr =
                (text ? text.getAttribute("data-target") || text.getAttribute("href") || text.getAttribute("data-href") : null) ||
                btn.getAttribute("data-target") ||
                btn.getAttribute("href") ||
                btn.getAttribute("data-href");

            if (targetAttr) {
                if (targetAttr.startsWith("#")) {
                    const targetEl = document.querySelector(targetAttr);
                    if (targetEl) {
                        if (scroller) {
                            scroller.scrollToElement(targetEl);
                        } else {
                            const navbarEl = $("#navbar");
                            const navH = navbarEl ? navbarEl.offsetHeight : 0;
                            const topPos = targetEl.getBoundingClientRect().top + window.scrollY - navH;
                            window.scrollTo({
                                top: Math.max(0, topPos),
                                behavior: "smooth"
                            });
                        }
                    } else {
                        console.warn(`Slider target element not found: ${targetAttr}`);
                    }
                } else {
                    const targetWindow = btn.getAttribute("target");
                    if (targetWindow === "_blank") {
                        window.open(targetAttr, "_blank");
                    } else {
                        window.location.href = targetAttr;
                    }
                }
                return;
            }

            if (btn.type === "submit" || btn.classList.contains("form-submit-btn")) {
                const form = btn.closest("form");
                if (form) {
                    if (typeof form.requestSubmit === "function") {
                        form.requestSubmit();
                    } else {
                        form.submit();
                    }
                    return;
                }
            }

            if (btn.id === "slideBtn") {
                const showcaseSection = $("#hero-showcase") || $("#about");
                if (showcaseSection) {
                    if (scroller) {
                        scroller.scrollToElement(showcaseSection);
                    } else {
                        const navbarEl = $("#navbar");
                        const navH = navbarEl ? navbarEl.offsetHeight : 0;
                        const topPos = showcaseSection.getBoundingClientRect().top + window.scrollY - navH;
                        window.scrollTo({
                            top: Math.max(0, topPos),
                            behavior: "smooth"
                        });
                    }
                }
            } else {
                const nextSection = btn.closest("section")?.nextElementSibling;
                if (nextSection) {
                    if (scroller) {
                        scroller.scrollToElement(nextSection);
                    } else {
                        const navbarEl = $("#navbar");
                        const navH = navbarEl ? navbarEl.offsetHeight : 0;
                        const topPos = nextSection.getBoundingClientRect().top + window.scrollY - navH;
                        window.scrollTo({
                            top: Math.max(0, topPos),
                            behavior: "smooth"
                        });
                    }
                }
            }
        }, 380);
    }

    function reset() {
        btn.classList.remove("active");
        thumb.style.transform = "";
        if (text) text.style.opacity = "";
    }

    btn.addEventListener("click", () => {
        if (wasDragged) return;
        if (btn.classList.contains("active")) {
            reset();
        } else {
            activate();
        }
    });

    btn.addEventListener("mousedown", (e) => startDrag(e.clientX));
    window.addEventListener("mousemove", (e) => {
        if (isDragging) moveDrag(e.clientX);
    });
    window.addEventListener("mouseup", () => {
        if (isDragging) endDrag();
    });

    btn.addEventListener(
        "touchstart",
        (e) => {
            if (e.touches.length === 1) startDrag(e.touches[0].clientX);
        },
        { passive: true }
    );

    window.addEventListener(
        "touchmove",
        (e) => {
            if (isDragging && e.touches.length === 1) moveDrag(e.touches[0].clientX);
        },
        { passive: true }
    );

    window.addEventListener("touchend", () => {
        if (isDragging) endDrag();
    });

    const section = btn.closest("section");

    function checkSliderReset(currentScrollY) {
        if (!btn.classList.contains("active")) return;
        const scrollY = typeof currentScrollY === "number" ? currentScrollY : (scroller ? scroller.currentY : window.scrollY);

        if (btn.id === "slideBtn") {
            if (scrollY < 40) reset();
        } else if (section && scrollY < section.offsetTop - 150) {
            reset();
        }
    }

    if (scroller) {
        scroller.onScroll(checkSliderReset);
    }
    window.addEventListener(
        "scroll",
        () => checkSliderReset(window.scrollY),
        { passive: true }
    );
}

function initSliders() {
    const allSliders = $$(".btn-slider");
    allSliders.forEach((btn) => setupSliderButton(btn));
}

initSliders();

// carousel foto galeri
function initGalleryFanCarousel() {
    const container = $("#galleryFanContainer");
    const prevBtn = $("#galleryPrevBtn");
    const nextBtn = $("#galleryNextBtn");

    if (!container) return;

    const cards = Array.from(container.querySelectorAll(".gallery-card"));
    const total = cards.length;
    if (total === 0) return;

    // Helper untuk menyesuaikan path gambar dari galeri.js (../../assets/ -> assets/)
    function resolveGalleryImg(src) {
        if (!src) return "assets/images/galleri/Praktik-Pengalengan.jpg";
        return src.replace(/^(\.\.\/)+/, "");
    }

    const galeriList = window.galeri || (typeof galeri !== "undefined" ? galeri : []);
    const hasGalleryData = Array.isArray(galeriList) && galeriList.length > 0;

    // Sinkronkan gambar kartu 3D dengan data galeri.js murni
    if (hasGalleryData) {
        cards.forEach((card, i) => {
            const item = galeriList[i % galeriList.length];
            if (item) {
                const img = card.querySelector("img");
                if (img) {
                    img.src = resolveGalleryImg(item.gambar);
                    img.alt = item.alt || item.judul || "Dokumentasi Galeri TEFA";
                    img.loading = "lazy";
                    img.onerror = () => {
                        img.src = "assets/images/galleri/Praktik-Pengalengan.jpg";
                    };
                }
                card.setAttribute("title", item.judul);
                card.setAttribute("role", "button");
                card.setAttribute("tabindex", "0");
                card.setAttribute("aria-label", `Buka galeri: ${item.judul}`);
                card.style.cursor = "pointer";
            }
        });
    }

    let currentIndex = 2;
    let modalActiveIndex = 2;
    let modalEl = null;

    /**
     * Lightbox Modal Galeri (Sinkron dengan halaman galeri)
     */
    function initGalleryModal() {
        modalEl = $("#galeriModal");
        if (!modalEl) {
            modalEl = document.createElement("div");
            modalEl.id = "galeriModal";
            modalEl.className = "galeri-modal";
            modalEl.setAttribute("role", "dialog");
            modalEl.setAttribute("aria-modal", "true");
            modalEl.setAttribute("aria-hidden", "true");

            modalEl.innerHTML = `
                <div class="galeri-modal-backdrop" id="galeriModalBackdrop"></div>
                <div class="galeri-modal-dialog">
                    <button type="button" class="galeri-modal-close" id="galeriModalClose" aria-label="Tutup gambar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    
                    <button type="button" class="galeri-modal-nav galeri-modal-prev" id="galeriModalPrev" aria-label="Gambar sebelumnya">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>

                    <button type="button" class="galeri-modal-nav galeri-modal-next" id="galeriModalNext" aria-label="Gambar selanjutnya">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>

                    <div class="galeri-modal-content">
                        <div class="galeri-modal-img-wrap">
                            <img id="galeriModalImg" src="" alt="" />
                            <div class="galeri-modal-caption">
                                <div class="galeri-modal-meta">
                                    <span class="galeri-modal-badge" id="galeriModalCategory">Produksi</span>
                                    <span class="galeri-modal-counter" id="galeriModalCounter">1 / 5</span>
                                </div>
                                <h3 id="galeriModalTitle">Judul Dokumentasi</h3>
                                <p id="galeriModalDesc">Deskripsi dokumentasi kegiatan TEFA...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalEl);

            const closeBtn = $("#galeriModalClose");
            const backdrop = $("#galeriModalBackdrop");
            const prevModalBtn = $("#galeriModalPrev");
            const nextModalBtn = $("#galeriModalNext");

            if (closeBtn) closeBtn.addEventListener("click", closeGalleryModal);
            if (backdrop) backdrop.addEventListener("click", closeGalleryModal);
            if (prevModalBtn) prevModalBtn.addEventListener("click", prevGalleryModal);
            if (nextModalBtn) nextModalBtn.addEventListener("click", nextGalleryModal);

            document.addEventListener("keydown", (e) => {
                if (!modalEl || !modalEl.classList.contains("is-open")) return;
                if (e.key === "Escape") closeGalleryModal();
                else if (e.key === "ArrowLeft") prevGalleryModal();
                else if (e.key === "ArrowRight") nextGalleryModal();
            });
        }
    }

    function updateModalContent() {
        const galeriList = window.galeri || (typeof galeri !== "undefined" ? galeri : []);
        if (!hasGalleryData || !galeriList.length) return;
        const totalItems = galeriList.length;
        const item = galeriList[modalActiveIndex % totalItems];
        if (!item) return;

        const img = $("#galeriModalImg");
        const title = $("#galeriModalTitle");
        const desc = $("#galeriModalDesc");
        const cat = $("#galeriModalCategory");
        const counter = $("#galeriModalCounter");

        if (img) {
            img.src = resolveGalleryImg(item.gambar);
            img.alt = item.alt || item.judul;
        }
        if (title) title.textContent = item.judul;
        if (desc) desc.textContent = item.deskripsi || "";
        if (cat) cat.textContent = item.kategori || "Galeri TEFA";
        if (counter) counter.textContent = `${(modalActiveIndex % totalItems) + 1} / ${totalItems}`;
    }

    function openGalleryModal(index) {
        initGalleryModal();
        modalActiveIndex = index;
        updateModalContent();

        if (modalEl) {
            modalEl.classList.add("is-open");
            modalEl.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function prevGalleryModal() {
        const galeriList = window.galeri || (typeof galeri !== "undefined" ? galeri : []);
        if (!hasGalleryData || !galeriList.length) return;
        const totalItems = galeriList.length;
        modalActiveIndex = (modalActiveIndex - 1 + totalItems) % totalItems;
        updateModalContent();
    }

    function nextGalleryModal() {
        const galeriList = window.galeri || (typeof galeri !== "undefined" ? galeri : []);
        if (!hasGalleryData || !galeriList.length) return;
        const totalItems = galeriList.length;
        modalActiveIndex = (modalActiveIndex + 1) % totalItems;
        updateModalContent();
    }

    function closeGalleryModal() {
        if (modalEl) {
            modalEl.classList.remove("is-open");
            modalEl.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    function updateCardStates() {
        cards.forEach((card, i) => {
            let diff = (i - currentIndex) % total;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            if (diff === 0) {
                card.setAttribute("data-state", "active");
            } else if (diff === -1) {
                card.setAttribute("data-state", "prev-1");
            } else if (diff === 1) {
                card.setAttribute("data-state", "next-1");
            } else if (diff === -2) {
                card.setAttribute("data-state", "prev-2");
            } else if (diff === 2) {
                card.setAttribute("data-state", "next-2");
            } else {
                card.setAttribute("data-state", "hidden");
            }
        });

        setBodyHeight();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % total;
        updateCardStates();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + total) % total;
        updateCardStates();
    }

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    cards.forEach((card, index) => {
        card.addEventListener("click", () => {
            currentIndex = index;
            updateCardStates();
            // Buka popup modal dengan data yang sinkron dari galeri.js
            openGalleryModal(index);
        });

        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                currentIndex = index;
                updateCardStates();
                openGalleryModal(index);
            }
        });
    });

    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 45) {
            nextSlide();
        } else if (touchEndX - touchStartX > 45) {
            prevSlide();
        }
    }, { passive: true });

    updateCardStates();
}

window.addEventListener("DOMContentLoaded", initGalleryFanCarousel);
initGalleryFanCarousel();

// accordion faq
function initFaqAccordion() {
    const container = $("#faq") || document;

    container.addEventListener("click", (e) => {
        const questionBtn = e.target.closest(".faq-question-btn");
        if (!questionBtn) return;

        const currentItem = questionBtn.closest(".faq-item");
        if (!currentItem) return;

        const isAlreadyActive = currentItem.classList.contains("active");

        const allItems = container.querySelectorAll(".faq-item");
        allItems.forEach((item) => {
            item.classList.remove("active");
            const btn = item.querySelector(".faq-question-btn");
            if (btn) btn.setAttribute("aria-expanded", "false");
        });

        if (!isAlreadyActive) {
            currentItem.classList.add("active");
            questionBtn.setAttribute("aria-expanded", "true");
        }

        setBodyHeight();
        setTimeout(setBodyHeight, 100);
        setTimeout(setBodyHeight, 260);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFaqAccordion);
} else {
    initFaqAccordion();
}

// ==========================================================================
// Sinkronisasi Section Artikel / Berita Beranda (js/data/berita.js)
// ==========================================================================
function initHomeArticles() {
    const articleSection = $("#article");
    if (!articleSection) return;
    const beritaData = window.berita || (typeof berita !== "undefined" ? berita : null);
    if (!beritaData || !Array.isArray(beritaData) || beritaData.length === 0) return;

    function resolveImg(src) {
        if (!src) return "assets/images/berita/Praktik-Pengalengan.jpg";
        return src.replace(/^(\.\.\/)+/, "");
    }

    // Urutkan berita berdasarkan tanggal terbaru (descending)
    const sortedBerita = [...beritaData].sort((a, b) => {
        const timeA = new Date(a.datetime || a.tanggal || 0).getTime();
        const timeB = new Date(b.datetime || b.tanggal || 0).getTime();
        return timeB - timeA;
    });

    // 1. Featured Article (Kiri Atas)
    const featuredItem = sortedBerita.find((item) => item.isFeatured) || sortedBerita[0];
    const featuredEl = articleSection.querySelector(".article-featured-card");
    if (featuredEl && featuredItem) {
        if (featuredEl.tagName === "A") {
            featuredEl.href = `page/berita/detail.html?id=${encodeURIComponent(featuredItem.id)}`;
        } else {
            featuredEl.onclick = () => {
                window.location.href = `page/berita/detail.html?id=${encodeURIComponent(featuredItem.id)}`;
            };
        }
        featuredEl.setAttribute("aria-label", `Baca artikel unggulan: ${featuredItem.judul}`);

        const img = featuredEl.querySelector(".featured-img");
        if (img) {
            img.src = resolveImg(featuredItem.gambar);
            img.alt = featuredItem.alt || featuredItem.judul;
            img.onerror = () => { img.src = "assets/images/berita/Praktik-Pengalengan.jpg"; };
        }
        const title = featuredEl.querySelector(".featured-title");
        if (title) title.textContent = featuredItem.judul;

        const date = featuredEl.querySelector(".featured-date");
        if (date) date.textContent = featuredItem.tanggal || "";
    }

    // Daftar artikel lain di luar featured
    const otherItems = sortedBerita.filter((item) => String(item.id) !== String(featuredItem.id));

    // 2. Recent List (3 Artikel Terbaru di Kanan)
    const recentContainer = articleSection.querySelector(".recent-list");
    if (recentContainer && otherItems.length > 0) {
        const recentItems = otherItems.slice(0, 3);
        recentContainer.innerHTML = "";
        recentItems.forEach((item) => {
            const link = document.createElement("a");
            link.href = `page/berita/detail.html?id=${encodeURIComponent(item.id)}`;
            link.className = "recent-item";
            link.setAttribute("aria-label", `Baca artikel: ${item.judul}`);

            const thumbWrap = document.createElement("div");
            thumbWrap.className = "recent-thumb-wrap";
            const thumb = document.createElement("img");
            thumb.src = resolveImg(item.gambar);
            thumb.alt = item.alt || item.judul;
            thumb.className = "recent-thumb";
            thumb.loading = "lazy";
            thumb.onerror = () => { thumb.src = "assets/images/berita/Praktik-Pengalengan.jpg"; };
            thumbWrap.appendChild(thumb);

            const info = document.createElement("div");
            info.className = "recent-info";
            const h4 = document.createElement("h4");
            h4.className = "recent-item-title";
            h4.textContent = item.judul;
            const span = document.createElement("span");
            span.className = "recent-item-date";
            span.textContent = item.tanggal || "";
            info.append(h4, span);

            link.append(thumbWrap, info);

            // Preload gambar artikel detail sebelum user mengklik
            link.addEventListener("mouseenter", () => {
                const preloader = new Image();
                preloader.src = resolveImg(item.gambar);
            }, { once: true, passive: true });

            recentContainer.appendChild(link);
        });
    }

    // 3. Baca Juga Grid (3 Artikel di Bagian Bawah)
    const gridContainer = articleSection.querySelector(".article-cards-grid");
    if (gridContainer && otherItems.length > 3) {
        const gridItems = otherItems.slice(3, 6);
        gridContainer.innerHTML = "";
        gridItems.forEach((item) => {
            const card = document.createElement("a");
            card.href = `page/berita/detail.html?id=${encodeURIComponent(item.id)}`;
            card.className = "article-card";
            card.setAttribute("aria-label", `Baca artikel: ${item.judul}`);

            const thumbWrap = document.createElement("div");
            thumbWrap.className = "article-card-thumb";
            const img = document.createElement("img");
            img.src = resolveImg(item.gambar);
            img.alt = item.alt || item.judul;
            img.loading = "lazy";
            img.onerror = () => { img.src = "assets/images/berita/Praktik-Pengalengan.jpg"; };
            thumbWrap.appendChild(img);

            const body = document.createElement("div");
            body.className = "article-card-body";
            const h4 = document.createElement("h4");
            h4.className = "article-card-title";
            h4.textContent = item.judul;
            const p = document.createElement("p");
            p.className = "article-card-desc";
            p.textContent = item.ringkasan || "";
            const span = document.createElement("span");
            span.className = "article-card-date";
            span.textContent = item.tanggal || "";
            body.append(h4, p, span);

            card.append(thumbWrap, body);

            // Preload gambar artikel detail sebelum user mengklik
            card.addEventListener("mouseenter", () => {
                const preloader = new Image();
                preloader.src = resolveImg(item.gambar);
            }, { once: true, passive: true });

            gridContainer.appendChild(card);
        });
    }

    if (typeof setBodyHeight === "function") {
        setBodyHeight();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomeArticles);
} else {
    initHomeArticles();
}

// ==========================================================================
// Display Scaling / Device Pixel Ratio Detector (Native JS)
// ==========================================================================
(function initDisplayScaleDetector() {
    let currentMatchMedia = null;
    let currentListener = null;

    function getScaleBucket(ratio) {
        return Math.round((ratio || 1) * 100);
    }

    function updateDisplayScale() {
        const dpr = window.devicePixelRatio || 1;
        const scale = getScaleBucket(dpr);

        const root = document.documentElement;
        if (root) {
            root.setAttribute("data-scale", String(scale));
            root.setAttribute("data-scale-ratio", dpr.toFixed(2));

            const oldRootClasses = Array.from(root.classList).filter((c) => c.startsWith("scale-"));
            oldRootClasses.forEach((c) => root.classList.remove(c));
            root.classList.add(`scale-${scale}`);
        }

        if (document.body) {
            document.body.setAttribute("data-scale", String(scale));
            document.body.setAttribute("data-scale-ratio", dpr.toFixed(2));

            const oldBodyClasses = Array.from(document.body.classList).filter((c) => c.startsWith("scale-"));
            oldBodyClasses.forEach((c) => document.body.classList.remove(c));
            document.body.classList.add(`scale-${scale}`);
        }
    }

    function setupMediaListener() {
        if (!window.matchMedia) return;

        const dpr = window.devicePixelRatio || 1;

        if (currentMatchMedia && currentListener) {
            if (currentMatchMedia.removeEventListener) {
                currentMatchMedia.removeEventListener("change", currentListener);
            } else if (currentMatchMedia.removeListener) {
                currentMatchMedia.removeListener(currentListener);
            }
        }

        currentMatchMedia = window.matchMedia(`(resolution: ${dpr}dppx)`);
        currentListener = () => {
            updateDisplayScale();
            setupMediaListener();
        };

        if (currentMatchMedia.addEventListener) {
            currentMatchMedia.addEventListener("change", currentListener, { once: true });
        } else if (currentMatchMedia.addListener) {
            currentMatchMedia.addListener(currentListener);
        }
    }

    updateDisplayScale();
    setupMediaListener();

    window.addEventListener("resize", () => {
        updateDisplayScale();
        setupMediaListener();
    }, { passive: true });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateDisplayScale);
    }
})();
