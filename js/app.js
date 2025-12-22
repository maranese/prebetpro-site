document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  loadDailyReport();
});

/* MATCHES */
async function loadMatches() {
  const box = document.getElementById("matches");
  const noBox = document.getElementById("no-matches");

  try {
    const r = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    const d = await r.json();

    if (!d.fixtures || d.fixtures.length === 0) {
      noBox.style.display = "block";
      return;
    }

    box.innerHTML = "";
    noBox.style.display = "none";

    renderStatistics(d.fixtures);

    d.fixtures.forEach(m => {
      const el = document.createElement("div");
      el.className = "match-card";
     el.innerHTML = `
  <div class="match-league">
    ${m.league.logo ? `<img src="${m.league.logo}" alt="" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;">` : ""}
    ${m.league.name}
  </div>

  <div class="match-teams">
    ${m.teams.home.name} <strong>vs</strong> ${m.teams.away.name}
  </div>

  <div class="match-info">
    ${m.fixture.status.short}
  </div>
`;

      `;
      box.appendChild(el);
    });
  } catch {
    box.innerHTML = `<div class="no-data">Data unavailable</div>`;
  }
}

/* STATS */
function renderStatistics(fixtures) {
  const s = document.getElementById("stats-summary");
  if (!s) return;

  s.innerHTML = `
    <div class="stat-card"><h3>${fixtures.length}</h3><p>Total matches</p></div>
  `;
}

/* REPORT */
async function loadDailyReport() {
  const s = document.getElementById("report-summary");
  const m = document.getElementById("report-matches");
  const e = document.getElementById("report-empty");

  try {
    const r = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev/report");
    const d = await r.json();

    if (!d.matches || d.matches.length === 0) {
      e.style.display = "block";
      return;
    }

    s.innerHTML = `<div class="stat-card"><h3>${d.matches.length}</h3><p>Finished</p></div>`;
    d.matches.forEach(x => {
      const el = document.createElement("div");
      el.className = "report-match";
      el.innerHTML = `${x.home} ${x.goals_home} – ${x.goals_away} ${x.away}`;
      m.appendChild(el);
    });
  } catch {
    e.style.display = "block";
  }
}

/* BACK TO TOP */
const topBtn = document.getElementById("back-to-top");
window.addEventListener("scroll", () => {
  topBtn.style.display = window.scrollY > 300 ? "block" : "none";
});
topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
