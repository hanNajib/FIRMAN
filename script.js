const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const content = $(".content");
const navbar = $("#navbar");

class SmoothScroller {
    constructor() {
        this.content = $(".content");
        this.navbar = $("#navbar");
        this.currentY = 0;
        this.targetY = 0;
        this.maxScroll = 0;
        this.ease = 0.085;
        this.rafId = null;
        this.isScrolling = false;
        this.touchStartY = 0;
        this.scrollListeners = new Set();

        if (!this.content) return;
        this.init();
    }

    init() {
        this.updateBounds();
        window.addEventListener("resize", () => this.updateBounds(), { passive: true });
        window.addEventListener("load", () => this.updateBounds(), { passive: true });

        window.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
        window.addEventListener("touchstart", (e) => this.onTouchStart(e), { passive: true });
        window.addEventListener("touchmove", (e) => this.onTouchMove(e), { passive: false });
        window.addEventListener("keydown", (e) => this.onKeyDown(e));

        this.bindAnchorLinks();
        this.applyTransform(0);
    }

    updateBounds() {
        if (!this.content) return;
        const totalHeight = this.content.scrollHeight || this.content.offsetHeight;
        this.maxScroll = Math.max(0, totalHeight - window.innerHeight);
        const h = `${Math.ceil(totalHeight)}px`;
        if (document.body.style.height !== h) {
            document.body.style.height = h;
        }
        this.clampTarget();
    }

    clampTarget() {
        this.targetY = Math.max(0, Math.min(this.targetY, this.maxScroll));
        this.requestTick();
    }

    onWheel(e) {
        e.preventDefault();

        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 35;
        else if (e.deltaMode === 2) delta *= window.innerHeight;

        this.targetY += delta * 0.95;
        this.clampTarget();
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.touchStartY = e.touches[0].clientY;
        }
    }

    onTouchMove(e) {
        if (e.touches.length === 1) {
            const currentY = e.touches[0].clientY;
            const deltaY = this.touchStartY - currentY;
            this.touchStartY = currentY;
            this.targetY += deltaY * 1.5;
            this.clampTarget();
        }
    }

    onKeyDown(e) {
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
        this.updateBounds();
        const rect = element.getBoundingClientRect();
        const targetPos = this.currentY + rect.top;
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
                this.scrollToElement(targetEl);
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
            if (!this.isScrolling && this.content) {
                this.content.classList.add("is-scrolling");
                this.isScrolling = true;
            }
            this.rafId = requestAnimationFrame(() => this.update());
        }
    }

    update() {
        this.rafId = null;
        const diff = this.targetY - this.currentY;

        if (Math.abs(diff) < 0.15) {
            this.currentY = this.targetY;
        } else {
            this.currentY += diff * this.ease;
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
        if (this.content) {
            this.content.style.transform = `translate3d(0, -${y.toFixed(2)}px, 0)`;
        }
    }

    updateNavbar(y) {
        if (!this.navbar) return;
        if (y > 35) {
            this.navbar.classList.add("nav-blur", "scrolled");
        } else if (y < 15) {
            this.navbar.classList.remove("nav-blur", "scrolled");
        }
    }
}

const scroller = new SmoothScroller();

function setBodyHeight() {
    if (scroller) scroller.updateBounds();
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

    const mobileLinks = menu.querySelectorAll(".mobile-nav-link, .mobile-nav-cta");
    mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeMenu();
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
            const targetAttr = btn.getAttribute("data-target") || btn.getAttribute("href");
            const targetEl = targetAttr ? $(targetAttr) : null;

            if (targetEl) {
                if (scroller) scroller.scrollToElement(targetEl);
                else {
                    window.scrollTo({
                        top: targetEl.offsetTop,
                        behavior: "smooth"
                    });
                }
            } else if (btn.id === "slideBtn") {
                const showcaseSection = $("#hero-showcase") || $("#about");
                if (showcaseSection) {
                    if (scroller) scroller.scrollToElement(showcaseSection);
                    else {
                        const targetPos = showcaseSection.offsetTop || window.innerHeight;
                        window.scrollTo({
                            top: targetPos,
                            behavior: "smooth"
                        });
                    }
                }
            } else {
                const nextSection = btn.closest("section")?.nextElementSibling;
                if (nextSection) {
                    if (scroller) scroller.scrollToElement(nextSection);
                    else {
                        window.scrollTo({
                            top: nextSection.offsetTop,
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
    } else {
        window.addEventListener(
            "scroll",
            () => checkSliderReset(window.scrollY),
            { passive: true }
        );
    }
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

    let currentIndex = 2;

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
            if (currentIndex !== index) {
                currentIndex = index;
                updateCardStates();
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
