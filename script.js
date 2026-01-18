document.addEventListener("DOMContentLoaded", () => {
  // anul din footer
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // inițializează slider-ele existente pe pagină
  initSliders();
});

// funcție globală (ca să poată fi apelată și din gama.html după render Plains)
function initSliders() {
  // evită dublarea listener-elor dacă apelezi de mai multe ori
  document.querySelectorAll(".slider").forEach(slider => {
    if (slider.dataset.inited === "1") return;
    slider.dataset.inited = "1";
    createSlider(slider);
  });
}

function createSlider(slider) {
  const slidesEl = slider.querySelector(".slides");
  const slideEls = Array.from(slider.querySelectorAll(".slide"));
  const prevBtn = slider.querySelector(".prev");
  const nextBtn = slider.querySelector(".next");
  const dotsEl = slider.querySelector(".dots");

  if (!slidesEl || slideEls.length <= 1) {
    // dacă ai 0 sau 1 slide, săgețile nu au ce schimba
    return;
  }

  let index = 0;
  const autoplayMs = Number(slider.dataset.autoplay || "0");
  let timer = null;

  // creăm dots
  if (dotsEl) {
    dotsEl.innerHTML = "";
    slideEls.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.addEventListener("click", () => goTo(i));
      dotsEl.appendChild(dot);
    });
  }

function setBlurBackground() {
  slideEls.forEach(slide => {
    const img = slide.querySelector("img");
    if (!img) return;

    if (img.complete) {
      slide.style.setProperty("--bg-img", `url("${img.src}")`);
    } else {
      img.addEventListener("load", () => {
        slide.style.setProperty("--bg-img", `url("${img.src}")`);
      }, { once: true });
    }
  });
}


  function update() {
    slidesEl.style.transform = `translateX(${-index * 100}%)`;

    // dots active
    if (dotsEl) {
      const dots = Array.from(dotsEl.querySelectorAll(".dot"));
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    }
  }

  function goTo(i) {
    index = (i + slideEls.length) % slideEls.length;
    update();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  // click pe săgeți
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.preventDefault(); next(); });
  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.preventDefault(); prev(); });

  // autoplay
  function start() {
    if (!autoplayMs) return;
    stop();
    timer = setInterval(next, autoplayMs);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // oprește autoplay când stai cu mouse-ul pe slider
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  // inițializări
  setBlurBackground();
  update();
  start();
}
