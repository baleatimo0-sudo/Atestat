document.addEventListener("DOMContentLoaded", () => {
  const MODELS = window.AUDI_MODELS || [];

  // 1) ia id din URL: model.html?id=a3
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // 2) găsește modelul
  const model = MODELS.find(m => m.id === id) || MODELS[0];
  if (!model) return;

  // helper pentru text
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = (value === undefined || value === null || value === "") ? "—" : value;
  };

  // ===== Rânduri de bază =====
  setText("modelFamily", model.family);
  setText("modelCategory", model.category);
  setText("modelBody", model.body);
  setText("modelFuel", model.fuel);
  setText("modelDrive", model.drive);

  // ===== SPECIFICAȚII NOI =====
  setText("modelPower", model.powerHp);
  setText("modelAccel", model.accel0_100);
  setText("modelTop", model.topspeed);
  setText("modelCons", model.consumption);
  setText("modelCo2", model.co2);
  setText("modelRange", model.rangeKm);
  setText("modelSeats", model.seats);
  setText("modelTrunk", model.trunkL);

  // ===== Avantaje (listă) =====
  const prosEl = document.getElementById("modelPros");
  if (prosEl) {
    const pros = Array.isArray(model.pros) ? model.pros : [];
    prosEl.innerHTML = pros.length
      ? pros.map(p => `<li>${p}</li>`).join("")
      : "<li>—</li>";
  }

  // (opțional) schimbă titlul paginii dacă ai h1
  const h1 = document.querySelector("h1");
  if (h1) h1.textContent = model.name;

  // DEBUG (poți șterge după)
  console.log("Model încărcat:", model);
  
});
