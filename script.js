const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const content = $(".content");

function setBodyHeight() {
    if (content) {
        document.body.style.height = `${content.getBoundingClientRect().height}px`;
    }
}
setBodyHeight();
window.addEventListener('resize', setBodyHeight);
window.addEventListener('load', setBodyHeight);

let currentY = 0;
let targetY = 0;
let ease = 0.08;

function smoothScroll() {
    targetY = window.scrollY;
    currentY += (targetY - currentY) * ease;

    if (content) {
        content.style.transform = `translate3d(0, -${currentY}px, 0)`;
    }

    requestAnimationFrame(smoothScroll);
}

requestAnimationFrame(smoothScroll);

// Slider Button Interaction (Drag & Click)
function initSlider() {
    const btn = $("#slideBtn");
    const thumb = btn?.querySelector(".circle");
    const text = btn?.querySelector(".btn-slider-text");

    if (!btn || !thumb) return;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let maxSlide = 0;
    let wasDragged = false;

    function updateMetrics() {
        const btnWidth = btn.offsetWidth;
        const thumbWidth = thumb.offsetWidth || 48;
        // 6px padding kiri + 6px padding kanan = 12px
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

        // Scroll halus ke section berikutnya (hero-showcase / about) setelah animasi slide selesai
        setTimeout(() => {
            const showcaseSection = $("#hero-showcase") || $("#about");
            if (showcaseSection) {
                const targetPos = showcaseSection.offsetTop || window.innerHeight;
                window.scrollTo({
                    top: targetPos,
                    behavior: "smooth"
                });
            }
        }, 380);
    }

    function reset() {
        btn.classList.remove("active");
        thumb.style.transform = "";
        if (text) text.style.opacity = "";
    }

    // Toggle saat diklik biasa (bukan drag)
    btn.addEventListener("click", () => {
        if (wasDragged) return;
        if (btn.classList.contains("active")) {
            reset();
        } else {
            activate();
        }
    });

    // Mouse Drag
    btn.addEventListener("mousedown", (e) => {
        startDrag(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
        if (isDragging) moveDrag(e.clientX);
    });

    window.addEventListener("mouseup", () => {
        if (isDragging) endDrag();
    });

    // Touch Drag (Mobile)
    btn.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            startDrag(e.touches[0].clientX);
        }
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
        if (isDragging && e.touches.length === 1) {
            moveDrag(e.touches[0].clientX);
        }
    }, { passive: true });

    window.addEventListener("touchend", () => {
        if (isDragging) endDrag();
    });

    // Reset otomatis ketika user scroll kembali ke puncak halaman
    let hasScrolledDown = false;
    window.addEventListener("scroll", () => {
        if (window.scrollY > 200) {
            hasScrolledDown = true;
        } else if (hasScrolledDown && window.scrollY < 40) {
            hasScrolledDown = false;
            reset();
        }
    }, { passive: true });
}

initSlider();


