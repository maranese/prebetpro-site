document.addEventListener("DOMContentLoaded", () => {
  loadTodayMatches();
  loadMatches();
  initBackToTop();
});

/* =========================
   STATUS MESSAGES
========================= */
const STATUS_MESSAGES = {
  no_data: `
    Insufficient historical data.<br>
    We don’t generate predictions when data is unreliable.
  `,
  api_unavailable: `
    Data temporarily unavailable.
  `,
  api_limited: `
    Data update temporarily limited.<br>
    Information will refresh automatically.
  `
};

/* =========================
   LOAD MATCHES (ROOT API)
========================= */
async function loadMatches() {
  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) {
      renderGlobalStatus("api_unavailable");
      return;
    }

    const data = await res.json();
    const fixtures = data.fixtures || [];

    renderStatistics(fixtures);
    renderPredictions(fixtures);

  } catch (err) {
    console.error("loadMatches error:", err);
    renderGlobalStatus("api_unavailable");
  }
}

/* =========================
   LOAD TODAY MATCHES
========================= */
async function loadTodayMatches() {
  const container = document.getElementById("matches");
  const noMatches = document.getElementById("no-matches");
  if (!container) return;

  container.innerHTML = "";

  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) return;

    const data = await res.json();
    const fixtures = data.fixtures || [];

    if (!fixtures.length) {
      noMatches.style.display = "block";
      return;
    }

    noMatches.style.display = "none";

    fixtures
      .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date))
      .forEach(f => container.appendChild(renderMatchCard(f)));

  } catch (err) {
    console.error("loadTodayMatches error:", err);
  }
}

/* =========================
   MATCH CARD (DASHBOARD)
========================= */
function renderMatchCard(f) {
  const card = document.createElement("div");
  card.className = "match-card";

  const time = new Date(f.fixture.date).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const status = f.fixture.status.short;
  const ht = f.score?.halftime;
  const ft = f.score?.fulltime;
  const et = f.score?.extratime;
  const pen = f.score?.penalty;

  let scoreHtml = "";
  if (ht?.home != null) scoreHtml += `<span>HT ${ht.home}–${ht.away}</span>`;
  if (ft?.home != null) scoreHtml += `<span>FT ${ft.home}–${ft.away}</span>`;
  if (status === "AET" && et) scoreHtml += `<span>ET ${et.home}–${et.away}</span>`;
  if (status === "PEN" && pen) scoreHtml += `<span>PEN ${pen.home}–${pen.away}</span>`;

  card.innerHTML = `
    <div class="match-header">
      <div class="match-teams">
        ${f.teams.home.name} vs ${f.teams.away.name}
      </div>
      <div class="match-league">
        ${f.league.name} · ${time}
      </div>
    </div>

    <div class="match-scores">
      ${scoreHtml || "<span>—</span>"}
    </div>
  `;

  return card;
}

/* =========================
   PREDICTIONS (GROUPED)
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  if (!box) return;

  box.innerHTML = "";

  fixtures.forEach(match => {
    const wrapper = document.createElement("div");
    wrapper.className = "prediction-match-group";

    const time = new Date(match.fixture.date).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit"
    });

    wrapper.innerHTML = `
      <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
      <div class="prediction-meta">${match.league.name} · ${time}</div>
    `;

    if (!match.predictions) {
      wrapper.innerHTML += `
        <div class="no-data">
          Insufficient historical data.<br>
          We don’t generate predictions when data is unreliable.
        </div>
      `;
      box.appendChild(wrapper);
      return;
    }

    box.appendChild(wrapper);
  });
}

/* =========================
   STATISTICS
========================= */
function renderStatistics(fixtures) {
  const box = document.getElementById("stats-summary");
  if (!box) return;

  let ns = 0, live = 0, ft = 0;

  fixtures.forEach(f => {
    const s = f.fixture.status.short;
    if (s === "NS") ns++;
    else if (["1H", "HT", "2H"].includes(s)) live++;
    else if (["FT", "AET", "PEN"].includes(s)) ft++;
  });

  box.innerHTML = `
    <div class="stat-card"><h3>${fixtures.length}</h3><p>Total</p></div>
    <div class="stat-card"><h3>${ns}</h3><p>Not started</p></div>
    <div class="stat-card"><h3>${live}</h3><p>Live</p></div>
    <div class="stat-card"><h3>${ft}</h3><p>Finished</p></div>
  `;
}

/* =========================
   GLOBAL STATUS
========================= */
function renderGlobalStatus(status) {
  const message = STATUS_MESSAGES[status];
  if (!message) return;

  const el = document.getElementById("predictions-list");
  if (el) el.innerHTML = `<div class="no-data">${message}</div>`;
}

/* =========================
   BACK TO TOP
========================= */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 300 ? "block" : "none";
  });

  btn.onclick = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });
}
