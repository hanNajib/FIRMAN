const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const content = $(".content");
const navbar = $("#navbar");

function setBodyHeight() {
    if (content) {
        document.body.style.height = `${content.getBoundingClientRect().height}px`;
    }
}
setBodyHeight();
window.addEventListener("resize", setBodyHeight);
window.addEventListener("load", setBodyHeight);

let currentY = 0;
let targetY = 0;
const ease = 0.08;

function smoothScroll() {
    targetY = window.scrollY;
    currentY += (targetY - currentY) * ease;

    if (content) {
        content.style.transform = `translate3d(0, -${currentY}px, 0)`;
    }

    if (navbar) {
        // Gunakan currentY (posisi smooth scroll riil) agar sinkron mulus dengan konten dan tidak kaku/menghentak
        if (currentY > 35) {
            navbar.classList.add("nav-blur");
            navbar.classList.add("scrolled");
        } else if (currentY < 15) {
            navbar.classList.remove("nav-blur");
            navbar.classList.remove("scrolled");
        }
    }

    requestAnimationFrame(smoothScroll);
}

requestAnimationFrame(smoothScroll);

// Slider Button Interaction (Drag & Click) untuk semua .btn-slider
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

    // Mouse Events
    btn.addEventListener("mousedown", (e) => startDrag(e.clientX));
    window.addEventListener("mousemove", (e) => {
        if (isDragging) moveDrag(e.clientX);
    });
    window.addEventListener("mouseup", () => {
        if (isDragging) endDrag();
    });

    // Touch Events (Mobile)
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

    // Reset otomatis saat scroll kembali ke atas
    window.addEventListener(
        "scroll",
        () => {
            if (btn.id === "slideBtn") {
                if (window.scrollY < 40 && btn.classList.contains("active")) {
                    reset();
                }
            } else if (btn.id === "aboutSlideBtn") {
                const aboutSection = $("#about");
                if (aboutSection && window.scrollY < aboutSection.offsetTop - 120 && btn.classList.contains("active")) {
                    reset();
                }
            }
        },
        { passive: true }
    );
}

function initSliders() {
    const allSliders = $$(".btn-slider");
    allSliders.forEach((btn) => setupSliderButton(btn));
}

initSliders();