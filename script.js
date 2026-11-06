const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);
 
const content = $(".content");
const navbar = $("#navbar");
 
function setBodyHeight() {
    if (!content) return;
    const h = `${Math.ceil(content.getBoundingClientRect().height)}px`;
    if (document.body.style.height !== h) document.body.style.height = h;
}
setBodyHeight();
window.addEventListener("resize", setBodyHeight);
window.addEventListener("load", setBodyHeight);

if (content && "ResizeObserver" in window) {
    new ResizeObserver(setBodyHeight).observe(content);
}

let currentY = window.scrollY;
let animationFrame = null;
let lastRenderedY = Number.NaN;
const ease = 0.16;

function smoothScroll() {
    animationFrame = null;
    const targetY = window.scrollY;
    const delta = targetY - currentY;
    currentY = Math.abs(delta) < 0.5 ? targetY : currentY + delta * ease;

    if (content && currentY !== lastRenderedY) {
        content.style.transform = `translate3d(0, -${currentY}px, 0)`;
        lastRenderedY = currentY;
    }

    if (navbar) {
        if (currentY > 35) {
            navbar.classList.add("nav-blur");
            navbar.classList.add("scrolled");
        } else if (currentY < 15) {
            navbar.classList.remove("nav-blur");
            navbar.classList.remove("scrolled");
        }
    }

    if (Math.abs(targetY - currentY) >= 0.5) {
        animationFrame = requestAnimationFrame(smoothScroll);
    } else if (content) {
        content.classList.remove("is-scrolling");
    }
}

function scheduleSmoothScroll() {
    if (animationFrame !== null) return;
    if (content) content.classList.add("is-scrolling");
    animationFrame = requestAnimationFrame(smoothScroll);
}

window.addEventListener("scroll", scheduleSmoothScroll, { passive: true });
scheduleSmoothScroll();

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
                window.scrollTo({
                    top: targetEl.offsetTop,
                    behavior: "smooth"
                });
            } else if (btn.id === "slideBtn") {
                const showcaseSection = $("#hero-showcase") || $("#about");
                if (showcaseSection) {
                    const targetPos = showcaseSection.offsetTop || window.innerHeight;
                    window.scrollTo({
                        top: targetPos,
                        behavior: "smooth"
                    });
                }
            } else {
                const nextSection = btn.closest("section")?.nextElementSibling;
                if (nextSection) {
                    window.scrollTo({
                        top: nextSection.offsetTop,
                        behavior: "smooth"
                    });
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
    let scrollCheckFrame = null;

    function checkSliderReset() {
        scrollCheckFrame = null;
        if (!btn.classList.contains("active")) return;

        if (btn.id === "slideBtn") {
            if (window.scrollY < 40) reset();
        } else if (section && window.scrollY < section.offsetTop - 150) {
            reset();
        }
    }

    window.addEventListener(
        "scroll",
        () => {
            if (scrollCheckFrame !== null) return;
            scrollCheckFrame = requestAnimationFrame(checkSliderReset);
        },
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
