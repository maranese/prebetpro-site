document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
});

/* =========================
   LOAD MATCHES
========================= */
async function loadMatches() {
  const box = document.getElementById("predictions-list");
  if (!box) return;

  try {
    const r = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    const d = await r.json();
    const fixtures = d.fixtures || [];

    box.innerHTML = "";

    fixtures.forEach(match => {
      renderPredictionCard(match, box);
    });

  } catch {
    box.innerHTML = `<div class="no-data">Data unavailable</div>`;
  }
}

/* =========================
   CARD
========================= */
function renderPredictionCard(match, container) {
  const card = document.createElement("div");
  card.className = "prediction-card";

  const probsGoals = calculatePoissonProbabilities(1.35, 1.15);
  const probs1X2 = calculate1X2Probabilities();

  card.innerHTML = `
    <div class="prediction-header">
      ${match.teams.home.name} vs ${match.teams.away.name}
    </div>

    <div class="prediction-grid">

      ${renderBlock("Match Result", [
        row("1", probs1X2["1"]),
        row("X", probs1X2["X"]),
        row("2", probs1X2["2"])
      ])}

      ${renderBlock("Double Chance", [
        row("1X", probs1X2["1X"]),
        row("X2", probs1X2["X2"]),
        row("12", probs1X2["12"])
      ])}

      ${renderBlock("Goals", [
        row("Over 1.5", probsGoals.over15),
        row("Over 2.5", probsGoals.over25),
        row("Goal", probsGoals.goal)
      ])}

    </div>
  `;

  container.appendChild(card);
}

/* =========================
   HELPERS
========================= */
function row(label, perc) {
  const high = perc >= 70 ? "prediction-high" : "";
  const fair = (100 / perc).toFixed(2);

  return `
    <div class="prediction-row ${high}">
      <span>${label}</span>
      <strong>${perc}%</strong>
      <span class="fair-odds">fair ${fair}</span>
    </div>
  `;
}

function renderBlock(title, rows) {
  return `
    <div class="prediction-block">
      <h4>${title}</h4>
      ${rows.join("")}
    </div>
  `;
}

/* =========================
   MODELS
========================= */
function calculate1X2Probabilities() {
  return { "1": 45, "X": 28, "2": 27, "1X": 73, "X2": 55, "12": 72 };
}

function poisson(k, l) {
  return Math.pow(l, k) * Math.exp(-l) / factorial(k);
}
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
function calculatePoissonProbabilities(lh, la) {
  let o15 = 0, o25 = 0, goal = 0;
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const p = poisson(h, lh) * poisson(a, la);
      if (h + a >= 2) o15 += p;
      if (h + a >= 3) o25 += p;
      if (h > 0 && a > 0) goal += p;
    }
  }
  return {
    over15: Math.round(o15 * 100),
    over25: Math.round(o25 * 100),
    goal: Math.round(goal * 100)
  };
}
