/* PreBetPro front-end v7 – home a sezioni (top picks, livescore, pronostici, tennis, report) + archivio + metodo; 4 lingue */
(function () {
  "use strict";

  var API = "https://prebetpro-api.vincenzodiguida.workers.dev";
  var TZ = "Europe/Rome";
  var FINAL = ["FT", "AET", "PEN"];
  var LIVE = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT", "SUSP"];
  var VOIDS = ["PST", "CANC", "ABD", "AWD", "WO"];
  var LANGS = ["it", "en", "es", "pt"];
  var cache = {};
  var L = "it", D = {};

  /* ---------- i18n ---------- */
  function T(k) { return (D && D[k] != null) ? D[k] : ((window.PBP_I18N.en || {})[k] || k); }
  function stLabel(s) { return (D.status && D.status[s]) || s; }
  function pickLang(cb) {
    var saved = null; try { saved = localStorage.getItem("pbp-lang"); } catch (e) {}
    if (saved && LANGS.indexOf(saved) >= 0) return cb(saved);
    var navs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]);
    for (var i = 0; i < navs.length; i++) { var c = String(navs[i] || "").slice(0, 2).toLowerCase(); if (LANGS.indexOf(c) >= 0) return cb(c); }
    fetch(API + "/geo").then(function (r) { return r.json(); }).then(function (g) {
      var c = (g && g.country) || "";
      var ES = "ES MX AR CO CL PE VE EC GT CU BO DO HN PY SV NI CR PA UY PR GQ".split(" "), PT = "BR PT AO MZ CV GW ST TL".split(" ");
      cb(c === "IT" || c === "SM" || c === "VA" ? "it" : ES.indexOf(c) >= 0 ? "es" : PT.indexOf(c) >= 0 ? "pt" : "en");
    }).catch(function () { cb("en"); });
  }
  function setLang(l, rerender) {
    L = LANGS.indexOf(l) >= 0 ? l : "en"; D = window.PBP_I18N[L];
    document.documentElement.lang = L === "pt" ? "pt-BR" : L;
    $("lang").value = L;
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) els[i].textContent = T(els[i].getAttribute("data-i18n"));
    els = document.querySelectorAll("[data-i18n-ph]");
    for (i = 0; i < els.length; i++) els[i].setAttribute("placeholder", T(els[i].getAttribute("data-i18n-ph")));
    $("method-body").innerHTML = T("method_html");
    document.title = "PreBetPro – " + T("tagline");
    if (rerender) loadAll(true);
  }
  function loc() { return D._locale || "en-GB"; }

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function romeDate(offset) {
    var d = new Date(Date.now() + (offset || 0) * 864e5);
    try {
      var p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d), o = {};
      p.forEach(function (x) { o[x.type] = x.value; }); return o.year + "-" + o.month + "-" + o.day;
    } catch (e) { return d.toISOString().slice(0, 10); }
  }
  function shiftDate(iso, n) { var d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function fmtTime(iso) { if (!iso) return ""; try { return new Date(iso).toLocaleTimeString(loc(), { hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; } }
  function fmtDay(iso, long) {
    var d = new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso);
    try { return d.toLocaleDateString(loc(), long ? { weekday: "long", day: "numeric", month: "long" } : { weekday: "short", day: "2-digit", month: "short" }); } catch (e) { return iso.slice(0, 10); }
  }
  function dayLabel(iso) { return iso === romeDate(0) ? T("today") : iso === romeDate(-1) ? T("yesterday") : iso === romeDate(1) ? T("tomorrow") : fmtDay(iso); }
  function get(path, ttl) {
    var now = Date.now(), c = cache[path];
    if (c && now - c.t < (ttl || 60000)) return c.p;
    var p = fetch(API + path).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
    cache[path] = { t: now, p: p }; p.catch(function () { delete cache[path]; }); return p;
  }
  function stateOf(f) { var s = f.fixture.status.short; return FINAL.indexOf(s) >= 0 ? "ft" : LIVE.indexOf(s) >= 0 ? "live" : VOIDS.indexOf(s) >= 0 ? "void" : "ns"; }
  function statusBadge(f) {
    var st = stateOf(f), s = f.fixture.status;
    if (st === "live") return '<span class="badge live"><i class="dot"></i>' + (s.short === "HT" ? "HT" : s.elapsed != null ? s.elapsed + "'" : "LIVE") + "</span>";
    if (st === "ft") return '<span class="badge ft">' + esc(s.short) + "</span>";
    if (st === "void") return '<span class="badge void" title="' + esc(stLabel(s.short)) + '">' + esc(s.short) + "</span>";
    return '<span class="badge ns">' + fmtTime(f.fixture.date) + "</span>";
  }
  function resultBadge(r) {
    if (r === true) return '<span class="badge win">' + T("win") + "</span>";
    if (r === false) return '<span class="badge loss">' + T("loss") + "</span>";
    if (r === "void") return '<span class="badge void">' + T("void") + "</span>";
    return '<span class="badge pending">' + T("pending") + "</span>";
  }
  function empty(msg) { return '<div class="empty">' + msg + "</div>"; }
  function loading(el) { if (el && !el.getAttribute("data-loaded")) el.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>'; }
  function fail(el, err) { if (el) el.innerHTML = empty(T("unavailable")); if (err && window.console) console.error(err); }
  function logo(src, cls) { return src ? '<img class="' + cls + '" src="' + esc(src) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : ""; }
  function kpi(v, l, cls) { return '<div class="kpi ' + (cls || "") + '"><b>' + v + "</b><span>" + l + "</span></div>"; }
  function mkName(m) { return m === "Goal" ? T("m_goal") : m === "No Goal" ? T("m_nogoal") : m; }

  /* ---------- mercati ---------- */
  var GROUPS = [
    { t: "g_1x2", items: [["1", "home_win", "home_win"], ["X", "draw", "draw"], ["2", "away_win", "away_win"]] },
    { t: "g_dc", items: [["1X", "double_chance.1x", "dc_1x"], ["X2", "double_chance.x2", "dc_x2"], ["12", "double_chance.12", "dc_12"]] },
    { t: "g_goals", items: [["O 1.5", "over_15", "over_15"], ["U 1.5", "under_15", null], ["O 2.5", "over_25", "over_25"], ["U 2.5", "under_25", "under_25"]] },
    { t: "g_btts", items: [["GG", "btts", "btts"], ["NG", "no_btts", "no_btts"]] }
  ];
  function val(p, path) { return path.split(".").reduce(function (o, k) { return o ? o[k] : null; }, p); }
  function hit(key, h, a) { return { home_win: h > a, draw: h === a, away_win: a > h, dc_1x: h >= a, dc_x2: a >= h, dc_12: h !== a, over_15: h + a > 1, under_15: h + a < 2, over_25: h + a > 2, under_25: h + a < 3, btts: h > 0 && a > 0, no_btts: !(h > 0 && a > 0) }[key]; }
  function confTag(c) { return c ? '<span class="tag conf-' + esc(c) + '">' + T("conf_" + c) + "</span>" : ""; }
  function marketsGrid(f, only) {
    var p = f.predictions;
    if (!p) return '<div class="muted small">' + T("min8") + "</div>";
    var st = stateOf(f), h = f.goals && f.goals.home, a = f.goals && f.goals.away;
    return '<div class="mk-grid">' + GROUPS.map(function (g, gi) {
      if (only !== "" && only != null && String(gi) !== String(only)) return "";
      return '<div class="mk-group"><div class="mk-title">' + T(g.t) + '</div><div class="mk-row">' + g.items.map(function (it) {
        var v = val(p, it[1]), strong = it[2] && p.strength && p.strength[it[2]], cls = "mk" + (strong ? " strong" : "");
        if (st === "ft" && h != null) cls += hit(it[2] || "under_15", h, a) ? " ok" : " ko";
        return '<div class="' + cls + '"><span>' + it[0] + "</span><b>" + (v == null ? "—" : v + "%") + "</b></div>";
      }).join("") + "</div></div>";
    }).join("") + "</div>";
  }
  function topMarkets(f) {
    var p = f.predictions; if (!p) return [];
    return [["1", p.home_win, "home_win"], ["X", p.draw, "draw"], ["2", p.away_win, "away_win"], ["O 2.5", p.over_25, "over_25"], ["U 2.5", p.under_25, "under_25"], ["GG", p.btts, "btts"]]
      .filter(function (m) { return m[1] != null; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 3)
      .map(function (m) { return { l: m[0], v: m[1], s: p.strength && p.strength[m[2]] }; });
  }

  /* ---------- selettore giorno ---------- */
  function daySeg(el, offsets, current, onPick) {
    el.innerHTML = offsets.map(function (o) { var d = romeDate(o); return '<button type="button" data-d="' + d + '" class="' + (d === current ? "on" : "") + '">' + dayLabel(d) + "</button>"; }).join("");
    el.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("button") : null; if (!b) return;
      var bs = el.querySelectorAll("button"); for (var i = 0; i < bs.length; i++) bs[i].classList.toggle("on", bs[i] === b);
      onPick(b.getAttribute("data-d"));
    };
  }

  /* ================= TOP PICKS ================= */
  function loadPicks() {
    var today = romeDate(0), fb = $("picks-football"), tn = $("picks-tennis");
    loading(fb);
    Promise.all([
      get("/history?date=" + today).catch(function () { return {}; }),
      get("/day?date=" + romeDate(1)).catch(function () { return {}; }),
      get("/report/summary?range=30", 300000).catch(function () { return null; }),
      get("/tennis?date=" + today).catch(function () { return {}; })
    ]).then(function (r) {
      var hist = r[0] || {}, tom = r[1] || {}, rep = r[2], ten = r[3] || {}, seen = {}, rows = [];
      (hist.picks || []).forEach(function (p) {
        seen[p.af_id + ":" + p.market] = 1;
        rows.push({ match: p.match, league: p.league, kickoff: p.kickoff, market: p.market, value: p.probability, result: p.void ? "void" : p.result, ft: p.ft, frozen: true, fid: p.af_id, day: today });
      });
      (hist.ranked_predictions || []).forEach(function (p) {
        if (seen[p.fixture_id + ":" + p.market]) return; seen[p.fixture_id + ":" + p.market] = 1;
        rows.push({ match: p.match, league: p.league, kickoff: p.kickoff, market: p.market, value: p.value, fid: p.fixture_id, day: today });
      });
      var nToday = rows.length;
      if (nToday < 5) (tom.ranked_predictions || []).forEach(function (p) { rows.push({ match: p.match, league: p.league, kickoff: p.kickoff, market: p.market, value: p.value, fid: p.fixture_id, day: romeDate(1) }); });
      rows.sort(function (a, b) { return new Date(a.kickoff) - new Date(b.kickoff) || b.value - a.value; });
      var fx = hist.fixtures || [], s = rep && rep.summary;
      $("picks-kpis").innerHTML = kpi(fx.length, T("k_matches")) + kpi(fx.filter(function (f) { return stateOf(f) === "live"; }).length, T("k_live"), "live") +
        kpi(nToday, T("k_picks_today")) + kpi(s && s.total ? s.accuracy + "%" : "—", T("k_hit30") + (s && s.total ? " (" + s.won + "/" + s.total + ")" : ""), "accent");
      fb.innerHTML = rows.length ? rows.map(pickCard).join("") : empty(T("picks_none"));
      fb.setAttribute("data-loaded", "1");
      fb.onclick = function (e) { var c = e.target.closest ? e.target.closest("[data-fid]") : null; if (c) goToMatch(c.getAttribute("data-day"), c.getAttribute("data-fid")); };
      var tp = (ten.date === today && ten.picks) || [];
      tn.innerHTML = tp.length ? tp.map(tennisCard).join("") : "";
    }).catch(function (e) { fail(fb, e); });
  }
  function pickCard(p) {
    var badge = p.frozen ? resultBadge(p.result) : '<span class="badge ns">' + (p.day === romeDate(0) ? "" : dayLabel(p.day) + " ") + fmtTime(p.kickoff) + "</span>";
    return '<div class="card pick' + (p.result === true ? " is-win" : p.result === false ? " is-loss" : "") + '" data-fid="' + esc(p.fid) + '" data-day="' + esc(p.day) + '" role="button" tabindex="0">' +
      '<div class="card-top"><span class="muted small ellipsis">' + esc(p.league || "") + "</span>" + badge + "</div>" +
      '<div class="card-match">' + esc(p.match) + "</div>" +
      '<div class="card-pick"><span class="market">' + esc(mkName(p.market)) + '</span><span class="prob">' + esc(p.value) + "%</span></div>" +
      '<div class="meter"><i style="width:' + Math.max(0, Math.min(100, +p.value || 0)) + '%"></i></div>' +
      '<div class="muted small">' + fmtDay(p.kickoff) + " · " + fmtTime(p.kickoff) + (p.ft ? " · FT " + esc(p.ft) : "") + "</div></div>";
  }
  function tennisCard(p) {
    var badge = p.result === true || p.result === false || p.result === "void" ? resultBadge(p.result) : '<span class="badge ns">' + esc(p.start ? fmtTime(p.start) : (p.time || "")) + "</span>";
    return '<div class="card pick tennis' + (p.result === true ? " is-win" : p.result === false ? " is-loss" : "") + '">' +
      '<div class="card-top"><span class="muted small ellipsis">🎾 ' + esc(p.tournament || "") + "</span>" + badge + "</div>" +
      '<div class="card-match">' + esc(p.match) + "</div>" +
      '<div class="card-pick"><span class="market">' + esc(p.pick) + " " + T("to_win") + '</span><span class="prob">' + esc(p.probability) + "%</span></div>" +
      '<div class="meter"><i style="width:' + Math.max(0, Math.min(100, +p.probability || 0)) + '%"></i></div>' +
      '<div class="odds"><span>' + T("fair") + " <b>" + Number(p.fair_odds).toFixed(2) + "</b></span><span>" + T("min_odds") + " <b>" + Number(p.min_odds).toFixed(2) + "</b></span></div>" +
      (p.score ? '<div class="muted small">' + T("score") + ": " + esc(p.score) + "</div>" : "") + "</div>";
  }

  /* ================= PARTITE (LIVESCORE) ================= */
  var M = { day: romeDate(0), fixtures: [], open: {}, det: {}, col: {} };
  function loadLive(silent) {
    var list = $("live-list"); if (!silent) loading(list);
    var day = M.day;
    get("/day?date=" + day).then(function (d) {
      if (day !== M.day) return;
      M.fixtures = sortFx(d.fixtures || []); M.updated = d.updated;
      fillFilters(M.fixtures, "m-country", "m-league", renderLive);
      renderLive();
      var anyOpen = Object.keys(M.open).some(function (k) { return M.open[k]; });
      if (anyOpen) loadDetails(day, true);
    }).catch(function (e) { fail(list, e); });
  }
  function renderLive() {
    var fx = applyCL(M.fixtures, "m-country", "m-league"), st = $("m-status").value, q = $("m-search").value.trim().toLowerCase();
    if (st) fx = fx.filter(function (f) { return stateOf(f) === st; });
    if (q) fx = fx.filter(function (f) { return (f.teams.home.name + " " + f.teams.away.name).toLowerCase().indexOf(q) >= 0; });
    var all = M.fixtures;
    $("live-kpis").innerHTML = kpi(all.length, T("k_matches")) + kpi(all.filter(function (f) { return stateOf(f) === "live"; }).length, T("k_live"), "live") +
      kpi(all.filter(function (f) { return stateOf(f) === "ft"; }).length, T("k_ft")) + kpi(all.filter(function (f) { return f.predictions; }).length, T("k_pred"));
    $("live-updated").textContent = M.updated ? T("updated_at") + " " + fmtTime(M.updated) + " · " + T("next_update") : "";
    var lst = $("live-list");
    lst.innerHTML = fx.length ? groupByLeague(fx, liveRow, M.col) : empty(all.length ? T("no_matches") : T("no_data"));
    lst.setAttribute("data-loaded", "1");
    lst.onclick = function (e) {
      if (toggleLeague(e, M.col)) return;
      var r = e.target.closest ? e.target.closest(".mrow") : null; if (!r) return;
      var id = r.getAttribute("data-fid"); M.open[id] = !M.open[id];
      var box = $("det-" + id); r.classList.toggle("open", !!M.open[id]);
      if (box) { box.hidden = !M.open[id]; if (M.open[id]) { box.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>'; loadDetails(M.day); } }
    };
  }
  function liveRow(f) {
    var tm = topMarkets(f), st = stateOf(f), id = f.fixture.id, open = !!M.open[id];
    var ht = f.score && f.score.halftime;
    return '<div class="mrow' + (st === "live" ? " is-live" : "") + (open ? " open" : "") + '" data-fid="' + id + '" role="button" tabindex="0">' +
      '<div class="mrow-status">' + statusBadge(f) + "</div>" +
      '<div class="mrow-teams"><div class="team">' + logo(f.teams.home.logo, "tlogo") + "<span>" + esc(f.teams.home.name) + "</span><b>" + (st !== "ns" && f.goals.home != null ? f.goals.home : "") + "</b></div>" +
      '<div class="team">' + logo(f.teams.away.logo, "tlogo") + "<span>" + esc(f.teams.away.name) + "</span><b>" + (st !== "ns" && f.goals.away != null ? f.goals.away : "") + "</b></div>" +
      (st !== "ns" && ht && ht.home != null ? '<div class="ht">HT ' + ht.home + "-" + ht.away + "</div>" : "") + "</div>" +
      '<div class="mrow-mk">' + (tm.length ? tm.map(function (m) { return '<span class="pill' + (m.s ? " strong" : "") + '">' + m.l + " <b>" + m.v + "%</b></span>"; }).join("") : '<span class="muted small">' + T("no_prediction") + "</span>") + "</div>" +
      '<div class="mrow-go" aria-hidden="true">⌄</div></div>' +
      '<div class="mdet" id="det-' + id + '"' + (open ? "" : " hidden") + ">" + (open ? detailHtml(f, M.det[M.day] && M.det[M.day][id]) : "") + "</div>";
  }
  function loadDetails(day, quiet) {
    get("/details?date=" + day, 60000).then(function (all) {
      M.det[day] = all || {};
      Object.keys(M.open).forEach(function (id) {
        if (!M.open[id]) return; var box = $("det-" + id); if (!box) return;
        var f = M.fixtures.filter(function (x) { return String(x.fixture.id) === String(id); })[0];
        if (f) box.innerHTML = detailHtml(f, M.det[day][id]);
      });
    }).catch(function () {
      Object.keys(M.open).forEach(function (id) { var box = $("det-" + id), f = M.fixtures.filter(function (x) { return String(x.fixture.id) === String(id); })[0]; if (box && f) box.innerHTML = detailHtml(f, null); });
    });
  }
  function detailHtml(f, d) {
    d = d || {};
    var st = stateOf(f), hid = f.teams.home.id, venue = d.venue || f.fixture.venue, ref = d.referee || f.fixture.referee;
    var out = '<div class="det-grid">';
    // info
    out += '<div class="det-box"><h4>' + T("match_info") + "</h4>" +
      '<div class="kv"><span>' + T("kickoff") + "</span><b>" + fmtDay(f.fixture.date, true) + " · " + fmtTime(f.fixture.date) + "</b></div>" +
      (venue && venue.name ? '<div class="kv"><span>' + T("venue") + "</span><b>" + esc(venue.name) + (venue.city ? " (" + esc(venue.city) + ")" : "") + "</b></div>" : "") +
      (ref ? '<div class="kv"><span>' + T("referee") + "</span><b>" + esc(ref) + "</b></div>" : "") +
      '<div class="kv"><span>' + esc(f.league.round || "") + "</span><b>" + esc(stLabel(f.fixture.status.short)) + "</b></div>" + "</div>";
    // modello
    out += '<div class="det-box"><h4>' + T("model") + "</h4>" + (f.predictions ? '<div class="tags">' + confTag(f.confidence) +
      (f.lambda ? '<span class="tag">' + T("xg") + " " + f.lambda.home + " – " + f.lambda.away + "</span>" : "") +
      (f.sigma != null ? '<span class="tag">' + T("sigma") + " " + f.sigma + "</span>" : "") + "</div>" : "") + marketsGrid(f) + "</div>";
    // cronaca
    var ev = d.events || [];
    if (ev.length) {
      out += '<div class="det-box wide"><h4>' + T("timeline") + '</h4><div class="tl">' + ev.map(function (e) {
        var home = e[2] === hid, type = e[5], det = e[6] || "", ico = "•", txt = esc(e[3]);
        if (type === "Goal") { ico = det === "Missed Penalty" ? "❌" : "⚽"; if (det === "Own Goal") txt += " <i>(" + T("ev_own") + ")</i>"; else if (det === "Penalty") txt += " <i>(" + T("ev_pen") + ")</i>"; else if (det === "Missed Penalty") txt += " <i>(" + T("ev_miss") + ")</i>"; if (e[4] && det !== "Missed Penalty") txt += ' <span class="muted">(' + esc(e[4]) + ")</span>"; }
        else if (type === "Card") ico = /red|second/i.test(det) ? "🟥" : "🟨";
        else if (type === "subst") { ico = "🔁"; txt = esc(e[3]) + (e[4] ? " ⇄ " + esc(e[4]) : ""); }
        else if (type === "Var") { ico = "📺"; txt = "VAR · " + esc(det) + (e[3] ? " – " + esc(e[3]) : ""); }
        var min = (e[0] != null ? e[0] : "") + (e[1] ? "+" + e[1] : "") + "'";
        return '<div class="tl-row ' + (home ? "h" : "a") + '"><span class="tl-min">' + min + '</span><span class="tl-ico">' + ico + '</span><span class="tl-txt">' + txt + "</span></div>";
      }).join("") + "</div></div>";
    }
    // formazioni
    var lu = d.lineups || [];
    if (lu.length) {
      out += '<div class="det-box wide"><h4>' + T("lineups") + '</h4><div class="lu">' + lu.map(function (l) {
        var name = l.team === hid ? f.teams.home.name : f.teams.away.name;
        return '<div class="lu-team"><div class="lu-head"><b>' + esc(name) + "</b>" + (l.formation ? ' <span class="tag">' + esc(l.formation) + "</span>" : "") + "</div>" +
          (l.coach ? '<div class="muted small">' + T("coach") + ": " + esc(l.coach) + "</div>" : "") +
          '<ol class="lu-xi">' + (l.xi || []).map(function (p) { return "<li><span>" + (p[0] != null ? p[0] : "") + "</span>" + esc(p[1]) + ' <em>' + esc(p[2]) + "</em></li>"; }).join("") + "</ol>" +
          ((l.subs || []).length ? '<details><summary>' + T("subs") + " (" + l.subs.length + ')</summary><ol class="lu-xi">' + l.subs.map(function (p) { return "<li><span>" + (p[0] != null ? p[0] : "") + "</span>" + esc(p[1]) + ' <em>' + esc(p[2]) + "</em></li>"; }).join("") + "</ol></details>" : "") + "</div>";
      }).join("") + "</div></div>";
    }
    // statistiche
    var sts = d.stats || [];
    if (sts.length === 2) {
      var sh = sts[0].team === hid ? sts[0].v : sts[1].v, sa = sts[0].team === hid ? sts[1].v : sts[0].v;
      var rows = [["Ball Possession", "s_poss"], ["Total Shots", "s_shots"], ["Shots on Goal", "s_shots_on"], ["expected_goals", "s_xg"], ["Corner Kicks", "s_corners"], ["Fouls", "s_fouls"], ["Offsides", "s_off"], ["Yellow Cards", "s_yc"], ["Red Cards", "s_rc"], ["Goalkeeper Saves", "s_saves"]];
      out += '<div class="det-box wide"><h4>' + T("stats") + "</h4>" + rows.map(function (r) {
        var a = sh[r[0]], b = sa[r[0]]; if (a == null && b == null) return "";
        var na = parseFloat(a) || 0, nb = parseFloat(b) || 0, tot = na + nb || 1;
        return '<div class="stat"><span class="sv">' + esc(a == null ? 0 : a) + '</span><div class="sbar"><div class="sl"><i style="width:' + (na / tot * 100) + '%"></i></div><em>' + T(r[1]) + '</em><div class="sr"><i style="width:' + (nb / tot * 100) + '%"></i></div></div><span class="sv">' + esc(b == null ? 0 : b) + "</span></div>";
      }).join("") + "</div>";
    }
    if (!ev.length && !lu.length) out += '<div class="det-box wide muted small">' + (st === "ft" ? T("no_details") + " " : "") + T("events_after") + "</div>";
    return out + "</div>";
  }
  function goToMatch(day, fid) {
    if (day !== M.day) { M.day = day; daySeg($("live-day"), [-1, 0, 1], M.day, function (d) { M.day = d; M.open = {}; loadLive(); }); }
    M.open[fid] = true; $("m-country").value = ""; $("m-league").value = ""; $("m-status").value = ""; $("m-search").value = "";
    loadLive(true);
    setTimeout(function () { var r = document.querySelector('.mrow[data-fid="' + fid + '"]'); if (r) r.scrollIntoView({ block: "center" }); loadDetails(day); }, 500);
  }

  /* ================= PRONOSTICI ================= */
  var P = { day: romeDate(0), fixtures: [], col: {}, mobile: window.innerWidth < 760 };
  function loadPred() {
    var list = $("pred-list"); loading(list); var day = P.day;
    get("/day?date=" + day).then(function (d) {
      if (day !== P.day) return;
      P.fixtures = sortFx(d.fixtures || []);
      if (P.mobile) P.fixtures.forEach(function (f) { if (P.col[f.league.id] == null) P.col[f.league.id] = true; });
      fillFilters(P.fixtures, "p-country", "p-league", renderPred); renderPred();
    }).catch(function (e) { fail(list, e); });
  }
  function renderPred() {
    var fx = applyCL(P.fixtures, "p-country", "p-league").filter(function (f) { return f.predictions; });
    var c = $("p-conf").value, strong = $("p-strong").checked, mk = $("p-market").value;
    if (c === "high") fx = fx.filter(function (f) { return f.confidence === "high"; });
    if (c === "medium") fx = fx.filter(function (f) { return f.confidence !== "low"; });
    if (strong) fx = fx.filter(function (f) { var s = f.predictions.strength; return s && Object.keys(s).some(function (k) { return s[k]; }); });
    var none = P.fixtures.filter(function (f) { return !f.predictions; }).length;
    var lst = $("pred-list");
    lst.innerHTML = (fx.length ? groupByLeague(fx, function (f) {
      return '<div class="pcard"><div class="pcard-head"><div><b>' + esc(f.teams.home.name) + "</b> – <b>" + esc(f.teams.away.name) + "</b>" +
        (stateOf(f) !== "ns" && f.goals.home != null ? ' <span class="score">' + f.goals.home + "-" + f.goals.away + "</span>" : "") + '</div><div class="pcard-meta">' + statusBadge(f) + confTag(f.confidence) + "</div></div>" + marketsGrid(f, mk) + "</div>";
    }, P.col) : empty(T("no_pred"))) + (none ? '<p class="muted small center">' + none + " " + T("without_pred") + "</p>" : "");
    lst.setAttribute("data-loaded", "1");
    lst.onclick = function (e) { toggleLeague(e, P.col); };
  }

  /* ================= TENNIS ================= */
  var TN = { day: romeDate(0) };
  function loadTennis() {
    var list = $("tennis-list"); loading(list); var day = TN.day;
    Promise.all([get("/tennis?date=" + day + "&exact=1").catch(function () { return {}; }), get("/tennis/report", 300000).catch(function () { return null; })]).then(function (r) {
      if (day !== TN.day) return;
      var picks = (r[0] && r[0].date === day && r[0].picks) || [], s = r[1] && r[1].summary;
      $("tennis-kpis").innerHTML = kpi(picks.length, T("k_picks") + " · " + dayLabel(day).toLowerCase()) + kpi(s ? s.total : 0, T("k_graded30")) +
        kpi(s ? s.won + " / " + s.lost : "—", T("k_wl")) + kpi(s && s.total ? s.accuracy + "%" : "—", T("k_hit30"), "accent");
      list.innerHTML = picks.length ? picks.slice().sort(function (a, b) { return String(a.start || a.time).localeCompare(String(b.start || b.time)); }).map(tennisCard).join("") : empty(day === romeDate(0) ? T("tennis_none_today") : T("tennis_none"));
      list.setAttribute("data-loaded", "1");
    }).catch(function (e) { fail(list, e); });
  }

  /* ================= REPORT (struttura originale) ================= */
  function loadReport() {
    var n = +$("report-range").value || 7;
    Promise.all([get("/report/summary?range=" + n, 120000), get("/report?range=" + n, 120000), get("/tennis/report", 300000).catch(function () { return null; })]).then(function (r) {
      var sum = r[0] || {}, rep = r[1] || {}, ten = r[2], s = sum.summary || {};
      var from = romeDate(-(n - 1));
      var picks = (rep.picks || []).filter(function (p) { return String(p.kickoff || "").slice(0, 10) >= from; });
      // 1. riepilogo
      $("report-summary").innerHTML = kpi(s.total || 0, T("r_total")) + kpi(s.won || 0, T("r_won"), "win") + kpi(s.lost || 0, T("r_lost"), "loss") + kpi(s.total ? s.accuracy + "%" : "—", T("r_acc"), "accent");
      // 2. rendimento per mercato
      var mk = {}; picks.forEach(function (p) { var m = mk[p.market] = mk[p.market] || { w: 0, l: 0 }; p.result ? m.w++ : m.l++; });
      var keys = Object.keys(mk).sort(function (a, b) { return (mk[b].w + mk[b].l) - (mk[a].w + mk[a].l); });
      $("report-markets").innerHTML = keys.length ? '<table class="tbl"><thead><tr><th>' + T("r_market") + "</th><th>" + T("r_won") + "</th><th>" + T("r_lost") + "</th><th>" + T("r_acc") + "</th></tr></thead><tbody>" + keys.map(function (k) {
        var m = mk[k], t = m.w + m.l; return "<tr><td>" + esc(mkName(k)) + '</td><td class="c-win">' + m.w + '</td><td class="c-loss">' + m.l + "</td><td><b>" + Math.round(m.w / t * 100) + "%</b></td></tr>";
      }).join("") + "</tbody></table>" : empty(T("r_empty"));
      // 3. grafici
      var days = (sum.by_day || []).filter(function (d) { return d.total; });
      $("chart-acc").innerHTML = days.length ? lineChart(days) : '<div class="muted small">—</div>';
      $("chart-wl").innerHTML = wlChart(s.won || 0, s.lost || 0);
      // 4. elenco pick
      $("report-list").innerHTML = picks.length ? '<div class="list">' + picks.map(function (p) {
        return '<div class="lrow ' + (p.result ? "win" : "loss") + '"><div><b>' + esc(p.match) + '</b><div class="muted small">' + esc(mkName(p.market)) + " · " + esc(p.probability) + "% · " + fmtDay(p.kickoff) + (p.ft ? " · FT " + esc(p.ft) : "") + '</div></div><div class="lrow-r">' + resultBadge(p.result) + "</div></div>";
      }).join("") + "</div>" : empty(T("r_empty"));
      // tennis
      var ts = ten && ten.summary, tp = (ten && ten.picks) || [];
      $("report-tennis-kpis").innerHTML = kpi(ts ? ts.total : 0, T("r_total")) + kpi(ts ? ts.won : 0, T("r_won"), "win") + kpi(ts ? ts.lost : 0, T("r_lost"), "loss") + kpi(ts && ts.total ? ts.accuracy + "%" : "—", T("r_acc"), "accent");
      $("report-tennis-list").innerHTML = tp.length ? '<div class="list">' + tp.slice().reverse().map(function (p) {
        return '<div class="lrow"><div><b>' + esc(p.pick) + '</b> <span class="muted">· ' + esc(p.match) + '</span><div class="muted small">' + esc(p.date) + " · " + esc(p.tournament || "") + '</div></div><div class="lrow-r"><span class="prob-s">' + esc(p.probability) + "%</span>" + resultBadge(p.result) + "</div></div>";
      }).join("") + "</div>" : "";
    }).catch(function (e) { fail($("report-list"), e); });
  }
  function lineChart(days) {
    var W = 320, H = 150, pad = 24, n = days.length;
    var pts = days.map(function (d, i) { var x = n === 1 ? W / 2 : pad + i * (W - 2 * pad) / (n - 1); var y = H - pad - (d.won / d.total) * (H - 2 * pad); return [x, y, Math.round(d.won / d.total * 100), d]; });
    var path = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    return '<svg viewBox="0 0 ' + W + " " + H + '" class="svg-chart" role="img"><line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - pad) + '" y2="' + (H - pad) + '" class="ax"/><line x1="' + pad + '" y1="' + pad + '" x2="' + (W - pad) + '" y2="' + pad + '" class="grid"/>' +
      '<text x="2" y="' + (pad + 4) + '" class="lbl">100%</text><text x="8" y="' + (H - pad + 4) + '" class="lbl">0%</text>' +
      (n > 1 ? '<path d="' + path + '" class="ln"/>' : "") + pts.map(function (p) {
        return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" class="pt"><title>' + p[3].date + ": " + p[3].won + "/" + p[3].total + '</title></circle><text x="' + p[0].toFixed(1) + '" y="' + (H - 6) + '" class="lbl" text-anchor="middle">' + p[3].date.slice(8) + "/" + p[3].date.slice(5, 7) + "</text>";
      }).join("") + "</svg>";
  }
  function wlChart(w, l) {
    var m = Math.max(w, l, 1);
    return '<div class="wl"><div class="wl-col"><div class="wl-bar"><i class="w" style="height:' + (w / m * 100) + '%"></i></div><b>' + w + "</b><span>" + T("r_won") + '</span></div><div class="wl-col"><div class="wl-bar"><i class="l" style="height:' + (l / m * 100) + '%"></i></div><b>' + l + "</b><span>" + T("r_lost") + "</span></div></div>";
  }

  /* ================= ARCHIVIO ================= */
  var A = { day: romeDate(-1), open: {}, col: {} };
  function initArchive() {
    var inp = $("archive-date"); inp.max = romeDate(1); inp.value = A.day;
    inp.onchange = function () { if (inp.value) { A.day = inp.value; loadArchive(); } };
    $("archive-prev").onclick = function () { A.day = shiftDate(A.day, -1); inp.value = A.day; loadArchive(); };
    $("archive-next").onclick = function () { if (A.day < romeDate(1)) { A.day = shiftDate(A.day, 1); inp.value = A.day; loadArchive(); } };
    get("/history", 300000).then(function (h) {
      var box = $("archive-days");
      box.innerHTML = (h.days || []).slice(0, 45).map(function (d) { return '<button type="button" class="chip' + (d === A.day ? " on" : "") + '" data-d="' + d + '">' + fmtDay(d) + "</button>"; }).join("");
      box.onclick = function (e) { var b = e.target.closest ? e.target.closest("[data-d]") : null; if (!b) return; A.day = b.getAttribute("data-d"); inp.value = A.day; loadArchive(); };
    }).catch(function () {});
    loadArchive();
  }
  function loadArchive() {
    var chips = document.querySelectorAll("#archive-days .chip");
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle("on", chips[i].getAttribute("data-d") === A.day);
    var pb = $("archive-picks"), mb = $("archive-matches"); pb.removeAttribute("data-loaded"); mb.removeAttribute("data-loaded"); loading(pb); loading(mb);
    var day = A.day;
    Promise.all([get("/history?date=" + day), get("/tennis?date=" + day + "&exact=1").catch(function () { return {}; }), get("/details?date=" + day, 300000).catch(function () { return {}; })]).then(function (r) {
      if (day !== A.day) return;
      var h = r[0] || {}, t = r[1] || {}, det = r[2] || {};
      var fx = sortFx(h.fixtures || []), picks = h.picks || [], tp = (t.date === day && t.picks) || [];
      var won = picks.filter(function (p) { return p.result === true; }).length, lost = picks.filter(function (p) { return p.result === false; }).length;
      $("archive-kpis").innerHTML = kpi(fx.length, T("k_matches")) + kpi(picks.length, T("top_pick")) + kpi(picks.length ? won + " / " + lost : "—", T("k_wl")) + kpi(tp.length, "🎾 " + T("k_picks"));
      var html = picks.length ? '<div class="list">' + picks.sort(function (a, b) { return new Date(a.kickoff) - new Date(b.kickoff); }).map(function (p) {
        return '<div class="lrow"><div><b>' + esc(mkName(p.market)) + '</b> <span class="muted">· ' + esc(p.match) + '</span><div class="muted small">' + fmtTime(p.kickoff) + " · " + esc(p.league || "") + (p.ft ? " · FT " + esc(p.ft) : "") + '</div></div><div class="lrow-r"><span class="prob-s">' + esc(p.probability) + "%</span>" + resultBadge(p.void ? "void" : p.result) + "</div></div>";
      }).join("") + "</div>" : "";
      if (tp.length) html += '<div class="cards" style="margin-top:12px">' + tp.map(tennisCard).join("") + "</div>";
      pb.innerHTML = html || empty(T("no_picks_day"));
      mb.innerHTML = fx.length ? groupByLeague(fx, function (f) {
        var o = !!A.open[f.fixture.id];
        return liveRow(f).replace('id="det-' + f.fixture.id + '"', 'id="adet-' + f.fixture.id + '"').replace(/class="mdet" id="adet-(\d+)"( hidden)?>/, 'class="mdet" id="adet-$1"' + (o ? "" : " hidden") + ">" + (o ? detailHtml(f, det[f.fixture.id]) : ""));
      }, A.col) : empty(T("no_data"));
      mb.onclick = function (e) {
        if (toggleLeague(e, A.col)) return;
        var row = e.target.closest ? e.target.closest(".mrow") : null; if (!row) return;
        var id = row.getAttribute("data-fid"); A.open[id] = !A.open[id]; row.classList.toggle("open", A.open[id]);
        var box = $("adet-" + id), f = fx.filter(function (x) { return String(x.fixture.id) === id; })[0];
        if (box) { box.hidden = !A.open[id]; if (A.open[id] && f) box.innerHTML = detailHtml(f, det[id]); }
      };
    }).catch(function (e) { fail(pb, e); mb.innerHTML = ""; });
  }

  /* ---------- liste ---------- */
  var ORDER = ["World", "Europe", "Italy", "England", "Spain", "Germany", "France", "Portugal", "Netherlands", "Belgium", "Turkey", "Scotland", "Saudi-Arabia"];
  function sortFx(fx) {
    return fx.slice().sort(function (a, b) {
      var ia = ORDER.indexOf(a.league.country), ib = ORDER.indexOf(b.league.country); ia = ia < 0 ? 99 : ia; ib = ib < 0 ? 99 : ib;
      if (ia !== ib) return ia - ib; if (a.league.id !== b.league.id) return a.league.id - b.league.id;
      return (a.fixture.timestamp || 0) - (b.fixture.timestamp || 0);
    });
  }
  function groupByLeague(fx, render, col) {
    var out = "", cur = null, cnt = {};
    fx.forEach(function (f) { cnt[f.league.id] = (cnt[f.league.id] || 0) + 1; });
    fx.forEach(function (f) {
      if (f.league.id !== cur) {
        if (cur !== null) out += "</div></div>"; cur = f.league.id;
        out += '<div class="league' + (col && col[cur] ? " collapsed" : "") + '"><div class="league-head" data-lid="' + cur + '" role="button" tabindex="0">' + logo(f.league.logo, "llogo") + "<span>" + esc(f.league.country) + " · " + esc(f.league.name) + '</span><em class="lg-n">' + cnt[cur] + '</em><i class="lg-t" aria-hidden="true">⌄</i></div><div class="league-body">';
      }
      out += render(f);
    });
    return out + (cur !== null ? "</div></div>" : "");
  }
  function fillFilters(fx, cId, lId, cb) {
    var c = $(cId), l = $(lId), cv = c.value, lv = l.value, countries = {}, leagues = {};
    fx.forEach(function (f) { countries[f.league.country] = 1; (leagues[f.league.country] = leagues[f.league.country] || {})[f.league.name] = 1; });
    c.innerHTML = '<option value="">' + T("all_countries") + "</option>" + Object.keys(countries).sort().map(function (x) { return "<option" + (x === cv ? " selected" : "") + ">" + esc(x) + "</option>"; }).join("");
    function fillL() {
      var src = c.value ? leagues[c.value] || {} : fx.reduce(function (o, f) { o[f.league.name] = 1; return o; }, {});
      l.innerHTML = '<option value="">' + T("all_leagues") + "</option>" + Object.keys(src).sort().map(function (x) { return "<option" + (x === lv ? " selected" : "") + ">" + esc(x) + "</option>"; }).join("");
    }
    fillL();
    c.onchange = function () { lv = ""; fillL(); cb(); };
    l.onchange = function () { lv = l.value; cb(); };
  }
  function toggleLeague(e, col) {
    var h = e.target.closest ? e.target.closest(".league-head") : null; if (!h) return false;
    var lg = h.parentNode, id = h.getAttribute("data-lid"); lg.classList.toggle("collapsed"); col[id] = lg.classList.contains("collapsed"); return true;
  }
  function applyCL(fx, cId, lId) { var c = $(cId).value, l = $(lId).value; return fx.filter(function (f) { return (!c || f.league.country === c) && (!l || f.league.name === l); }); }

  /* ---------- navigazione ---------- */
  var SECTIONS = ["top-picks", "live", "predictions", "tennis", "report"];
  var archiveReady = false;
  function route() {
    var h = (location.hash || "").slice(1).split("?")[0];
    var view = h === "archive" ? "archive" : h === "method" ? "method" : "home";
    $("view-home").hidden = view !== "home"; $("view-archive").hidden = view !== "archive"; $("view-method").hidden = view !== "method";
    var links = document.querySelectorAll(".nav a");
    for (var i = 0; i < links.length; i++) links[i].classList.toggle("active", links[i].getAttribute("data-go") === (view === "home" ? (h || "top-picks") : view));
    closeNav();
    if (view === "archive" && !archiveReady) { archiveReady = true; initArchive(); }
    if (view === "home" && SECTIONS.indexOf(h) >= 0) { var el = $(h); if (el) setTimeout(function () { el.scrollIntoView(); }, 0); }
    else window.scrollTo(0, 0);
  }
  function closeNav() { $("nav").classList.remove("open"); $("nav-toggle").setAttribute("aria-expanded", "false"); }

  function loadAll(langChange) {
    daySeg($("live-day"), [-1, 0, 1], M.day, function (d) { M.day = d; M.open = {}; $("live-list").removeAttribute("data-loaded"); loadLive(); });
    daySeg($("pred-day"), [0, 1], P.day, function (d) { P.day = d; loadPred(); });
    daySeg($("tennis-day"), [-2, -1, 0, 1], TN.day, function (d) { TN.day = d; loadTennis(); });
    loadPicks(); loadLive(langChange); loadPred(); loadTennis(); loadReport();
    if (archiveReady) loadArchive();
    get("/status", 120000).then(function (s) {
      var t = s.last && (s.last.finished || s.last.started);
      $("api-status").textContent = t ? T("data_ref") + ": " + new Date(t).toLocaleString(loc(), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
    }).catch(function () {});
  }

  function init() {
    $("year").textContent = new Date().getFullYear();
    $("nav-toggle").addEventListener("click", function (e) { e.stopPropagation(); var n = $("nav"), o = !n.classList.contains("open"); n.classList.toggle("open", o); this.setAttribute("aria-expanded", o ? "true" : "false"); });
    document.addEventListener("click", function (e) { var n = $("nav"); if (n.classList.contains("open") && !n.contains(e.target)) closeNav(); });
    $("nav").addEventListener("click", function (e) { var a = e.target.closest ? e.target.closest("a") : null; if (a && location.hash === a.getAttribute("href")) { e.preventDefault(); route(); } });
    $("theme-toggle").addEventListener("click", function () {
      var root = document.documentElement, cur = root.getAttribute("data-theme");
      if (!cur) cur = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      var next = cur === "dark" ? "light" : "dark"; root.setAttribute("data-theme", next); try { localStorage.setItem("pbp-theme", next); } catch (e) {}
    });
    $("lang").addEventListener("change", function () { try { localStorage.setItem("pbp-lang", this.value); } catch (e) {} setLang(this.value, true); });
    ["m-status", "m-search"].forEach(function (id) { $(id).addEventListener(id === "m-search" ? "input" : "change", renderLive); });
    ["p-conf", "p-strong", "p-market"].forEach(function (id) { $(id).addEventListener("change", renderPred); });
    $("report-range").addEventListener("change", loadReport);
    var top = $("back-to-top");
    window.addEventListener("scroll", function () { top.classList.toggle("show", window.pageYOffset > 500); }, { passive: true });
    top.addEventListener("click", function () { window.scrollTo(0, 0); });
    window.addEventListener("hashchange", route);
    pickLang(function (l) { setLang(l, false); loadAll(false); route(); });
    // aggiornamento automatico (i dati cambiano al massimo ogni 15'): partite e top picks ogni 2 minuti, pagina visibile
    setInterval(function () {
      if (document.hidden) return;
      cache = {};
      if (!$("view-home").hidden) { loadPicks(); if (M.day === romeDate(0)) loadLive(true); }
    }, 120000);
  }
  document.addEventListener("DOMContentLoaded", init);
})();
