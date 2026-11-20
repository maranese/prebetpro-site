/* PreBetPro front-end v6 – single page, hash routing, no external dependencies */
(function () {
  "use strict";

  var API = "https://prebetpro-api.vincenzodiguida.workers.dev";
  var TZ = "Europe/Rome";
  var FINAL = ["FT", "AET", "PEN"];
  var LIVE = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"];
  var VOIDS = ["PST", "CANC", "ABD", "AWD", "WO"];
  var cache = {};

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function romeDate(offset) {
    var d = new Date(Date.now() + (offset || 0) * 864e5);
    try {
      var p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return o.year + "-" + o.month + "-" + o.day;
    } catch (e) { return d.toISOString().slice(0, 10); }
  }
  function shiftDate(iso, n) {
    var d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
  }
  function fmtTime(iso) {
    if (!iso) return "";
    try { return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ }); }
    catch (e) { return new Date(iso).toLocaleTimeString().slice(0, 5); }
  }
  function fmtDay(iso, long) {
    var d = new Date((iso.length === 10 ? iso + "T12:00:00Z" : iso));
    try { return d.toLocaleDateString("en-GB", long ? { weekday: "long", day: "numeric", month: "long", timeZone: TZ } : { weekday: "short", day: "2-digit", month: "short", timeZone: TZ }); }
    catch (e) { return iso.slice(0, 10); }
  }
  function dayLabel(iso) {
    if (iso === romeDate(0)) return "Today";
    if (iso === romeDate(-1)) return "Yesterday";
    if (iso === romeDate(1)) return "Tomorrow";
    return fmtDay(iso);
  }
  function get(path, ttl) {
    var now = Date.now(), c = cache[path];
    if (c && now - c.t < (ttl || 60000)) return c.p;
    var p = fetch(API + path, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
    cache[path] = { t: now, p: p };
    p.catch(function () { delete cache[path]; });
    return p;
  }
  function stateOf(f) {
    var s = f.fixture.status.short;
    if (FINAL.indexOf(s) >= 0) return "ft";
    if (LIVE.indexOf(s) >= 0) return "live";
    if (VOIDS.indexOf(s) >= 0) return "void";
    return "ns";
  }
  function scoreText(f) {
    var g = f.goals || {};
    return g.home == null ? "" : g.home + " – " + g.away;
  }
  function statusBadge(f) {
    var st = stateOf(f), s = f.fixture.status;
    if (st === "live") return '<span class="badge live">● ' + (s.short === "HT" ? "HT" : (s.elapsed != null ? s.elapsed + "'" : "LIVE")) + "</span>";
    if (st === "ft") return '<span class="badge ft">' + esc(s.short) + "</span>";
    if (st === "void") return '<span class="badge void">' + esc(s.short) + "</span>";
    return '<span class="badge ns">' + fmtTime(f.fixture.date) + "</span>";
  }
  function resultBadge(r) {
    if (r === true) return '<span class="badge win">WON</span>';
    if (r === false) return '<span class="badge loss">LOST</span>';
    if (r === "void") return '<span class="badge void">VOID</span>';
    return '<span class="badge pending">PENDING</span>';
  }
  function empty(msg) { return '<div class="empty">' + msg + "</div>"; }
  function loading(el) { if (el) el.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>'; }
  function fail(el, err) { if (el) el.innerHTML = empty("Data temporarily unavailable. Please retry in a minute."); if (err) console.error(err); }
  function logo(src, cls) { return src ? '<img class="' + cls + '" src="' + esc(src) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : ""; }
  function kpi(v, l, cls) { return '<div class="kpi ' + (cls || "") + '"><b>' + v + "</b><span>" + l + "</span></div>"; }

  /* ---------- markets ---------- */
  var GROUPS = [
    { t: "1X2", items: [["1", "home_win", "home_win"], ["X", "draw", "draw"], ["2", "away_win", "away_win"]] },
    { t: "Double chance", items: [["1X", "double_chance.1x", "dc_1x"], ["X2", "double_chance.x2", "dc_x2"], ["12", "double_chance.12", "dc_12"]] },
    { t: "Goals", items: [["O 1.5", "over_15", "over_15"], ["U 1.5", "under_15", null], ["O 2.5", "over_25", "over_25"], ["U 2.5", "under_25", "under_25"]] },
    { t: "Both teams score", items: [["Goal", "btts", "btts"], ["No Goal", "no_btts", "no_btts"]] }
  ];
  var KEY_OF = { "1": "home_win", "X": "draw", "2": "away_win", "1X": "dc_1x", "X2": "dc_x2", "12": "dc_12", "Over 1.5": "over_15", "Over 2.5": "over_25", "Under 2.5": "under_25", "Goal": "btts", "No Goal": "no_btts" };
  function val(p, path) { return path.split(".").reduce(function (o, k) { return o ? o[k] : null; }, p); }
  function hit(key, h, a) {
    return { home_win: h > a, draw: h === a, away_win: a > h, dc_1x: h >= a, dc_x2: a >= h, dc_12: h !== a, over_15: h + a > 1, over_25: h + a > 2, under_25: h + a < 3, under_15: h + a < 2, btts: h > 0 && a > 0, no_btts: !(h > 0 && a > 0) }[key];
  }
  function confTag(c) { return c ? '<span class="tag conf-' + esc(c) + '">' + esc(c) + " confidence</span>" : ""; }
  function marketsGrid(f) {
    var p = f.predictions;
    if (!p) return '<div class="muted small">Not enough recorded matches for these teams yet (min. 8 per team).</div>';
    var st = stateOf(f), h = f.goals && f.goals.home, a = f.goals && f.goals.away;
    return '<div class="mk-grid">' + GROUPS.map(function (g) {
      return '<div class="mk-group"><div class="mk-title">' + g.t + '</div><div class="mk-row">' + g.items.map(function (it) {
        var v = val(p, it[1]); var strong = it[2] && p.strength && p.strength[it[2]];
        var cls = "mk" + (strong ? " strong" : "");
        if (st === "ft" && h != null) cls += hit(it[2] || "under_15", h, a) ? " ok" : " ko";
        return '<div class="' + cls + '"><span>' + it[0] + "</span><b>" + (v == null ? "—" : v + "%") + "</b></div>";
      }).join("") + "</div></div>";
    }).join("") + "</div>";
  }
  function topMarkets(f) {
    var p = f.predictions; if (!p) return [];
    var list = [["1", p.home_win, "home_win"], ["X", p.draw, "draw"], ["2", p.away_win, "away_win"], ["O 2.5", p.over_25, "over_25"], ["U 2.5", p.under_25, "under_25"], ["Goal", p.btts, "btts"]];
    return list.filter(function (m) { return m[1] != null; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 3)
      .map(function (m) { return { l: m[0], v: m[1], s: p.strength && p.strength[m[2]] }; });
  }

  /* ---------- routing ---------- */
  var VIEWS = ["picks", "matches", "predictions", "tennis", "report", "archive", "method"];
  var loaders = {};
  function route(keepScroll) {
    var raw = (location.hash || "#picks").slice(1).split("?"), v = raw[0];
    if (VIEWS.indexOf(v) < 0) v = "picks";
    VIEWS.forEach(function (x) { var el = $("view-" + x); if (el) el.hidden = x !== v; });
    var links = document.querySelectorAll(".nav a");
    for (var i = 0; i < links.length; i++) links[i].classList.toggle("active", links[i].getAttribute("data-view") === v);
    document.title = ($("view-" + v).getAttribute("data-title") || "") + " · PreBetPro";
    closeNav();
    if (loaders[v]) loaders[v](raw[1] || "");
    if (keepScroll !== true) window.scrollTo(0, 0);
  }

  /* ---------- day selector ---------- */
  function daySeg(el, offsets, current, onPick) {
    el.innerHTML = offsets.map(function (o) {
      var d = romeDate(o);
      return '<button data-d="' + d + '" class="' + (d === current ? "on" : "") + '">' + dayLabel(d) + "</button>";
    }).join("");
    el.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("button") : e.target; if (!b || !b.getAttribute("data-d")) return;
      var bs = el.querySelectorAll("button"); for (var i = 0; i < bs.length; i++) bs[i].classList.remove("on");
      b.classList.add("on"); onPick(b.getAttribute("data-d"));
    };
  }

  /* ================= TOP PICKS ================= */
  loaders.picks = function () {
    var today = romeDate(0), fb = $("picks-football"), tn = $("picks-tennis");
    loading(fb); loading(tn);
    Promise.all([
      get("/history?date=" + today).catch(function () { return {}; }),
      get("/day?date=" + romeDate(1)).catch(function () { return {}; }),
      get("/report/summary?range=30").catch(function () { return null; }),
      get("/tennis?date=" + today).catch(function () { return {}; })
    ]).then(function (r) {
      var hist = r[0] || {}, tom = r[1] || {}, rep = r[2], ten = r[3] || {};
      var seen = {}, rows = [];
      (hist.picks || []).forEach(function (p) {
        var k = p.af_id + ":" + p.market; seen[k] = 1;
        rows.push({ match: p.match, league: p.league, kickoff: p.kickoff, market: p.market, value: p.probability, result: p.result, ft: p.ft, void: p.void, frozen: true, fid: p.af_id, day: today });
      });
      (hist.ranked_predictions || []).forEach(function (p) {
        var k = p.fixture_id + ":" + p.market; if (seen[k]) return; seen[k] = 1;
        rows.push({ match: p.match, league: p.league, kickoff: p.kickoff, market: p.market, value: p.value, fid: p.fixture_id, day: today });
      });
      var nToday = rows.length;
      if (nToday < 5) (tom.ranked_predictions || []).forEach(function (p) {
        rows.push({ match: p.match, league: p.league, kickoff: p.kickoff, market: p.market, value: p.value, fid: p.fixture_id, day: romeDate(1) });
      });
      rows.sort(function (a, b) { return new Date(a.kickoff) - new Date(b.kickoff) || b.value - a.value; });

      var fx = hist.fixtures || [];
      var s = rep && rep.summary ? rep.summary : null;
      $("picks-kpis").innerHTML =
        kpi(fx.length, "matches today") +
        kpi(fx.filter(function (f) { return f.predictions; }).length, "with prediction") +
        kpi(nToday, "football picks today") +
        kpi(s && s.total ? s.accuracy + "%" : "—", "hit rate 30d" + (s && s.total ? " (" + s.won + "/" + s.total + ")" : ""), "accent");

      fb.innerHTML = rows.length ? rows.map(pickCard).join("") :
        empty("No match passes the reliability filter right now. Top Picks are published only when the model's confidence is high — check the <a href='#predictions'>Predictions</a> page for all probabilities.");
      bindPickLinks(fb);

      var tp = (ten.date === today ? ten.picks : []) || [];
      tn.innerHTML = tp.length ? tp.map(tennisCard).join("") : empty("No tennis pick published for today yet. The engine refreshes every 30 minutes.");
      $("picks-updated").textContent = hist.updated ? "Updated " + new Date(hist.updated).toLocaleString("en-GB", { timeZone: TZ }) : "";
    }).catch(function (e) { fail(fb, e); fail(tn); });
  };
  function pickCard(p) {
    var badge = p.frozen ? (p.void ? resultBadge("void") : resultBadge(p.result)) : '<span class="badge ns">' + (p.day === romeDate(0) ? "" : dayLabel(p.day) + " ") + fmtTime(p.kickoff) + "</span>";
    return '<div class="card pick' + (p.result === true ? " is-win" : p.result === false ? " is-loss" : "") + '" data-fid="' + esc(p.fid) + '" data-day="' + esc(p.day) + '" tabindex="0" role="button">' +
      '<div class="card-top"><span class="muted small ellipsis">' + esc(p.league || "") + "</span>" + badge + "</div>" +
      '<div class="card-match">' + esc(p.match) + "</div>" +
      '<div class="card-pick"><span class="market">' + esc(p.market) + '</span><span class="prob">' + esc(p.value) + "%</span></div>" +
      '<div class="meter"><i style="width:' + Math.max(0, Math.min(100, +p.value || 0)) + '%"></i></div>' +
      '<div class="muted small">' + fmtDay(p.kickoff) + " · " + fmtTime(p.kickoff) + (p.ft ? " · FT " + esc(p.ft) : "") + (p.frozen && p.result == null && !p.void ? " · frozen" : "") + "</div></div>";
  }
  function bindPickLinks(root) {
    root.onclick = function (e) {
      var c = e.target.closest ? e.target.closest("[data-fid]") : null; if (!c) return;
      openMatch(c.getAttribute("data-day"), c.getAttribute("data-fid"));
    };
    root.onkeydown = function (e) { if (e.key === "Enter") root.onclick(e); };
  }
  function tennisCard(p) {
    var badge = p.result === true || p.result === false || p.result === "void" ? resultBadge(p.result) : '<span class="badge ns">' + esc(p.time || "") + "</span>";
    return '<div class="card pick tennis' + (p.result === true ? " is-win" : p.result === false ? " is-loss" : "") + '">' +
      '<div class="card-top"><span class="muted small ellipsis">' + esc(p.tournament || "") + "</span>" + badge + "</div>" +
      '<div class="card-match">' + esc(p.match) + "</div>" +
      '<div class="card-pick"><span class="market">' + esc(p.pick) + ' to win</span><span class="prob">' + esc(p.probability) + "%</span></div>" +
      '<div class="meter"><i style="width:' + Math.max(0, Math.min(100, +p.probability || 0)) + '%"></i></div>' +
      '<div class="odds"><span>Fair <b>' + Number(p.fair_odds).toFixed(2) + "</b></span><span>Min <b>" + Number(p.min_odds).toFixed(2) + "</b></span></div>" +
      (p.score ? '<div class="muted small">Score: ' + esc(p.score) + "</div>" : "") +
      (p.void_reason ? '<div class="muted small">' + esc(p.void_reason) + "</div>" : "") + "</div>";
  }

  /* ================= MATCHES ================= */
  var M = { day: romeDate(0), fixtures: [] };
  loaders.matches = function () {
    daySeg($("matches-day"), [-1, 0, 1], M.day, function (d) { M.day = d; loadMatches(); });
    loadMatches();
  };
  function loadMatches() {
    var list = $("matches-list"); loading(list);
    get("/day?date=" + M.day).then(function (d) {
      M.fixtures = sortFx(d.fixtures || []);
      fillFilters(M.fixtures, "m-country", "m-league", renderMatches);
      renderMatches();
    }).catch(function (e) { fail(list, e); });
  }
  function renderMatches() {
    var fx = applyCL(M.fixtures, "m-country", "m-league"), st = $("m-status").value, q = $("m-search").value.trim().toLowerCase();
    if (st) fx = fx.filter(function (f) { return stateOf(f) === st; });
    if (q) fx = fx.filter(function (f) { return (f.teams.home.name + " " + f.teams.away.name).toLowerCase().indexOf(q) >= 0; });
    var all = M.fixtures;
    $("matches-kpis").innerHTML = kpi(all.length, "matches") + kpi(all.filter(function (f) { return stateOf(f) === "live"; }).length, "live", "live") +
      kpi(all.filter(function (f) { return stateOf(f) === "ft"; }).length, "finished") + kpi(all.filter(function (f) { return f.predictions; }).length, "with prediction");
    $("matches-list").innerHTML = fx.length ? groupByLeague(fx, matchRow) : empty("No matches for this selection.");
    bindMatchRows($("matches-list"), M.day);
  }
  function matchRow(f) {
    var tm = topMarkets(f), st = stateOf(f);
    return '<div class="mrow" data-fid="' + f.fixture.id + '" tabindex="0" role="button">' +
      '<div class="mrow-status">' + statusBadge(f) + "</div>" +
      '<div class="mrow-teams"><div class="team">' + logo(f.teams.home.logo, "tlogo") + "<span>" + esc(f.teams.home.name) + "</span>" + (st !== "ns" ? "<b>" + (f.goals.home == null ? "" : f.goals.home) + "</b>" : "") + "</div>" +
      '<div class="team">' + logo(f.teams.away.logo, "tlogo") + "<span>" + esc(f.teams.away.name) + "</span>" + (st !== "ns" ? "<b>" + (f.goals.away == null ? "" : f.goals.away) + "</b>" : "") + "</div></div>" +
      '<div class="mrow-mk">' + (tm.length ? tm.map(function (m) { return '<span class="pill' + (m.s ? " strong" : "") + '">' + m.l + " <b>" + m.v + "%</b></span>"; }).join("") : '<span class="muted small">no prediction</span>') + "</div>" +
      '<div class="mrow-go" aria-hidden="true">›</div></div>';
  }
  function bindMatchRows(root, day) {
    root.onclick = function (e) {
      var c = e.target.closest ? e.target.closest("[data-fid]") : null; if (!c) return;
      openMatch(day, c.getAttribute("data-fid"));
    };
    root.onkeydown = function (e) { if (e.key === "Enter") root.onclick(e); };
  }
  ["m-status", "m-search"].forEach(function (id) { var el = $(id); if (el) el.addEventListener(id === "m-search" ? "input" : "change", function () { renderMatches(); }); });

  /* ================= PREDICTIONS ================= */
  var P = { day: romeDate(0), fixtures: [] };
  loaders.predictions = function () {
    daySeg($("pred-day"), [0, 1], P.day, function (d) { P.day = d; loadPred(); });
    loadPred();
  };
  function loadPred() {
    var list = $("pred-list"); loading(list);
    get("/day?date=" + P.day).then(function (d) {
      P.fixtures = sortFx(d.fixtures || []);
      fillFilters(P.fixtures, "p-country", "p-league", renderPred);
      renderPred();
    }).catch(function (e) { fail(list, e); });
  }
  function renderPred() {
    var fx = applyCL(P.fixtures, "p-country", "p-league").filter(function (f) { return f.predictions; });
    var c = $("p-conf").value, strongOnly = $("p-strong").checked;
    if (c === "high") fx = fx.filter(function (f) { return f.confidence === "high"; });
    if (c === "medium") fx = fx.filter(function (f) { return f.confidence === "high" || f.confidence === "medium"; });
    if (strongOnly) fx = fx.filter(function (f) { var s = f.predictions.strength; return s && Object.keys(s).some(function (k) { return s[k]; }); });
    var none = P.fixtures.length - P.fixtures.filter(function (f) { return f.predictions; }).length;
    $("pred-list").innerHTML = (fx.length ? groupByLeague(fx, predCard) : empty("No predictions for this selection.")) +
      (none ? '<p class="muted small center">' + none + " match(es) without prediction: not enough recorded results for one of the teams.</p>" : "");
    bindMatchRows($("pred-list"), P.day);
  }
  function predCard(f) {
    return '<div class="pcard">' +
      '<div class="pcard-head" data-fid="' + f.fixture.id + '" role="button" tabindex="0"><div><b>' + esc(f.teams.home.name) + "</b> vs <b>" + esc(f.teams.away.name) + "</b>" +
      (stateOf(f) !== "ns" ? ' <span class="score">' + scoreText(f) + "</span>" : "") + "</div>" +
      '<div class="pcard-meta">' + statusBadge(f) + confTag(f.confidence) + "</div></div>" + marketsGrid(f) + "</div>";
  }
  ["p-conf", "p-strong"].forEach(function (id) { var el = $(id); if (el) el.addEventListener("change", function () { renderPred(); }); });

  /* ================= TENNIS ================= */
  var T = { day: romeDate(0) };
  loaders.tennis = function () {
    daySeg($("tennis-day"), [-2, -1, 0, 1], T.day, function (d) { T.day = d; loadTennis(); });
    loadTennis();
  };
  function loadTennis() {
    var list = $("tennis-list"); loading(list);
    Promise.all([get("/tennis?date=" + T.day + "&exact=1").catch(function () { return {}; }), get("/tennis/report").catch(function () { return null; })]).then(function (r) {
      var picks = (r[0] && r[0].date === T.day && r[0].picks) || [], s = r[1] && r[1].summary;
      $("tennis-kpis").innerHTML = kpi(picks.length, "picks " + dayLabel(T.day).toLowerCase()) +
        kpi(s ? s.total : 0, "graded (30d)") + kpi(s ? s.won + " / " + s.lost : "—", "won / lost") + kpi(s && s.total ? s.accuracy + "%" : "—", "hit rate 30d", "accent");
      list.innerHTML = picks.length ? picks.slice().sort(function (a, b) { return String(a.start || a.time).localeCompare(String(b.start || b.time)); }).map(tennisCard).join("") : empty("No tennis picks for " + dayLabel(T.day).toLowerCase() + ".");
    }).catch(function (e) { fail(list, e); });
  }

  /* ================= REPORT ================= */
  var R = { range: 7 };
  loaders.report = function () {
    var seg = $("report-range");
    seg.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("button") : null; if (!b) return;
      var bs = seg.querySelectorAll("button"); for (var i = 0; i < bs.length; i++) bs[i].classList.toggle("on", bs[i] === b);
      R.range = +b.getAttribute("data-r"); loadReport();
    };
    loadReport();
  };
  function loadReport() {
    loading($("report-bars"));
    Promise.all([get("/report/summary?range=" + R.range), get("/report"), get("/tennis/report").catch(function () { return null; })]).then(function (r) {
      var sum = r[0], rep = r[1], ten = r[2], s = sum.summary || {};
      $("report-kpis").innerHTML = kpi(s.total || 0, "graded picks") + kpi(s.won || 0, "won", "win") + kpi(s.lost || 0, "lost", "loss") + kpi(s.total ? s.accuracy + "%" : "—", "hit rate", "accent");
      var days = sum.by_day || [];
      $("report-bars").innerHTML = days.some(function (d) { return d.total; }) ? days.map(function (d) {
        var pct = d.total ? Math.round(d.won / d.total * 100) : 0;
        return '<div class="bar" title="' + d.date + ": " + d.won + "/" + d.total + '"><div class="bar-col"><i class="w" style="height:' + (d.total ? pct : 0) + '%"></i></div><span>' + d.date.slice(8) + "/" + d.date.slice(5, 7) + "</span><em>" + (d.total ? d.won + "/" + d.total : "–") + "</em></div>";
      }).join("") : empty("No graded picks in this period yet. Picks are graded after full time.");
      var picks = rep.picks || [];
      var mk = {}; picks.forEach(function (p) { var m = mk[p.market] = mk[p.market] || { w: 0, l: 0 }; p.result ? m.w++ : m.l++; });
      var keys = Object.keys(mk).sort(function (a, b) { return (mk[b].w + mk[b].l) - (mk[a].w + mk[a].l); });
      $("report-markets").innerHTML = keys.length ? '<table class="tbl"><thead><tr><th>Market</th><th>Won</th><th>Lost</th><th>Hit rate</th></tr></thead><tbody>' + keys.map(function (k) {
        var m = mk[k], t = m.w + m.l; return "<tr><td>" + esc(k) + "</td><td>" + m.w + "</td><td>" + m.l + "</td><td><b>" + Math.round(m.w / t * 100) + "%</b></td></tr>";
      }).join("") + "</tbody></table>" : empty("No data yet.");
      $("report-list-note").textContent = "(last 7 days)";
      $("report-list").innerHTML = picks.length ? '<div class="list">' + picks.map(reportRow).join("") + "</div>" : empty("No graded picks in the last 7 days.");
      var ts = ten && ten.summary;
      $("report-tennis-kpis").innerHTML = kpi(ts ? ts.total : 0, "graded") + kpi(ts ? ts.won : 0, "won", "win") + kpi(ts ? ts.lost : 0, "lost", "loss") + kpi(ts && ts.total ? ts.accuracy + "%" : "—", "hit rate", "accent");
      var tp = (ten && ten.picks) || [];
      $("report-tennis-list").innerHTML = tp.length ? '<div class="list">' + tp.slice().reverse().map(function (p) {
        return '<div class="lrow"><div><b>' + esc(p.pick) + '</b> <span class="muted">· ' + esc(p.match) + '</span><div class="muted small">' + esc(p.date) + " · " + esc(p.tournament || "") + '</div></div><div class="lrow-r"><span class="prob-s">' + esc(p.probability) + "%</span>" + resultBadge(p.result) + "</div></div>";
      }).join("") + "</div>" : empty("No graded tennis picks yet.");
    }).catch(function (e) { fail($("report-bars"), e); });
  }
  function reportRow(p) {
    return '<div class="lrow"><div><b>' + esc(p.market) + '</b> <span class="muted">· ' + esc(p.match) + '</span><div class="muted small">' + fmtDay(p.kickoff) + " · " + esc(p.league || "") + (p.ft ? " · FT " + esc(p.ft) : "") + '</div></div><div class="lrow-r"><span class="prob-s">' + esc(p.probability) + "%</span>" + resultBadge(p.result) + "</div></div>";
  }

  /* ================= ARCHIVE ================= */
  var A = { day: romeDate(-1), days: [] };
  loaders.archive = function (q) {
    var m = /date=(\d{4}-\d{2}-\d{2})/.exec(q || ""); if (m) A.day = m[1];
    var inp = $("archive-date"); inp.max = romeDate(1); inp.value = A.day;
    inp.onchange = function () { if (inp.value) { A.day = inp.value; loadArchive(); } };
    $("archive-prev").onclick = function () { A.day = shiftDate(A.day, -1); inp.value = A.day; loadArchive(); };
    $("archive-next").onclick = function () { if (A.day < romeDate(1)) { A.day = shiftDate(A.day, 1); inp.value = A.day; loadArchive(); } };
    get("/history", 300000).then(function (h) {
      A.days = h.days || [];
      var box = $("archive-days");
      box.innerHTML = A.days.slice(0, 30).map(function (d) { return '<button class="chip' + (d === A.day ? " on" : "") + '" data-d="' + d + '">' + fmtDay(d) + "</button>"; }).join("");
      box.onclick = function (e) { var b = e.target.closest ? e.target.closest("[data-d]") : null; if (!b) return; A.day = b.getAttribute("data-d"); inp.value = A.day; loadArchive(); };
    }).catch(function () {});
    loadArchive();
  };
  function loadArchive() {
    var chips = document.querySelectorAll("#archive-days .chip");
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle("on", chips[i].getAttribute("data-d") === A.day);
    var pb = $("archive-picks"), mb = $("archive-matches"); loading(pb); loading(mb);
    Promise.all([get("/history?date=" + A.day), get("/tennis?date=" + A.day + "&exact=1").catch(function () { return {}; })]).then(function (r) {
      var h = r[0] || {}, t = r[1] || {};
      var fx = sortFx(h.fixtures || []), picks = h.picks || [], tp = (t.date === A.day && t.picks) || [];
      var won = picks.filter(function (p) { return p.result === true; }).length, lost = picks.filter(function (p) { return p.result === false; }).length;
      var tw = tp.filter(function (p) { return p.result === true; }).length, tl = tp.filter(function (p) { return p.result === false; }).length;
      $("archive-kpis").innerHTML = kpi(fx.length, "matches") + kpi(picks.length, "football picks") + kpi(picks.length ? won + " / " + lost : "—", "won / lost") + kpi(tp.length ? tw + " / " + tl : "—", "tennis won / lost");
      var html = "";
      if (picks.length) html += '<div class="list">' + picks.sort(function (a, b) { return new Date(a.kickoff) - new Date(b.kickoff); }).map(function (p) {
        return '<div class="lrow" data-fid="' + esc(p.af_id) + '" role="button" tabindex="0"><div><b>' + esc(p.market) + '</b> <span class="muted">· ' + esc(p.match) + '</span><div class="muted small">' + fmtTime(p.kickoff) + " · " + esc(p.league || "") + (p.ft ? " · FT " + esc(p.ft) : "") + '</div></div><div class="lrow-r"><span class="prob-s">' + esc(p.probability) + "%</span>" + resultBadge(p.void ? "void" : p.result) + "</div></div>";
      }).join("") + "</div>";
      if (tp.length) html += '<h3 class="mini-title">🎾 Tennis</h3><div class="cards">' + tp.map(tennisCard).join("") + "</div>";
      pb.innerHTML = html || empty("No picks were published on " + fmtDay(A.day, true) + ".");
      bindMatchRows(pb, A.day);
      mb.innerHTML = fx.length ? groupByLeague(fx, matchRow) : empty(h.status === "no_data" ? "No data stored for this day." : "No matches.");
      bindMatchRows(mb, A.day);
    }).catch(function (e) { fail(pb, e); mb.innerHTML = ""; });
  }

  /* ================= MATCH DETAIL (modal) ================= */
  function openMatch(day, fid) {
    var body = $("modal-body"); loading(body); showModal(true);
    var days = [day, shiftDate(day, -1), shiftDate(day, 1)];
    (function tryDay(i) {
      if (i >= days.length) { body.innerHTML = empty("Match not found."); return; }
      get("/history?date=" + days[i]).then(function (h) {
        var f = (h.fixtures || []).filter(function (x) { return String(x.fixture.id) === String(fid); })[0];
        if (!f) return tryDay(i + 1);
        var picks = (h.picks || []).filter(function (p) { return String(p.af_id) === String(fid); });
        var ranked = (h.ranked_predictions || []).filter(function (p) { return String(p.fixture_id) === String(fid); });
        body.innerHTML = matchDetail(f, picks, ranked);
      }).catch(function () { tryDay(i + 1); });
    })(0);
  }
  function matchDetail(f, picks, ranked) {
    var st = stateOf(f), ht = f.score && f.score.halftime, s = f.fixture.status;
    var head = '<div class="md-league">' + logo(f.league.logo, "llogo") + esc(f.league.country) + " · " + esc(f.league.name) + (f.league.round ? " · " + esc(f.league.round) : "") + "</div>" +
      '<div class="md-score"><div class="md-team">' + logo(f.teams.home.logo, "mlogo") + '<span id="modal-title">' + esc(f.teams.home.name) + "</span></div>" +
      '<div class="md-mid">' + (st === "ns" ? '<div class="md-time">' + fmtTime(f.fixture.date) + "</div>" : '<div class="md-goals">' + scoreText(f) + "</div>") +
      (st === "ns" ? "" : "<div>" + statusBadge(f) + "</div>") + (ht && ht.home != null && st !== "ns" ? '<div class="muted small">HT ' + ht.home + " – " + ht.away + "</div>" : "") + "</div>" +
      '<div class="md-team">' + logo(f.teams.away.logo, "mlogo") + "<span>" + esc(f.teams.away.name) + "</span></div></div>" +
      '<div class="muted small center">' + fmtDay(f.fixture.date, true) + " · " + fmtTime(f.fixture.date) + " (Italian time) · " + esc(s.long || "") + "</div>";
    var model = f.predictions ? '<div class="md-model">' + confTag(f.confidence) +
      (f.lambda ? '<span class="tag">Expected goals ' + f.lambda.home + " – " + f.lambda.away + "</span>" : "") +
      (f.sigma != null ? '<span class="tag">Dispersion σ ' + f.sigma + "</span>" : "") + "</div>" : "";
    var pk = "";
    if (picks.length || ranked.length) {
      var rows = picks.length ? picks.map(function (p) { return '<div class="lrow"><div><b>' + esc(p.market) + "</b> · Top Pick (frozen " + fmtTime(p.created_at) + ')</div><div class="lrow-r"><span class="prob-s">' + p.probability + "%</span>" + resultBadge(p.void ? "void" : p.result) + "</div></div>"; })
        : ranked.map(function (p) { return '<div class="lrow"><div><b>' + esc(p.market) + '</b> · Top Pick</div><div class="lrow-r"><span class="prob-s">' + p.value + "%</span></div></div>"; });
      pk = '<h3 class="mini-title">Top Picks for this match</h3><div class="list">' + rows.join("") + "</div>";
    }
    return head + model + '<h3 class="mini-title">All markets</h3>' + marketsGrid(f) + pk;
  }
  function showModal(on) {
    var m = $("modal"); m.hidden = !on; document.body.classList.toggle("noscroll", on);
  }

  /* ---------- shared list helpers ---------- */
  var ORDER = ["World", "Europe", "England", "Spain", "Italy", "Germany", "France", "Portugal", "Netherlands", "Belgium", "Turkey", "Scotland", "Saudi-Arabia"];
  function sortFx(fx) {
    return fx.slice().sort(function (a, b) {
      var ia = ORDER.indexOf(a.league.country), ib = ORDER.indexOf(b.league.country);
      ia = ia < 0 ? 99 : ia; ib = ib < 0 ? 99 : ib;
      if (ia !== ib) return ia - ib;
      if (a.league.id !== b.league.id) return a.league.id - b.league.id;
      return (a.fixture.timestamp || 0) - (b.fixture.timestamp || 0);
    });
  }
  function groupByLeague(fx, render) {
    var out = "", cur = null;
    fx.forEach(function (f) {
      var k = f.league.id;
      if (k !== cur) {
        if (cur !== null) out += "</div></div>";
        cur = k;
        out += '<div class="league"><div class="league-head">' + logo(f.league.logo, "llogo") + "<span>" + esc(f.league.country) + " · " + esc(f.league.name) + '</span></div><div class="league-body">';
      }
      out += render(f);
    });
    if (cur !== null) out += "</div></div>";
    return out;
  }
  function fillFilters(fx, cId, lId, cb) {
    var c = $(cId), l = $(lId), cv = c.value, lv = l.value, countries = {}, leagues = {};
    fx.forEach(function (f) { countries[f.league.country] = 1; (leagues[f.league.country] = leagues[f.league.country] || {})[f.league.name] = 1; });
    c.innerHTML = '<option value="">All countries</option>' + Object.keys(countries).sort().map(function (x) { return '<option' + (x === cv ? " selected" : "") + ">" + esc(x) + "</option>"; }).join("");
    function fillL() {
      var src = c.value ? leagues[c.value] || {} : fx.reduce(function (o, f) { o[f.league.name] = 1; return o; }, {});
      l.innerHTML = '<option value="">All leagues</option>' + Object.keys(src).sort().map(function (x) { return '<option' + (x === lv ? " selected" : "") + ">" + esc(x) + "</option>"; }).join("");
    }
    fillL();
    c.onchange = function () { lv = ""; fillL(); cb(); };
    l.onchange = function () { lv = l.value; cb(); };
  }
  function applyCL(fx, cId, lId) {
    var c = $(cId).value, l = $(lId).value;
    return fx.filter(function (f) { return (!c || f.league.country === c) && (!l || f.league.name === l); });
  }

  /* ---------- chrome: nav, theme, modal, back-to-top ---------- */
  function closeNav() { var n = $("nav"), b = $("nav-toggle"); if (n) n.classList.remove("open"); if (b) b.setAttribute("aria-expanded", "false"); }
  function initChrome() {
    $("year").textContent = new Date().getFullYear();
    $("nav-toggle").addEventListener("click", function (e) {
      e.stopPropagation(); var n = $("nav"), o = !n.classList.contains("open");
      n.classList.toggle("open", o); this.setAttribute("aria-expanded", o ? "true" : "false");
    });
    document.addEventListener("click", function (e) { var n = $("nav"); if (n.classList.contains("open") && !n.contains(e.target)) closeNav(); });
    $("theme-toggle").addEventListener("click", function () {
      var root = document.documentElement, cur = root.getAttribute("data-theme");
      if (!cur) cur = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      var next = cur === "dark" ? "light" : "dark"; root.setAttribute("data-theme", next);
      try { localStorage.setItem("pbp-theme", next); } catch (e) {}
    });
    $("modal-close").addEventListener("click", function () { showModal(false); });
    $("modal").addEventListener("click", function (e) { if (e.target === this) showModal(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { showModal(false); closeNav(); } });
    var top = $("back-to-top");
    window.addEventListener("scroll", function () { top.classList.toggle("show", window.pageYOffset > 400); }, { passive: true });
    top.addEventListener("click", function () { window.scrollTo(0, 0); });
    get("/status", 120000).then(function (s) {
      var t = s.last && (s.last.finished || s.last.started);
      $("api-status").textContent = t ? "Data refreshed " + new Date(t).toLocaleString("en-GB", { timeZone: TZ, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
    }).catch(function () {});
    // auto refresh of the visible view every 2 minutes (live scores)
    setInterval(function () { if (document.hidden || !$("modal").hidden) return; cache = {}; route(true); }, 120000);
  }

  window.addEventListener("hashchange", function () { route(); });
  document.addEventListener("DOMContentLoaded", function () { initChrome(); route(); });
})();
