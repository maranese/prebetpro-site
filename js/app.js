/* PreBetPro front-end v8 – pagine separate (home, pronostici, tennis, report, archivio, metodo), 4 lingue */
(function () {
  "use strict";

  var API = "https://prebetpro-api.vincenzodiguida.workers.dev";
  var TZ = "Europe/Rome";
  var FINAL = ["FT", "AET", "PEN"];
  var LIVE = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT", "SUSP"];
  var VOIDS = ["PST", "CANC", "ABD", "AWD", "WO"];
  var TOP = [2, 3, 848, 135, 39, 140, 78, 61];
  var LANGS = ["it", "en", "es", "pt"];
  var PAGE = 20;
  var cache = {};
  var L = "it", D = {};
  var wide = window.matchMedia ? window.matchMedia("(min-width: 900px)") : { matches: true };

  /* ---------- i18n ---------- */
  function T(k, vars) {
    var s = (D && D[k] != null) ? D[k] : ((window.PBP_I18N.en || {})[k] || k);
    if (vars) for (var v in vars) s = s.replace("{" + v + "}", vars[v]);
    return s;
  }
  function stLabel(s) { return (D.status && D.status[s]) || s; }
  var ISO = { Italy: "IT", Spain: "ES", Germany: "DE", France: "FR", Portugal: "PT", Netherlands: "NL", Belgium: "BE", Turkey: "TR", "Saudi-Arabia": "SA" };
  function country(c) {
    if (D._countries && D._countries[c]) return D._countries[c];
    try { if (ISO[c] && Intl.DisplayNames) return new Intl.DisplayNames([loc()], { type: "region" }).of(ISO[c]); } catch (e) {}
    return c;
  }
  function roundName(r) { var m = /^Regular Season - (\d+)$/.exec(r || ""); return m ? T("round") + " " + m[1] : (r || ""); }
  function trLeague(s) { s = String(s || ""); var i = s.indexOf(" – "); return i > 0 ? country(s.slice(0, i)) + " · " + s.slice(i + 3) : s; }
  function leagueLabel(lg) { return country(lg.country) + " · " + lg.name; }
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
    document.title = "PreBetPro – " + T("hero_claim");
    if (rerender) { loaded = {}; route(true); }
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
    if (st === "ft") return '<span class="badge ft">' + (s.short === "AET" ? T("aet_short") : s.short === "PEN" ? T("pen_short") : esc(s.short)) + "</span>";
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
  function hue(s) { var h = 0; s = String(s || ""); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }

  /* ---------- mercati ---------- */
  var GROUPS = [
    { t: "g_1x2", items: [["1", "home_win", "home_win"], ["X", "draw", "draw"], ["2", "away_win", "away_win"]] },
    { t: "g_dc", items: [["1X", "double_chance.1x", "dc_1x"], ["X2", "double_chance.x2", "dc_x2"], ["12", "double_chance.12", "dc_12"]] },
    { t: "g_goals", items: [["O 1.5", "over_15", "over_15"], ["U 1.5", "under_15", null], ["O 2.5", "over_25", "over_25"], ["U 2.5", "under_25", "under_25"]] },
    { t: "g_btts", items: [["GG", "btts", "btts"], ["NG", "no_btts", "no_btts"]] }
  ];
  var COLS = [["1", "home_win", "home_win"], ["X", "draw", "draw"], ["2", "away_win", "away_win"], ["1X", "double_chance.1x", "dc_1x"], ["X2", "double_chance.x2", "dc_x2"], ["12", "double_chance.12", "dc_12"],
    ["O1.5", "over_15", "over_15"], ["O2.5", "over_25", "over_25"], ["U2.5", "under_25", "under_25"], ["GG", "btts", "btts"], ["NG", "no_btts", "no_btts"]];
  function val(p, path) { return path.split(".").reduce(function (o, k) { return o ? o[k] : null; }, p); }
  function hit(key, h, a) { return { home_win: h > a, draw: h === a, away_win: a > h, dc_1x: h >= a, dc_x2: a >= h, dc_12: h !== a, over_15: h + a > 1, under_15: h + a < 2, over_25: h + a > 2, under_25: h + a < 3, btts: h > 0 && a > 0, no_btts: !(h > 0 && a > 0) }[key]; }
  function confTag(c) { return c ? '<span class="tag conf-' + esc(c) + '">' + T("conf_" + c) + "</span>" : ""; }
  function hasStrong(f) { var s = f.predictions && f.predictions.strength; return !!(s && Object.keys(s).some(function (k) { return s[k]; })); }
  function marketsGrid(f) {
    var p = f.predictions;
    if (!p) return '<div class="muted small">' + T("min8") + "</div>";
    var st = stateOf(f), h = f.goals && f.goals.home, a = f.goals && f.goals.away;
    return '<div class="mk-grid">' + GROUPS.map(function (g) {
      return '<div class="mk-group"><div class="mk-title">' + T(g.t) + '</div><div class="mk-row">' + g.items.map(function (it) {
        var v = val(p, it[1]), strong = it[2] && p.strength && p.strength[it[2]], cls = "mk" + (strong ? " strong" : "");
        if (st === "ft" && h != null) cls += hit(it[2] || "under_15", h, a) ? " ok" : " ko";
        return '<div class="' + cls + '"><span>' + it[0] + "</span><b>" + (v == null ? "—" : v + "%") + "</b></div>";
      }).join("") + "</div></div>";
    }).join("") + "</div>";
  }
  function topMarkets(f, n) {
    var p = f.predictions; if (!p) return [];
    return [["1", p.home_win, "home_win"], ["X", p.draw, "draw"], ["2", p.away_win, "away_win"], ["O 2.5", p.over_25, "over_25"], ["U 2.5", p.under_25, "under_25"], ["GG", p.btts, "btts"]]
      .filter(function (m) { return m[1] != null; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, n || 3)
      .map(function (m) { return { l: m[0], v: m[1], s: p.strength && p.strength[m[2]] }; });
  }
  function pills(f, n) {
    var tm = topMarkets(f, n);
    return tm.length ? tm.map(function (m) { return '<span class="pill' + (m.s ? " strong" : "") + '">' + m.l + " <b>" + m.v + "%</b></span>"; }).join("") : '<span class="muted small">' + T("no_prediction") + "</span>";
  }

  /* ---------- componenti comuni ---------- */
  function daySeg(el, offsets, current, onPick) {
    el.innerHTML = offsets.map(function (o) { var d = romeDate(o); return '<button type="button" data-d="' + d + '" class="' + (d === current ? "on" : "") + '">' + dayLabel(d) + "</button>"; }).join("");
    el.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("button") : null; if (!b) return;
      var bs = el.querySelectorAll("button"); for (var i = 0; i < bs.length; i++) bs[i].classList.toggle("on", bs[i] === b);
      onPick(b.getAttribute("data-d"));
    };
  }
  function chipBar(el, keys, state, onChange) {
    el.innerHTML = keys.map(function (k) { return '<button type="button" class="chip' + (state.chip === k ? " on" : "") + '" data-k="' + k + '">' + T("chip_" + k) + "</button>"; }).join("");
    el.onclick = function (e) { var b = e.target.closest ? e.target.closest("[data-k]") : null; if (!b) return; state.chip = b.getAttribute("data-k"); state.limit = PAGE; chipBar(el, keys, state, onChange); onChange(); };
  }
  function leagueBar(el, fx, state, onChange) {
    var seen = {}, list = [];
    fx.forEach(function (f) { if (!seen[f.league.id]) { seen[f.league.id] = 1; list.push(f.league); } });
    if (state.league && !seen[state.league]) state.league = null;
    el.innerHTML = list.length > 1 ? '<button type="button" class="lchip' + (!state.league ? " on" : "") + '" data-l="">' + T("chip_all") + "</button>" + list.map(function (lg) {
      return '<button type="button" class="lchip' + (String(state.league) === String(lg.id) ? " on" : "") + '" data-l="' + lg.id + '" style="--lh:' + hue(lg.country) + '">' + logo(lg.logo, "llogo") + "<span>" + esc(lg.name) + "</span></button>";
    }).join("") : "";
    el.onclick = function (e) { var b = e.target.closest ? e.target.closest("[data-l]") : null; if (!b) return; state.league = b.getAttribute("data-l") || null; state.limit = PAGE; onChange(); };
  }
  function moreBtn(el, shown, total, state, onChange) {
    el.innerHTML = shown < total ? '<button type="button" class="btn more">' + T("show_more") + ' <span class="muted">(' + T("shown_of", { a: shown, b: total }) + ")</span></button>" : "";
    el.onclick = function (e) { if (e.target.closest && e.target.closest("button")) { state.limit += PAGE; onChange(); } };
  }
  function applyChip(fx, chip) {
    var now = Date.now() / 1000;
    return fx.filter(function (f) {
      var st = stateOf(f);
      switch (chip) {
        case "live": return st === "live";
        case "next3": return st === "ns" && f.fixture.timestamp - now <= 3 * 3600 && f.fixture.timestamp - now > -900;
        case "ft": return st === "ft";
        case "top": return TOP.indexOf(f.league.id) >= 0;
        case "strong": return hasStrong(f);
        case "high": return f.confidence === "high";
        default: return true;
      }
    });
  }
  function applySearch(fx, q) { q = (q || "").trim().toLowerCase(); return q ? fx.filter(function (f) { return (f.teams.home.name + " " + f.teams.away.name).toLowerCase().indexOf(q) >= 0; }) : fx; }
  var ORDER = ["World", "Europe", "Italy", "England", "Spain", "Germany", "France", "Portugal", "Netherlands", "Belgium", "Turkey", "Scotland", "Saudi-Arabia"];
  function sortFx(fx) {
    return fx.slice().sort(function (a, b) {
      var ia = ORDER.indexOf(a.league.country), ib = ORDER.indexOf(b.league.country); ia = ia < 0 ? 99 : ia; ib = ib < 0 ? 99 : ib;
      if (ia !== ib) return ia - ib; if (a.league.id !== b.league.id) return a.league.id - b.league.id;
      return (a.fixture.timestamp || 0) - (b.fixture.timestamp || 0);
    });
  }
  function leagueHead(lg, n) {
    return '<div class="league-head">' + logo(lg.logo, "llogo") + "<span>" + esc(leagueLabel(lg)) + '</span><em class="lg-n">' + n + "</em></div>";
  }
  function groupByLeague(fx, render, counts) {
    var out = "", cur = null;
    fx.forEach(function (f) {
      if (f.league.id !== cur) {
        if (cur !== null) out += "</div></div>"; cur = f.league.id;
        out += '<div class="league" style="--lh:' + hue(f.league.country) + '">' + leagueHead(f.league, counts[cur] || "") + '<div class="league-body">';
      }
      out += render(f);
    });
    return out + (cur !== null ? "</div></div>" : "");
  }
  function countBy(fx) { var c = {}; fx.forEach(function (f) { c[f.league.id] = (c[f.league.id] || 0) + 1; }); return c; }

  /* ================= TOP PICKS (raggruppati per partita) ================= */
  function picksFor(day) {
    return Promise.all([get("/history?date=" + day).catch(function () { return {}; }), get("/day?date=" + shiftDate(day, 1)).catch(function () { return {}; })]).then(function (r) {
      var hist = r[0] || {}, tom = r[1] || {}, seen = {}, rows = [];
      (hist.picks || []).forEach(function (p) { seen[p.af_id + ":" + p.market] = 1; rows.push({ fid: p.af_id, match: p.match, league: p.league, kickoff: p.kickoff, market: p.market, value: p.probability, result: p.void ? "void" : p.result, ft: p.ft, frozen: true, day: day }); });
      (hist.ranked_predictions || []).forEach(function (p) { if (seen[p.fixture_id + ":" + p.market]) return; seen[p.fixture_id + ":" + p.market] = 1; rows.push({ fid: p.fixture_id, match: p.match, league: p.league, kickoff: p.kickoff, market: p.market, value: p.value, day: day }); });
      var nToday = rows.length;
      if (nToday < 5) (tom.ranked_predictions || []).forEach(function (p) { rows.push({ fid: p.fixture_id, match: p.match, league: p.league, kickoff: p.kickoff, market: p.market, value: p.value, day: shiftDate(day, 1) }); });
      var by = {}, cards = [];
      rows.forEach(function (r) { var c = by[r.fid]; if (!c) { c = by[r.fid] = { fid: r.fid, match: r.match, league: r.league, kickoff: r.kickoff, day: r.day, ft: r.ft, picks: [] }; cards.push(c); } c.picks.push(r); if (r.ft) c.ft = r.ft; });
      cards.forEach(function (c) { c.picks.sort(function (a, b) { return b.value - a.value; }); });
      cards.sort(function (a, b) { return new Date(a.kickoff) - new Date(b.kickoff); });
      return { cards: cards, fixtures: hist.fixtures || [], todayMatches: cards.filter(function (c) { return c.day === day; }).length };
    });
  }
  function pickCard(c) {
    var anyFrozen = c.picks.some(function (p) { return p.frozen; });
    var res = c.picks.map(function (p) { return p.result; });
    var cls = res.every(function (x) { return x === true; }) && res.length ? " is-win" : res.some(function (x) { return x === false; }) ? " is-loss" : "";
    var badge = anyFrozen && res.some(function (x) { return x === true || x === false; }) ? "" : '<span class="badge ns">' + (c.day === romeDate(0) ? "" : dayLabel(c.day) + " ") + fmtTime(c.kickoff) + "</span>";
    return '<div class="card pick' + cls + '" data-fid="' + esc(c.fid) + '" data-day="' + esc(c.day) + '" role="button" tabindex="0">' +
      '<div class="card-top"><span class="muted small ellipsis">' + esc(trLeague(c.league)) + "</span>" + badge + "</div>" +
      '<div class="card-match">' + esc(c.match) + (c.ft ? ' <span class="score">' + esc(c.ft) + "</span>" : "") + "</div>" +
      c.picks.map(function (p) {
        return '<div class="card-pick"><span class="market">' + esc(mkName(p.market)) + '</span><span class="prob">' + esc(p.value) + "%</span>" + (p.frozen && (p.result === true || p.result === false || p.result === "void") ? resultBadge(p.result) : "") + "</div>" +
          '<div class="meter"><i style="width:' + Math.max(0, Math.min(100, +p.value || 0)) + '%"></i></div>';
      }).join("") +
      '<div class="muted small">' + fmtDay(c.kickoff) + " · " + fmtTime(c.kickoff) + "</div></div>";
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
  function bindPicks(el) { el.onclick = function (e) { var c = e.target.closest ? e.target.closest("[data-fid]") : null; if (c) goToMatch(c.getAttribute("data-day"), c.getAttribute("data-fid")); }; }

  /* ================= HOME ================= */
  function loadHome() {
    var today = romeDate(0), fb = $("picks-football"), tn = $("picks-tennis");
    loading(fb);
    Promise.all([picksFor(today), get("/tennis?date=" + today).catch(function () { return {}; })]).then(function (r) {
      var P0 = r[0], ten = r[1] || {}, tp = (ten.date === today && ten.picks) || [];
      var n = P0.fixtures.length, k = P0.todayMatches;
      $("hero-today").textContent = n ? T("hero_today", { n: n, k: k }) : "";
      $("picks-count").textContent = n ? T("picks_count", { k: k, n: n }) : "";
      fb.innerHTML = P0.cards.length ? P0.cards.map(pickCard).join("") : empty(T("fb_none_picks"));
      fb.setAttribute("data-loaded", "1"); bindPicks(fb);
      tn.innerHTML = tp.length ? tp.map(tennisCard).join("") : empty(T("tn_none_picks"));
    }).catch(function (e) { fail(fb, e); });
    loadLive();
  }

  /* ---------- partite (livescore) ---------- */
  var M = { day: romeDate(0), fixtures: [], open: {}, det: {}, inj: {}, chip: "all", league: null, limit: PAGE };
  function injFor(I, id) { return (I && I[id]) || null; }
  function loadLive(silent) {
    daySeg($("live-day"), [-1, 0, 1], M.day, function (d) { M.day = d; M.open = {}; M.limit = PAGE; $("live-list").removeAttribute("data-loaded"); loadLive(); });
    chipBar($("live-chips"), ["all", "live", "next3", "ft", "top", "strong"], M, renderLive);
    var list = $("live-list"); if (!silent) loading(list);
    var day = M.day;
    Promise.all([get("/day?date=" + day), day <= romeDate(0) ? get("/details?date=" + day, 60000).catch(function () { return null; }) : null]).then(function (r) {
      var d = r[0]; if (r[1]) M.det[day] = r[1];
      if (day !== M.day) return;
      M.fixtures = sortFx(d.fixtures || []); M.updated = d.updated;
      renderLive();
      if (Object.keys(M.open).some(function (k) { return M.open[k]; })) loadDetails(day);
    }).catch(function (e) { fail(list, e); });
  }
  function renderLive() {
    var base = applySearch(applyChip(M.fixtures, M.chip), $("m-search").value);
    leagueBar($("live-leagues"), base, M, renderLive);
    var fx = M.league ? base.filter(function (f) { return String(f.league.id) === String(M.league); }) : base;
    var shown = fx.slice(0, M.limit);
    $("live-updated").textContent = M.updated ? T("updated_at") + " " + fmtTime(M.updated) + " · " + T("next_update") : "";
    var lst = $("live-list");
    lst.innerHTML = shown.length ? groupByLeague(shown, liveRow, countBy(fx)) : empty(M.fixtures.length ? T("no_matches") : T("no_data"));
    lst.setAttribute("data-loaded", "1");
    moreBtn($("live-more"), shown.length, fx.length, M, renderLive);
    lst.onclick = function (e) {
      var r = e.target.closest ? e.target.closest(".mrow") : null; if (!r) return;
      var id = r.getAttribute("data-fid"); M.open[id] = !M.open[id];
      var box = $("det-" + id); r.classList.toggle("open", !!M.open[id]);
      if (box) { box.hidden = !M.open[id]; if (M.open[id]) { box.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>'; loadDetails(M.day); } }
    };
  }
  function liveRow(f, open, det, prefix) {
    var st = stateOf(f), id = f.fixture.id; open = open == null ? !!M.open[id] : open;
    var ht = f.score && f.score.halftime;
    return '<div class="mrow' + (st === "live" ? " is-live" : "") + (open ? " open" : "") + '" data-fid="' + id + '" role="button" tabindex="0">' +
      '<div class="mrow-status">' + statusBadge(f) + "</div>" +
      '<div class="mrow-teams"><div class="team">' + logo(f.teams.home.logo, "tlogo") + "<span>" + esc(f.teams.home.name) + "</span><b>" + (st !== "ns" && f.goals.home != null ? f.goals.home : "") + "</b></div>" +
      '<div class="team">' + logo(f.teams.away.logo, "tlogo") + "<span>" + esc(f.teams.away.name) + "</span><b>" + (st !== "ns" && f.goals.away != null ? f.goals.away : "") + "</b></div>" +
      (st !== "ns" && ht && ht.home != null ? '<div class="ht">HT ' + ht.home + "-" + ht.away + (f.score.penalty && f.score.penalty.home != null ? " · " + T("pen_short") + " " + f.score.penalty.home + "-" + f.score.penalty.away : "") + "</div>" : "") + "</div>" +
      evCol(f, det !== undefined ? det : (M.det[M.day] && M.det[M.day][id])) +
      '<div class="mrow-mk">' + pills(f, 3) + "</div>" +
      '<div class="mrow-go" aria-hidden="true">⌄</div></div>' +
      '<div class="mdet" id="' + (prefix || "det-") + id + '"' + (open ? "" : " hidden") + ">" + (open ? detailHtml(f, det !== undefined ? det : (M.det[M.day] && M.det[M.day][id]), injFor(prefix === "adet-" ? A.inj : M.inj[M.day], id)) : "") + "</div>";
  }
  function evCol(f, d) {
    var ev = (d && d.events) || [], hid = f.teams.home.id;
    var line = function (home) {
      return ev.filter(function (e) { return (e[2] === hid) === home && ((e[5] === "Goal" && e[6] !== "Missed Penalty") || (e[5] === "Card" && /red|second/i.test(e[6]))); }).map(function (e) {
        var min = (e[0] != null ? e[0] : "") + (e[1] ? "+" + e[1] : "") + "'";
        if (e[5] === "Card") return '<span class="evx rc">🟥 ' + esc(e[3] || "") + " " + min + "</span>";
        return '<span class="evx">⚽ ' + esc(e[3] || "?") + " " + min + (e[6] === "Penalty" ? " (" + T("ev_pen") + ")" : e[6] === "Own Goal" ? " (" + T("ev_own") + ")" : "") + "</span>";
      }).join("");
    };
    var h = line(true), a = line(false);
    return '<div class="mrow-ev">' + (h || a ? '<div class="evl">' + h + '</div><div class="evl">' + a + "</div>" : "") + "</div>";
  }
  function loadDetails(day) {
    Promise.all([get("/details?date=" + day, 60000), get("/injuries?date=" + day, 600000).catch(function () { return {}; })]).then(function (r) {
      var all = r[0]; M.inj[day] = r[1] || {};
      M.det[day] = all || {};
      Object.keys(M.open).forEach(function (id) {
        if (!M.open[id]) return; var box = $("det-" + id); if (!box) return;
        var f = M.fixtures.filter(function (x) { return String(x.fixture.id) === String(id); })[0];
        if (f) box.innerHTML = detailHtml(f, M.det[day][id], injFor(M.inj[day], id));
      });
    }).catch(function () {
      Object.keys(M.open).forEach(function (id) { var box = $("det-" + id), f = M.fixtures.filter(function (x) { return String(x.fixture.id) === String(id); })[0]; if (box && f) box.innerHTML = detailHtml(f, null); });
    });
  }
  function rateTag(r) { if (r == null) return ""; return '<span class="rate ' + (r >= 7.5 ? "hi" : r < 6.3 ? "lo" : "") + '">' + Number(r).toFixed(1) + "</span>"; }
  function luPl(p) { return "<li><span>" + (p[0] != null ? p[0] : "") + "</span>" + esc(p[1]) + (p[8] ? ' <b class="cap">C</b>' : "") + (p[6] ? " " + new Array(Math.min(p[6], 4) + 1).join("⚽") : "") + ' <em>' + esc(p[2]) + "</em>" + rateTag(p[4]) + "</li>"; }
  function detailHtml(f, d, inj) {
    d = d || {};
    var st = stateOf(f), hid = f.teams.home.id, venue = d.venue || f.fixture.venue, ref = d.referee || f.fixture.referee;
    var out = '<div class="det-grid">';
    out += '<div class="det-box"><h4>' + T("match_info") + "</h4>" +
      '<div class="kv"><span>' + T("kickoff") + "</span><b>" + fmtDay(f.fixture.date, true) + " · " + fmtTime(f.fixture.date) + "</b></div>" +
      (venue && venue.name ? '<div class="kv"><span>' + T("venue") + "</span><b>" + esc(venue.name) + (venue.city ? " (" + esc(venue.city) + ")" : "") + "</b></div>" : "") +
      (ref ? '<div class="kv"><span>' + T("referee") + "</span><b>" + esc(ref) + "</b></div>" : "") +
      '<div class="kv"><span>' + esc(roundName(f.league.round)) + "</span><b>" + esc(stLabel(f.fixture.status.short)) + "</b></div>" +
      (f.score && f.score.extratime && f.score.extratime.home != null ? '<div class="kv"><span>' + T("et") + "</span><b>" + f.score.extratime.home + "-" + f.score.extratime.away + "</b></div>" : "") +
      (f.score && f.score.penalty && f.score.penalty.home != null ? '<div class="kv"><span>' + T("pens") + "</span><b>" + f.score.penalty.home + "-" + f.score.penalty.away + "</b></div>" : "") + "</div>";
    out += '<div class="det-box"><h4>' + T("model") + "</h4>" + (f.predictions ? '<div class="tags">' + confTag(f.confidence) +
      (f.lambda ? '<span class="tag">' + T("xg") + " " + f.lambda.home + " – " + f.lambda.away + "</span>" : "") +
      (f.sigma != null ? '<span class="tag">' + T("sigma") + " " + f.sigma + "</span>" : "") + "</div>" : "") + marketsGrid(f) + "</div>";
    if (inj && inj.length) {
      var side = function (tid) { var l = inj.filter(function (x) { return x[0] === tid; }); return l.length ? '<div class="inj-team"><b>' + esc(tid === hid ? f.teams.home.name : f.teams.away.name) + "</b>" + l.map(function (x) { var dbt = /question|doubt/i.test(x[2]); return '<div class="inj"><span class="inj-ico">' + (dbt ? "❔" : "🚑") + "</span>" + esc(x[1]) + ' <span class="muted small">' + (dbt ? T("inj_doubt") : T("inj_missing")) + (x[3] ? " · " + esc(x[3]) : "") + "</span></div>"; }).join("") + "</div>" : ""; };
      out += '<div class="det-box wide"><h4>🚑 ' + T("inj_title") + '</h4><div class="lu">' + side(f.teams.home.id) + side(f.teams.away.id) + "</div></div>";
    }
    var ev = d.events || [];
    if (ev.length) {
      out += '<div class="det-box wide"><h4>' + T("timeline") + '</h4><div class="tl">' + ev.map(function (e) {
        var home = e[2] === hid, type = e[5], det = e[6] || "", ico = "•", txt = esc(e[3]);
        if (type === "Goal") { ico = det === "Missed Penalty" ? "❌" : "⚽"; if (det === "Own Goal") txt += " <i>(" + T("ev_own") + ")</i>"; else if (det === "Penalty") txt += " <i>(" + T("ev_pen") + ")</i>"; else if (det === "Missed Penalty") txt += " <i>(" + T("ev_miss") + ")</i>"; if (e[4] && det !== "Missed Penalty") txt += ' <span class="muted">(' + esc(e[4]) + ")</span>"; }
        else if (type === "Card") ico = /red|second/i.test(det) ? "🟥" : "🟨";
        else if (type === "subst") { ico = "🔁"; txt = esc(e[3]) + (e[4] ? " ⇄ " + esc(e[4]) : ""); }
        else if (type === "Var") { ico = "📺"; txt = "VAR · " + esc(det) + (e[3] ? " – " + esc(e[3]) : ""); }
        var min = (e[0] != null ? e[0] : "") + (e[1] ? "+" + e[1] : "") + "'";
        if (type === "Card" && e[7]) txt += ' <span class="muted small">· ' + esc(e[7]) + "</span>";
        return '<div class="tl-row ' + (home ? "h" : "a") + '"><span class="tl-min">' + min + '</span><span class="tl-ico">' + ico + '</span><span class="tl-txt">' + txt + "</span></div>";
      }).join("") + "</div></div>";
    }
    var lu = d.lineups || [];
    if (lu.length) {
      var best = null; lu.forEach(function (l) { (l.xi || []).concat(l.subs || []).forEach(function (p) { if (p[4] != null && (!best || p[4] > best.p[4])) best = { p: p, t: l.team }; }); });
      out += '<div class="det-box wide"><h4>' + T("lineups") + "</h4>" + (best ? '<div class="mvp">⭐ ' + T("mvp") + ": <b>" + esc(best.p[1]) + "</b> " + rateTag(best.p[4]) + ' <span class="muted small">' + esc(best.t === hid ? f.teams.home.name : f.teams.away.name) + "</span></div>" : "") + '<div class="lu">' + lu.map(function (l) {
        var name = l.team === hid ? f.teams.home.name : f.teams.away.name;
        return '<div class="lu-team"><div class="lu-head"><b>' + esc(name) + "</b>" + (l.formation ? ' <span class="tag">' + esc(l.formation) + "</span>" : "") + "</div>" +
          (l.coach ? '<div class="muted small">' + T("coach") + ": " + esc(l.coach) + "</div>" : "") +
          '<ol class="lu-xi">' + (l.xi || []).map(luPl).join("") + "</ol>" +
          ((l.subs || []).length ? '<details><summary>' + T("subs") + " (" + l.subs.length + ')</summary><ol class="lu-xi">' + l.subs.map(luPl).join("") + "</ol></details>" : "") + "</div>";
      }).join("") + "</div></div>";
    }
    var sts = d.stats || [];
    if (sts.length === 2) {
      var sh = sts[0].team === hid ? sts[0].v : sts[1].v, sa = sts[0].team === hid ? sts[1].v : sts[0].v;
      var rows = [["Ball Possession", "s_poss"], ["expected_goals", "s_xg"], ["Total Shots", "s_shots"], ["Shots on Goal", "s_shots_on"], ["Shots off Goal", "s_shots_off"], ["Blocked Shots", "s_blocked"], ["Shots insidebox", "s_in"], ["Shots outsidebox", "s_out"], ["Corner Kicks", "s_corners"], ["Total passes", "s_passes"], ["Passes accurate", "s_pacc"], ["Passes %", "s_ppct"], ["Fouls", "s_fouls"], ["Offsides", "s_off"], ["Yellow Cards", "s_yc"], ["Red Cards", "s_rc"], ["Goalkeeper Saves", "s_saves"]];
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
    if (location.hash !== "#home" && location.hash !== "" && location.hash !== "#live") { pendingMatch = [day, fid]; location.hash = "#home"; return; }
    M.day = day; M.chip = "all"; M.league = null; M.limit = 999; M.open = {}; M.open[fid] = true; $("m-search").value = "";
    loadLive(true);
    setTimeout(function () { var r = document.querySelector('.mrow[data-fid="' + fid + '"]'); if (r) r.scrollIntoView({ block: "center" }); loadDetails(day); }, 700);
  }
  var pendingMatch = null;

  /* ================= PRONOSTICI ================= */
  var P = { day: romeDate(0), fixtures: [], chip: "all", league: null, limit: PAGE, sort: null, dir: -1, open: {} };
  function loadPred() {
    daySeg($("pred-day"), [0, 1], P.day, function (d) { P.day = d; P.limit = PAGE; $("pred-list").removeAttribute("data-loaded"); loadPred(); });
    chipBar($("pred-chips"), ["all", "high", "top"], P, renderPred);
    var pp = $("pred-picks"); loading(pp);
    picksFor(romeDate(0)).then(function (r) { pp.innerHTML = r.cards.length ? r.cards.map(pickCard).join("") : empty(T("fb_none_picks")); pp.setAttribute("data-loaded", "1"); bindPicks(pp); }).catch(function (e) { fail(pp, e); });
    var list = $("pred-list"); loading(list); var day = P.day;
    get("/day?date=" + day).then(function (d) {
      if (day !== P.day) return;
      P.fixtures = sortFx(d.fixtures || []); renderPred();
    }).catch(function (e) { fail(list, e); });
  }
  function renderPred() {
    var base = applySearch(applyChip(P.fixtures.filter(function (f) { return f.predictions; }), P.chip), $("p-search").value);
    leagueBar($("pred-leagues"), base, P, renderPred);
    var fx = P.league ? base.filter(function (f) { return String(f.league.id) === String(P.league); }) : base;
    if (P.sort && wide.matches) {
      var col = COLS.filter(function (c) { return c[0] === P.sort; })[0];
      fx = fx.slice().sort(function (a, b) { return P.dir * ((val(a.predictions, col[1]) || 0) - (val(b.predictions, col[1]) || 0)); });
    }
    var shown = fx.slice(0, P.limit), lst = $("pred-list");
    var none = P.fixtures.filter(function (f) { return !f.predictions; }).length;
    $("pred-hint").textContent = (wide.matches ? T("sort_hint") + " · " : "") + T("legend_strong");
    if (!shown.length) lst.innerHTML = empty(T("no_pred"));
    else if (wide.matches) lst.innerHTML = predTable(shown, !P.sort, countBy(fx));
    else lst.innerHTML = groupByLeague(shown, predCard, countBy(fx));
    if (none) lst.innerHTML += '<p class="muted small center">' + none + " " + T("without_pred") + "</p>";
    lst.setAttribute("data-loaded", "1");
    moreBtn($("pred-more"), shown.length, fx.length, P, renderPred);
    lst.onclick = function (e) {
      var th = e.target.closest ? e.target.closest("th[data-c]") : null;
      if (th) { var c = th.getAttribute("data-c"); if (c === "time") { P.sort = null; } else if (P.sort === c) P.dir = -P.dir; else { P.sort = c; P.dir = -1; } renderPred(); return; }
      var t = e.target.closest ? e.target.closest("[data-more]") : null;
      if (t) { var id = t.getAttribute("data-more"); P.open[id] = !P.open[id]; var box = $("pm-" + id); if (box) box.hidden = !P.open[id]; t.textContent = P.open[id] ? T("less_markets") : T("more_markets"); }
    };
  }
  function predCard(f) {
    var id = f.fixture.id, o = !!P.open[id], st = stateOf(f);
    return '<div class="pcard">' +
      '<div class="pcard-head"><div class="pcard-teams"><b>' + esc(f.teams.home.name) + "</b><b>" + esc(f.teams.away.name) + "</b></div>" +
      '<div class="pcard-meta">' + (st !== "ns" && f.goals.home != null ? '<span class="score">' + f.goals.home + "-" + f.goals.away + "</span>" : "") + statusBadge(f) + "</div></div>" +
      '<div class="pcard-mk">' + pills(f, 3) + "</div>" +
      '<div class="pcard-foot">' + confTag(f.confidence) + '<button type="button" class="link-btn" data-more="' + id + '">' + (o ? T("less_markets") : T("more_markets")) + "</button></div>" +
      '<div id="pm-' + id + '"' + (o ? "" : " hidden") + ">" + marketsGrid(f) + "</div></div>";
  }
  function predTable(fx, grouped, counts) {
    var head = '<tr><th data-c="time" class="' + (!P.sort ? "on" : "") + '">' + T("col_time") + "</th><th>" + T("col_match") + "</th>" +
      COLS.map(function (c) { return '<th data-c="' + c[0] + '" class="num' + (P.sort === c[0] ? " on" : "") + '">' + c[0] + (P.sort === c[0] ? (P.dir < 0 ? " ↓" : " ↑") : "") + "</th>"; }).join("") + "<th>" + T("col_conf") + "</th></tr>";
    var body = "", cur = null;
    fx.forEach(function (f) {
      if (grouped && f.league.id !== cur) { cur = f.league.id; body += '<tr class="lg-row" style="--lh:' + hue(f.league.country) + '"><td colspan="' + (COLS.length + 3) + '">' + logo(f.league.logo, "llogo") + "<span>" + esc(leagueLabel(f.league)) + '</span><em class="lg-n">' + (counts[cur] || "") + "</em></td></tr>"; }
      var p = f.predictions, st = stateOf(f), h = f.goals && f.goals.home, a = f.goals && f.goals.away;
      body += "<tr><td>" + statusBadge(f) + '</td><td class="tm"><b>' + esc(f.teams.home.name) + "</b> – <b>" + esc(f.teams.away.name) + "</b>" +
        (st !== "ns" && h != null ? ' <span class="score">' + h + "-" + a + "</span>" : "") + (!grouped ? '<div class="muted small">' + esc(leagueLabel(f.league)) + "</div>" : "") + "</td>" +
        COLS.map(function (c) {
          var v = val(p, c[1]), s = p.strength && p.strength[c[2]], cls = "num" + (s ? " strong" : v >= 60 ? " hi" : "");
          if (st === "ft" && h != null) cls += hit(c[2], h, a) ? " ok" : " ko";
          return '<td class="' + cls + '">' + (v == null ? "—" : v + "%") + "</td>";
        }).join("") + "<td>" + confTag(f.confidence) + "</td></tr>";
    });
    return '<div class="tbl-wrap"><table class="ptable"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
  }

  /* ================= TENNIS ================= */
  var TN = { day: romeDate(0), matches: [], open: {}, chip: "all", limit: PAGE, picks: [] };
  var TOURS = ["atp", "wta", "challenger", "itf"];
  function tnState(x) { if (x.es && /cancel/i.test(x.es)) return "void"; if (x.st === "live") return "live"; if (x.st === "completed" || x.fin) return "ft"; if (x.st === "ended") return "end"; return "ns"; }
  function tnBadge(x) {
    var st = tnState(x);
    if (st === "live") return '<span class="badge live"><i class="dot"></i>LIVE</span>';
    if (st === "ft") return '<span class="badge ft">FT</span>';
    if (st === "end") return '<span class="badge ft" title="' + esc(T("tn_last")) + '">' + T("tn_ended") + "*</span>";
    if (st === "void") return '<span class="badge void" title="' + esc(T("tn_cancelled")) + '">' + T("tn_canc_s") + "</span>";
    return '<span class="badge ns">' + fmtTime(x.ts) + "</span>";
  }
  function tnGroupKey(x) { var t = TOURS.indexOf(x.tour); return (t < 0 ? 9 : t) + "|" + x.tn; }
  function tnIsPick(x) { return TN.picks.some(function (p) { var m = String(p.match || "").toLowerCase(); return m.indexOf(lastName(x.p[0].n)) >= 0 && m.indexOf(lastName(x.p[1].n)) >= 0; }); }
  function lastName(n) { return String(n || "").toLowerCase().split(/\s+/).pop(); }
  function tnSide(x, i) {
    var p = x.p[i], s = x.s, st = tnState(x), win = x.w === i + 1;
    var sets = st !== "ns" && st !== "void" && s && s.g && s.g[i] ? s.g[i].map(function (g, k) { var other = s.g[1 - i] ? s.g[1 - i][k] : null, wonSet = other != null && g > other; return '<span class="tset' + (wonSet ? " w" : "") + '">' + g + (s.tb && s.tb[k] && (g === 7 || g === 6) && other != null && Math.abs(g - other) === 1 ? "<sup>" + (s.tb[k]["p" + (i + 1)] != null ? s.tb[k]["p" + (i + 1)] : "") + "</sup>" : "") + "</span>"; }).join("") : "";
    return '<div class="tteam' + (win ? " win" : "") + '"><span class="tname">' + (st === "live" && s && s.sv === i + 1 ? '<i class="srv" title="' + esc(T("tn_serve")) + '"></i>' : "") + esc(p.n) + (p.c ? ' <em class="cc">' + esc(String(p.c).toUpperCase()) + "</em>" : "") + (p.rk ? ' <em class="rk">#' + p.rk + "</em>" : "") + "</span>" +
      '<span class="tsets">' + sets + (st === "live" && s && s.pt && s.pt[i] != null ? '<span class="tpt">' + esc(s.pt[i]) + "</span>" : "") + "</span></div>";
  }
  function tnRow(x) {
    var o = !!TN.open[x.id], pick = tnIsPick(x);
    return '<div class="mrow trow' + (tnState(x) === "live" ? " is-live" : "") + (o ? " open" : "") + (pick ? " is-pick" : "") + '" data-tid="' + x.id + '" role="button" tabindex="0">' +
      '<div class="mrow-status">' + tnBadge(x) + "</div>" +
      '<div class="mrow-teams">' + tnSide(x, 0) + tnSide(x, 1) + "</div>" +
      '<div class="mrow-mk">' + (pick ? '<span class="pill strong">🔥 Pick</span>' : "") + (x.db ? '<span class="pill">' + T("tn_doubles") + "</span>" : "") + "</div>" +
      '<div class="mrow-go" aria-hidden="true">⌄</div></div>' +
      '<div class="mdet" id="tdet-' + x.id + '"' + (o ? "" : " hidden") + ">" + (o ? tnDetail(x) : "") + "</div>";
  }
  function tnDetail(x) {
    var kv = function (k, v) { return v ? '<div class="kv"><span>' + k + "</span><b>" + v + "</b></div>" : ""; };
    var info = kv(T("tn_start"), fmtDay(x.ts, true) + " · " + fmtTime(x.ts)) + kv(T("tn_round"), esc(x.rd || "")) +
      kv(T("tn_surface"), x.sf ? esc(T("sf_" + x.sf) !== "sf_" + x.sf ? T("sf_" + x.sf) : x.sf) + (x.in === true ? " · " + T("tn_indoor") : x.in === false ? " · " + T("tn_outdoor") : "") : "") +
      kv(T("tn_court"), esc(x.ct || "")) + kv(T("tn_format"), x.fmt === "BO5" ? T("tn_bo5") : x.fmt === "BO3" ? T("tn_bo3") : esc(x.fmt || "")) +
      (x.q ? kv("", T("tn_qual")) : "") + (x.w ? kv(T("tn_winner"), esc(x.p[x.w - 1].n)) : "") + (tnState(x) === "end" ? '<div class="muted small">* ' + T("tn_last") + "</div>" : "");
    var pl = x.p.map(function (p) {
      return '<div class="tpl"><b>' + esc(p.n) + "</b>" + (p.c ? ' <em class="cc">' + esc(String(p.c).toUpperCase()) + "</em>" : "") +
        '<div class="muted small">' + [p.rk ? T("tn_rank") + " #" + p.rk + (p.mv === "up" ? " ▲" : p.mv === "down" ? " ▼" : "") : "", p.h ? T("tn_hand_" + p.h) : "", p.b ? T("tn_born") + " " + p.b : ""].filter(Boolean).join(" · ") + "</div></div>";
    }).join("");
    var sc = "";
    if (x.s && x.s.g && x.s.g[0] && x.s.g[0].length) {
      sc = '<table class="tscore"><thead><tr><th></th>' + x.s.g[0].map(function (_, k) { return "<th>" + (k + 1) + "</th>"; }).join("") + "<th>Set</th></tr></thead><tbody>" + [0, 1].map(function (i) {
        return '<tr class="' + (x.w === i + 1 ? "win" : "") + '"><td>' + esc(x.p[i].n) + "</td>" + x.s.g[i].map(function (g, k) { var tb = x.s.tb && x.s.tb[k]; return "<td>" + g + (tb && tb["p" + (i + 1)] != null && (g === 6 || g === 7) && Math.abs(g - x.s.g[1 - i][k]) === 1 ? "<sup>" + tb["p" + (i + 1)] + "</sup>" : "") + "</td>"; }).join("") + "<td><b>" + (x.s.sets ? x.s.sets[i] : "") + "</b></td></tr>";
      }).join("") + "</tbody></table>" + (tnState(x) === "live" && x.s.pt && x.s.pt[0] != null ? '<div class="muted small">' + T("tn_points") + ": " + esc(x.s.pt[0]) + " - " + esc(x.s.pt[1]) + "</div>" : "");
    }
    return '<div class="det-grid"><div class="det-box"><h4>' + T("tn_info") + "</h4>" + info + "</div>" +
      '<div class="det-box"><h4>' + T("tn_players") + "</h4>" + pl + "</div>" + (sc ? '<div class="det-box wide"><h4>' + T("score") + "</h4>" + sc + "</div>" : "") + "</div>";
  }
  function loadTennis() {
    daySeg($("tennis-day"), [-1, 0, 1], TN.day, function (d) { TN.day = d; TN.limit = PAGE; TN.open = {}; loadTennis(); });
    chipBar($("tn-chips"), ["all", "live", "atpwta", "chall", "itf", "tnft"], TN, renderTennis);
    var list = $("tennis-list"), ml = $("tn-matches"); loading(list); loading(ml); var day = TN.day;
    Promise.all([get("/tennis?date=" + day + "&exact=1").catch(function () { return {}; }), get("/tennis/report", 300000).catch(function () { return null; }), get("/tennis/matches?date=" + day, 60000).catch(function () { return {}; })]).then(function (r) {
      if (day !== TN.day) return;
      var picks = (r[0] && r[0].date === day && r[0].picks) || [], s = r[1] && r[1].summary;
      TN.picks = picks; TN.matches = (r[2] && r[2].matches) || []; TN.updated = r[2] && r[2].updated;
      $("tennis-kpis").innerHTML = kpi(picks.length, T("k_picks") + " · " + dayLabel(day).toLowerCase()) + kpi(s ? s.total : 0, T("k_graded30")) +
        kpi(s ? s.won + " / " + s.lost : "—", T("k_wl")) + kpi(s && s.total ? s.accuracy + "%" : "—", T("k_hit30"), "accent");
      list.innerHTML = picks.length ? picks.slice().sort(function (a, b) { return String(a.start || a.time).localeCompare(String(b.start || b.time)); }).map(tennisCard).join("") : empty(T("tn_none_picks"));
      list.setAttribute("data-loaded", "1");
      renderTennis();
    }).catch(function (e) { fail(list, e); });
  }
  function renderTennis() {
    var q = ($("tn-search").value || "").trim().toLowerCase();
    var fx = TN.matches.filter(function (x) {
      var st = tnState(x);
      switch (TN.chip) {
        case "live": if (st !== "live") return false; break;
        case "atpwta": if (x.tour !== "atp" && x.tour !== "wta") return false; break;
        case "chall": if (x.tour !== "challenger") return false; break;
        case "itf": if (x.tour !== "itf") return false; break;
        case "tnft": if (st !== "ft" && st !== "end") return false; break;
      }
      return !q || (x.p[0].n + " " + x.p[1].n + " " + x.tn).toLowerCase().indexOf(q) >= 0;
    }).sort(function (a, b) { var ka = tnGroupKey(a), kb = tnGroupKey(b); if (ka !== kb) return ka < kb ? -1 : 1; var la = tnState(a) === "live" ? 0 : 1, lb = tnState(b) === "live" ? 0 : 1; return la - lb || String(a.ts).localeCompare(String(b.ts)); });
    var shown = fx.slice(0, TN.limit), ml = $("tn-matches");
    $("tn-updated").textContent = TN.updated ? T("tn_upd") + " " + fmtTime(TN.updated) : "";
    var counts = {}; fx.forEach(function (x) { counts[x.tn] = (counts[x.tn] || 0) + 1; });
    var out = "", cur = null;
    shown.forEach(function (x) {
      if (x.tn !== cur) { if (cur !== null) out += "</div></div>"; cur = x.tn; out += '<div class="league" style="--lh:' + ({ atp: 210, wta: 320, challenger: 35, itf: 150 }[x.tour] || 260) + '"><div class="league-head"><span class="tour-tag">' + esc((x.tour || "tennis").toUpperCase()) + "</span><span>" + esc(x.tn) + '</span><em class="lg-n">' + counts[x.tn] + '</em></div><div class="league-body">'; }
      out += tnRow(x);
    });
    if (cur !== null) out += "</div></div>";
    ml.innerHTML = shown.length ? out : empty(TN.matches.length ? T("no_matches") : T("tn_no_matches"));
    ml.setAttribute("data-loaded", "1");
    moreBtn($("tn-more"), shown.length, fx.length, TN, renderTennis);
    ml.onclick = function (e) {
      var r = e.target.closest ? e.target.closest(".trow") : null; if (!r) return;
      var id = r.getAttribute("data-tid"); TN.open[id] = !TN.open[id]; r.classList.toggle("open", TN.open[id]);
      var box = $("tdet-" + id), x = TN.matches.filter(function (m) { return String(m.id) === id; })[0];
      if (box) { box.hidden = !TN.open[id]; if (TN.open[id] && x) box.innerHTML = tnDetail(x); }
    };
  }

  /* ================= REPORT ================= */
  function loadReport() {
    var n = +$("report-range").value || 7;
    Promise.all([get("/report/summary?range=" + n, 120000), get("/report?range=" + n, 120000), get("/tennis/report", 300000).catch(function () { return null; })]).then(function (r) {
      var sum = r[0] || {}, rep = r[1] || {}, ten = r[2], s = sum.summary || {};
      var from = romeDate(-(n - 1));
      var picks = (rep.picks || []).filter(function (p) { return String(p.kickoff || "").slice(0, 10) >= from; });
      $("report-summary").innerHTML = kpi(s.total || 0, T("r_total")) + kpi(s.won || 0, T("r_won"), "win") + kpi(s.lost || 0, T("r_lost"), "loss") + kpi(s.total ? s.accuracy + "%" : "—", T("r_acc"), "accent");
      var mk = {}; picks.forEach(function (p) { var m = mk[p.market] = mk[p.market] || { w: 0, l: 0 }; p.result ? m.w++ : m.l++; });
      var keys = Object.keys(mk).sort(function (a, b) { return (mk[b].w + mk[b].l) - (mk[a].w + mk[a].l); });
      $("report-markets").innerHTML = keys.length ? '<table class="tbl"><thead><tr><th>' + T("r_market") + "</th><th>" + T("r_won") + "</th><th>" + T("r_lost") + "</th><th>" + T("r_acc") + "</th></tr></thead><tbody>" + keys.map(function (k) {
        var m = mk[k], t = m.w + m.l; return "<tr><td>" + esc(mkName(k)) + '</td><td class="c-win">' + m.w + '</td><td class="c-loss">' + m.l + "</td><td><b>" + Math.round(m.w / t * 100) + "%</b></td></tr>";
      }).join("") + "</tbody></table>" : empty(T("r_empty"));
      var days = (sum.by_day || []).filter(function (d) { return d.total; });
      $("chart-acc").innerHTML = days.length ? lineChart(days) : '<div class="muted small">—</div>';
      $("chart-wl").innerHTML = wlChart(s.won || 0, s.lost || 0);
      $("report-list").innerHTML = picks.length ? '<div class="list">' + picks.map(function (p) {
        return '<div class="lrow ' + (p.result ? "win" : "loss") + '"><div><b>' + esc(p.match) + '</b><div class="muted small">' + esc(mkName(p.market)) + " · " + esc(p.probability) + "% · " + fmtDay(p.kickoff) + (p.ft ? " · FT " + esc(p.ft) : "") + '</div></div><div class="lrow-r">' + resultBadge(p.result) + "</div></div>";
      }).join("") + "</div>" : empty(T("r_empty"));
      var ts = ten && ten.summary, tp = (ten && ten.picks) || [];
      $("report-tennis-kpis").innerHTML = kpi(ts ? ts.total : 0, T("r_total")) + kpi(ts ? ts.won : 0, T("r_won"), "win") + kpi(ts ? ts.lost : 0, T("r_lost"), "loss") + kpi(ts && ts.total ? ts.accuracy + "%" : "—", T("r_acc"), "accent");
      $("report-tennis-list").innerHTML = tp.length ? '<div class="list">' + tp.slice().reverse().map(function (p) {
        return '<div class="lrow"><div><b>' + esc(p.pick) + '</b> <span class="muted">· ' + esc(p.match) + '</span><div class="muted small">' + esc(p.date) + " · " + esc(p.tournament || "") + '</div></div><div class="lrow-r"><span class="prob-s">' + esc(p.probability) + "%</span>" + resultBadge(p.result) + "</div></div>";
      }).join("") + "</div>" : "";
    }).catch(function (e) { fail($("report-list"), e); });
  }
  function lineChart(days) {
    var W = 320, H = 150, pad = 24, n = days.length;
    var pts = days.map(function (d, i) { var x = n === 1 ? W / 2 : pad + i * (W - 2 * pad) / (n - 1); var y = H - pad - (d.won / d.total) * (H - 2 * pad); return [x, y, d]; });
    var path = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    return '<svg viewBox="0 0 ' + W + " " + H + '" class="svg-chart" role="img"><line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - pad) + '" y2="' + (H - pad) + '" class="ax"/><line x1="' + pad + '" y1="' + pad + '" x2="' + (W - pad) + '" y2="' + pad + '" class="grid"/>' +
      '<text x="2" y="' + (pad + 4) + '" class="lbl">100%</text><text x="8" y="' + (H - pad + 4) + '" class="lbl">0%</text>' +
      (n > 1 ? '<path d="' + path + '" class="ln"/>' : "") + pts.map(function (p) {
        return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" class="pt"><title>' + p[2].date + ": " + p[2].won + "/" + p[2].total + '</title></circle><text x="' + p[0].toFixed(1) + '" y="' + (H - 6) + '" class="lbl" text-anchor="middle">' + p[2].date.slice(8) + "/" + p[2].date.slice(5, 7) + "</text>";
      }).join("") + "</svg>";
  }
  function wlChart(w, l) {
    var m = Math.max(w, l, 1);
    return '<div class="wl"><div class="wl-col"><div class="wl-bar"><i class="w" style="height:' + (w / m * 100) + '%"></i></div><b>' + w + "</b><span>" + T("r_won") + '</span></div><div class="wl-col"><div class="wl-bar"><i class="l" style="height:' + (l / m * 100) + '%"></i></div><b>' + l + "</b><span>" + T("r_lost") + "</span></div></div>";
  }

  /* ================= ARCHIVIO ================= */
  var A = { day: romeDate(-1), open: {}, inj: {} };
  function loadArchive() {
    var inp = $("archive-date"); inp.max = romeDate(1); inp.value = A.day;
    inp.onchange = function () { if (inp.value) { A.day = inp.value; renderArchive(); } };
    $("archive-prev").onclick = function () { A.day = shiftDate(A.day, -1); inp.value = A.day; renderArchive(); };
    $("archive-next").onclick = function () { if (A.day < romeDate(1)) { A.day = shiftDate(A.day, 1); inp.value = A.day; renderArchive(); } };
    get("/history", 300000).then(function (h) {
      var box = $("archive-days");
      box.innerHTML = (h.days || []).slice(0, 45).map(function (d) { return '<button type="button" class="chip' + (d === A.day ? " on" : "") + '" data-d="' + d + '">' + fmtDay(d) + "</button>"; }).join("");
      box.onclick = function (e) { var b = e.target.closest ? e.target.closest("[data-d]") : null; if (!b) return; A.day = b.getAttribute("data-d"); inp.value = A.day; renderArchive(); };
    }).catch(function () {});
    renderArchive();
  }
  function renderArchive() {
    var chips = document.querySelectorAll("#archive-days .chip");
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle("on", chips[i].getAttribute("data-d") === A.day);
    var pb = $("archive-picks"), mb = $("archive-matches"); pb.removeAttribute("data-loaded"); mb.removeAttribute("data-loaded"); loading(pb); loading(mb);
    var day = A.day;
    Promise.all([get("/history?date=" + day), get("/tennis?date=" + day + "&exact=1").catch(function () { return {}; }), get("/details?date=" + day, 300000).catch(function () { return {}; }), get("/injuries?date=" + day, 600000).catch(function () { return {}; })]).then(function (r) {
      A.inj = r[3] || {};
      if (day !== A.day) return;
      var h = r[0] || {}, t = r[1] || {}, det = r[2] || {};
      var fx = sortFx(h.fixtures || []), picks = h.picks || [], tp = (t.date === day && t.picks) || [];
      var won = picks.filter(function (p) { return p.result === true; }).length, lost = picks.filter(function (p) { return p.result === false; }).length;
      $("archive-kpis").innerHTML = kpi(fx.length, T("k_matches")) + kpi(picks.length, T("top_pick")) + kpi(picks.length ? won + " / " + lost : "—", T("k_wl")) + kpi(tp.length, "🎾 " + T("k_picks"));
      var html = picks.length ? '<div class="list">' + picks.sort(function (a, b) { return new Date(a.kickoff) - new Date(b.kickoff); }).map(function (p) {
        return '<div class="lrow"><div><b>' + esc(mkName(p.market)) + '</b> <span class="muted">· ' + esc(p.match) + '</span><div class="muted small">' + fmtTime(p.kickoff) +  " · " + esc(trLeague(p.league)) + (p.ft ? " · FT " + esc(p.ft) : "") + '</div></div><div class="lrow-r"><span class="prob-s">' + esc(p.probability) + "%</span>" + resultBadge(p.void ? "void" : p.result) + "</div></div>";
      }).join("") + "</div>" : "";
      if (tp.length) html += '<div class="cards" style="margin-top:12px">' + tp.map(tennisCard).join("") + "</div>";
      pb.innerHTML = html || empty(T("no_picks_day"));
      mb.innerHTML = fx.length ? groupByLeague(fx, function (f) { return liveRow(f, !!A.open[f.fixture.id], det[f.fixture.id] || null, "adet-"); }, countBy(fx)) : empty(T("no_data"));
      mb.onclick = function (e) {
        var row = e.target.closest ? e.target.closest(".mrow") : null; if (!row) return;
        var id = row.getAttribute("data-fid"); A.open[id] = !A.open[id]; row.classList.toggle("open", A.open[id]);
        var box = $("adet-" + id), f = fx.filter(function (x) { return String(x.fixture.id) === id; })[0];
        if (box) { box.hidden = !A.open[id]; if (A.open[id] && f) box.innerHTML = detailHtml(f, det[id], injFor(A.inj, id)); }
      };
    }).catch(function (e) { fail(pb, e); mb.innerHTML = ""; });
  }

  /* ---------- navigazione a pagine ---------- */
  var VIEWS = ["home", "predictions", "tennis", "report", "archive", "method"];
  var LOADERS = { home: loadHome, predictions: loadPred, tennis: loadTennis, report: loadReport, archive: loadArchive };
  var loaded = {}, current = null;
  function route(force) {
    var h = (location.hash || "#home").slice(1);
    var v = VIEWS.indexOf(h) >= 0 ? h : (h === "live" || h === "top-picks" ? "home" : "home");
    VIEWS.forEach(function (x) { $("view-" + x).hidden = x !== v; });
    var links = document.querySelectorAll(".nav a");
    for (var i = 0; i < links.length; i++) links[i].classList.toggle("active", links[i].getAttribute("data-go") === v);
    closeNav();
    if (LOADERS[v] && (force === true || !loaded[v] || Date.now() - loaded[v] > 120000)) { loaded[v] = Date.now(); LOADERS[v](); }
    if (v === "home" && pendingMatch) { var pm = pendingMatch; pendingMatch = null; setTimeout(function () { goToMatch(pm[0], pm[1]); }, 300); }
    else if (h === "live") setTimeout(function () { $("live").scrollIntoView(); }, 50);
    else if (current !== v) window.scrollTo(0, 0);
    current = v;
  }
  function closeNav() { $("nav").classList.remove("open"); $("nav-toggle").setAttribute("aria-expanded", "false"); }

  function init() {
    $("year").textContent = new Date().getFullYear();
    $("nav-toggle").addEventListener("click", function (e) { e.stopPropagation(); var n = $("nav"), o = !n.classList.contains("open"); n.classList.toggle("open", o); this.setAttribute("aria-expanded", o ? "true" : "false"); });
    document.addEventListener("click", function (e) { var n = $("nav"); if (n.classList.contains("open") && !n.contains(e.target)) closeNav(); });
    $("theme-toggle").addEventListener("click", function () {
      var root = document.documentElement, cur = root.getAttribute("data-theme");
      if (!cur) cur = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      var next = cur === "dark" ? "light" : "dark"; root.setAttribute("data-theme", next); try { localStorage.setItem("pbp-theme", next); } catch (e) {}
    });
    $("lang").addEventListener("change", function () { try { localStorage.setItem("pbp-lang", this.value); } catch (e) {} setLang(this.value, true); });
    $("m-search").addEventListener("input", function () { M.limit = PAGE; renderLive(); });
    $("p-search").addEventListener("input", function () { P.limit = PAGE; renderPred(); });
    $("tn-search").addEventListener("input", function () { TN.limit = PAGE; renderTennis(); });
    $("report-range").addEventListener("change", loadReport);
    $("cta-live").addEventListener("click", function (e) { e.preventDefault(); $("live").scrollIntoView({ behavior: "smooth" }); });
    if (wide.addEventListener) wide.addEventListener("change", function () { if (current === "predictions") renderPred(); });
    var top = $("back-to-top");
    window.addEventListener("scroll", function () { top.classList.toggle("show", window.pageYOffset > 500); }, { passive: true });
    top.addEventListener("click", function () { window.scrollTo(0, 0); });
    window.addEventListener("hashchange", function () { route(); });
    pickLang(function (l) { setLang(l, false); route(); });
    get("/status", 120000).then(function (s) {
      var t = s.last && (s.last.finished || s.last.started);
      $("api-status").textContent = t ? T("data_ref") + ": " + new Date(t).toLocaleString(loc(), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
    }).catch(function () {});
    // aggiornamento automatico della home (i dati cambiano al massimo ogni 15')
    setInterval(function () {
      if (document.hidden || (current !== "home" && current !== "tennis")) return;
      cache = {}; if (current === "home") loadHome(); else loadTennis();
    }, 120000);
  }
  document.addEventListener("DOMContentLoaded", init);
})();
