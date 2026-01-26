// js/finder.js
document.addEventListener("DOMContentLoaded", () => {
  const MODELS = window.AUDI_MODELS || [];

  const form = document.getElementById("finderForm");
  const resultsEl = document.getElementById("results");
  const hintEl = document.getElementById("hint");
  const resetBtn = document.getElementById("resetBtn");

  const useEl = document.getElementById("use");
  const bodyEl = document.getElementById("bodyPref");
  const fuelEl = document.getElementById("fuelPref");
  const quattroEl = document.getElementById("quattro");
  const spaceEl = document.getElementById("space");

  function norm(s) { return (s || "").toLowerCase(); }

  function scoreModel(m, prefs) {
    let score = 0;
    const reasons = [];

    const name = norm(m.name);
    const cat = norm(m.category);
    const fam = norm(m.family);
    const body = norm(m.body);
    const fuel = norm(m.fuel);
    const drive = norm(m.drive);

    // ===== Preferință electric =====
    const isElectric = fuel.includes("electric") || fam.includes("e-tron") || cat.includes("electrice");
    if (prefs.fuelPref === "electric") {
      if (isElectric) { score += 30; reasons.push("Este electric (e-tron)."); }
      else { score -= 15; }
    } else if (prefs.fuelPref === "nonElectric") {
      if (!isElectric) { score += 12; reasons.push("Este non-electric, conform preferinței."); }
      else { score -= 10; }
    }

    // ===== Caroserie preferată =====
    const isSUV = cat.includes("suv") || body.includes("suv") || name.includes("q");
    const isCompact = cat.includes("compact") || body.includes("hatch");
    const isSedan = cat.includes("sedan") || body.includes("sedan") || body.includes("avant") || body.includes("sportback");
    const isGT = body.includes("gt") || body.includes("gran") || name.includes("gt") || name.includes("r8") || fam === "rs";

    if (prefs.bodyPref === "suv") {
      if (isSUV) { score += 18; reasons.push("Se potrivește preferinței SUV."); }
      else score -= 6;
    } else if (prefs.bodyPref === "compact") {
      if (isCompact) { score += 18; reasons.push("Se potrivește preferinței Compact."); }
      else score -= 6;
    } else if (prefs.bodyPref === "sedan") {
      if (isSedan) { score += 18; reasons.push("Se potrivește preferinței Sedan/Avant."); }
      else score -= 6;
    } else if (prefs.bodyPref === "gt") {
      if (isGT) { score += 18; reasons.push("Se potrivește preferinței GT/Sport."); }
      else score -= 6;
    }

    // ===== quattro =====
    const hasQuattro = drive.includes("quattro");
    if (prefs.quattro === "quattro") {
      if (hasQuattro) { score += 14; reasons.push("Are tracțiune quattro."); }
      else score -= 5;
    }

    // ===== Spațiu =====
    // estimare simplă pe baza categoriei
    if (prefs.space === "high") {
      if (isSUV || name.includes("a6") || name.includes("a7") || name.includes("a8") || name.includes("q7") || name.includes("q8")) {
        score += 16; reasons.push("Oferă spațiu ridicat.");
      } else score -= 3;
    } else if (prefs.space === "medium") {
      if (name.includes("a3") || name.includes("a4") || name.includes("q3") || name.includes("q5")) {
        score += 10; reasons.push("Spațiu potrivit pentru utilizare medie.");
      }
    } else if (prefs.space === "low") {
      if (name.includes("a1") || isCompact) {
        score += 10; reasons.push("Dimensiuni bune pentru spațiu redus (urban).");
      }
    }

    // ===== Utilizare =====
    if (prefs.use === "city") {
      if (isCompact || name.includes("a1") || name.includes("a3") || name.includes("q2") || name.includes("q3") || isElectric) {
        score += 16; reasons.push("Potrivit pentru oraș.");
      }
    } else if (prefs.use === "mixed") {
      if (name.includes("a3") || name.includes("a4") || name.includes("q3") || name.includes("q5")) {
        score += 14; reasons.push("Bun pentru utilizare mixtă.");
      }
    } else if (prefs.use === "long") {
      if (name.includes("a6") || name.includes("a7") || name.includes("a8") || name.includes("q7") || name.includes("q8")) {
        score += 16; reasons.push("Confort bun la drum lung.");
      }
    } else if (prefs.use === "family") {
      if (isSUV || name.includes("avant") || name.includes("q5") || name.includes("q7")) {
        score += 16; reasons.push("Potrivit pentru familie.");
      }
    } else if (prefs.use === "sport") {
      if (fam === "rs" || fam === "s" || name.includes("r8") || name.includes("gt")) {
        score += 22; reasons.push("Orientat spre performanță.");
      }
    }

    // bonus: modele RS/S primesc un mic boost dacă nu sunt penalizate
    if (fam === "rs") score += 5;
    if (fam === "s") score += 3;

    // normalizează scorul în 0..100 (aproximativ)
    const finalScore = Math.max(0, Math.min(100, score + 40));
    return { finalScore, reasons };
  }

function renderTop(top) {
  resultsEl.innerHTML = "";

  top.forEach(({ model, finalScore, reasons }, idx) => {
    const reasonList = reasons.slice(0, 4).map(r => `<li>${r}</li>`).join("");
    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";

    // dacă nu există images, folosește img ca fallback
    const gallery = (model.images && model.images.length) ? model.images : [model.img];

    const card = document.createElement("div");
    card.className = "model-card";

    card.innerHTML = `
      <h4>${medal} ${model.name}</h4>

      <div class="score-wrap" aria-label="Scor recomandare">
        <div class="progress" role="progressbar"
          aria-valuemin="0" aria-valuemax="100" aria-valuenow="${finalScore}">
          <div class="bar" data-score="${finalScore}"></div>
        </div>
        <span class="score-badge">${finalScore}/100</span>
      </div>

      <div class="card" style="padding:12px; margin:10px 0;">
        <div class="slider" data-autoplay="2500" aria-label="Galerie ${model.name}">
          <div class="slides">
            ${gallery.map((src) => `
              <div class="slide">
                <a href="model.html?id=${encodeURIComponent(model.id)}">
                  <img src="${src}" alt="${model.name}" />
                </a>
                <div class="caption">${model.name}</div>
              </div>
            `).join("")}
          </div>

          <button class="nav-btn prev" type="button" aria-label="Anterior">‹</button>
          <button class="nav-btn next" type="button" aria-label="Următor">›</button>
          <div class="dots" aria-label="Indicatori"></div>
        </div>
      </div>

      <p class="note">${model.desc || ""}</p>

      <ul style="margin-left:16px; opacity:0.9; margin-top:8px;">
        ${reasonList}
      </ul>

      <div class="btn-row" style="margin-top:12px;">
        <a class="btn" href="model.html?id=${encodeURIComponent(model.id)}">Vezi detalii</a>
        <a class="btn secondary" href="gama.html">Înapoi la Gama</a>
      </div>
    `;

    resultsEl.appendChild(card);

    // animează progress bar după ce cardul intră în DOM
    requestAnimationFrame(() => {
      const bar = card.querySelector(".bar");
      if (bar) bar.style.width = `${bar.dataset.score}%`;
    });
  });

  // pornește slider-ele după ce au fost adăugate
  if (typeof initSliders === "function") initSliders();
}


  function run() {
    const prefs = {
      use: useEl.value,
      bodyPref: bodyEl.value,
      fuelPref: fuelEl.value,
      quattro: quattroEl.value,
      space: spaceEl.value
    };

    const scored = MODELS.map(model => {
      const { finalScore, reasons } = scoreModel(model, prefs);
      return { model, finalScore, reasons };
    });

    scored.sort((a, b) => b.finalScore - a.finalScore);

    const top = scored.slice(0, 3);
    hintEl.textContent = `Am găsit cele mai potrivite 3 recomandări pentru preferințele tale.`;

    renderTop(top);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!MODELS.length) {
      hintEl.textContent = "Nu există modele încărcate. Verifică data/models.js.";
      return;
    }
    run();
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    resultsEl.innerHTML = "";
    hintEl.textContent = "Completează preferințele și apasă „Generează recomandări”.";
  });
});
