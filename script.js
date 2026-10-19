const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const slideBtn = $("#slideBtn");
const circle = $(".circle");
const content = $(".content")

function setBodyHeight() {
    if (content) {
        document.body.style.height = `${content.getBoundingClientRect().height}px`;
    }
}
setBodyHeight();
window.addEventListener('load', setBodyHeight);
window.addEventListener('resize', setBodyHeight);

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


slideBtn?.addEventListener("click", () => {
    slideBtn.classList.toggle("active");
});

