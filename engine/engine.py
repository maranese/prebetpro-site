"""
PreBetPro Engine — eseguito da GitHub Actions ogni 30 minuti.

Calcio:  probabilità dal consenso di mercato (quote Pinnacle senza margine, metodo "power"),
         adattate a una griglia Dixon-Coles (1X2 + linea gol più vicina a 2.5),
         corrette con lo scarto storico per mercato (backtest 2023-26).
Tennis:  probabilità del favorito dalla moneyline senza margine; selezione 68-82%,
         margine <= 6%, solo tabelloni principali ATP / WTA / Challenger (no ITF, qualificazioni, doppio).
Esiti tennis: vinto/perso se il giocatore compare nel turno successivo dello stesso torneo.

Invia i risultati al Worker (POST /admin/pin, /admin/tennis) con il token ADMIN_TOKEN.
"""
import json, os, sys, time, datetime as dt, re, unicodedata
from zoneinfo import ZoneInfo
import numpy as np
import requests
from scipy.stats import poisson
from scipy.optimize import minimize, brentq

PIN = "https://guest.api.arcadia.pinnacle.com/0.1"
WORKER = os.environ.get("WORKER_URL", "https://prebetpro-api.vincenzodiguida.workers.dev").rstrip("/")
TOKEN = os.environ.get("ADMIN_TOKEN", "")
TZ = ZoneInfo("Europe/Rome")
NOW = dt.datetime.now(dt.timezone.utc)
UA = {"User-Agent": "Mozilla/5.0 (PreBetPro engine)", "Accept": "application/json"}

# Pinnacle league id -> (API-Football league id, nome, paese)
LEAGUES = {
    2436: (135, "Serie A", "Italy"), 2438: (136, "Serie B", "Italy"),
    1980: (39, "Premier League", "England"), 1977: (40, "Championship", "England"), 1957: (41, "League One", "England"),
    2196: (140, "La Liga", "Spain"), 2432: (141, "Segunda División", "Spain"),
    1842: (78, "Bundesliga", "Germany"), 1843: (79, "2. Bundesliga", "Germany"),
    2036: (61, "Ligue 1", "France"), 2037: (62, "Ligue 2", "France"),
    1928: (88, "Eredivisie", "Netherlands"), 1929: (89, "Eerste Divisie", "Netherlands"),
    2386: (94, "Primeira Liga", "Portugal"), 2387: (95, "Liga Portugal 2", "Portugal"),
    1817: (144, "Jupiler Pro League", "Belgium"), 2592: (203, "Süper Lig", "Turkey"),
    2421: (179, "Premiership", "Scotland"), 10419: (307, "Pro League", "Saudi-Arabia"),
    2627: (2, "UEFA Champions League", "World"), 2630: (3, "UEFA Europa League", "World"),
    214101: (848, "UEFA Conference League", "World"),
}
# scarto storico (frequenza osservata - probabilità di mercato) per mercato, backtest 2023-26
CORR = {"1": .0344, "2": .0371, "X": 0.0, "1X": .0352, "X2": .0400, "12": -.0116, "Over 1.5": .0129,
        "Over 2.5": .0400, "Under 2.5": -.0030, "Under 3.5": .0147, "Gol": .0377, "NoGol": .0166}
# mercati candidabili come pick: etichetta -> chiave
PICK_KEYS = {"1": "home_win", "2": "away_win", "1X": "dc_1x", "X2": "dc_x2", "Over 1.5": "over_15",
             "Over 2.5": "over_25", "Under 2.5": "under_25", "Under 3.5": "under_35", "Gol": "btts", "NoGol": "no_btts"}
PICK_MIN, PICK_MAX, MAX_MARGIN = 0.60, 0.77, 0.06   # quota equa 1.30-1.67: niente quote troppo basse
STRENGTH = {"home_win": 70, "draw": 60, "away_win": 70, "dc_1x": 68, "dc_x2": 68, "dc_12": 72,
            "over_15": 72, "over_25": 68, "under_25": 65, "btts": 69, "no_btts": 66}

K = np.arange(11); I, J = np.meshgrid(K, K, indexing="ij")


def get(url, tries=3):
    for i in range(tries):
        try:
            r = requests.get(url, headers=UA, timeout=60)
            if r.status_code == 200:
                return r.json()
        except Exception as e:
            print("GET error", url, e)
        time.sleep(3 * (i + 1))
    return None


def dec(a):
    return 1 + a / 100 if a > 0 else 1 + 100 / abs(a)


def power(odds):
    k = brentq(lambda k: sum((1 / x) ** k for x in odds) - 1, 0.3, 4)
    return [(1 / x) ** k for x in odds]


def grid(l1, l2, r=-0.06):
    G = np.outer(poisson.pmf(K, l1), poisson.pmf(K, l2))
    G[0, 0] *= 1 - l1 * l2 * r; G[0, 1] *= 1 + l1 * r; G[1, 0] *= 1 + l2 * r; G[1, 1] *= 1 - r
    return G / G.sum()


def fit(p1, px, p2, line=None, po=None):
    def loss(x):
        G = grid(np.exp(x[0]), np.exp(x[1]))
        e = (G[I > J].sum() - p1) ** 2 + (np.trace(G) - px) ** 2 + (G[I < J].sum() - p2) ** 2
        if po is not None:
            e += 2 * (G[I + J > line].sum() - po) ** 2
        return e
    s = minimize(loss, [0.3, 0.1], method="Nelder-Mead", options={"xatol": 1e-6, "fatol": 1e-10})
    return np.exp(s.x)


def mk(G):
    T = I + J
    m = {"1": G[I > J].sum(), "X": np.trace(G), "2": G[I < J].sum()}
    m.update({"1X": m["1"] + m["X"], "X2": m["X"] + m["2"], "12": m["1"] + m["2"]})
    m.update({"Over 1.5": G[T > 1.5].sum(), "Under 1.5": G[T < 1.5].sum(), "Over 2.5": G[T > 2.5].sum(),
              "Under 2.5": G[T < 2.5].sum(), "Under 3.5": G[T < 3.5].sum()})
    m["Gol"] = G[(I > 0) & (J > 0)].sum(); m["NoGol"] = 1 - m["Gol"]
    return {k: float(v) for k, v in m.items()}


def rome(ts):
    return ts.astimezone(TZ)


# ------------------------------------------------------------------ CALCIO
def football():
    days = {}
    for pid, (afid, lname, country) in LEAGUES.items():
        M = get(f"{PIN}/leagues/{pid}/matchups")
        if not M:
            continue
        main = {}
        for m in M:
            if m.get("type") != "matchup" or m.get("parent") or m.get("isLive") or len(m.get("participants", [])) != 2:
                continue
            st = dt.datetime.fromisoformat(m["startTime"].replace("Z", "+00:00"))
            if not (NOW < st < NOW + dt.timedelta(hours=40)):
                continue
            n = {p["alignment"]: p["name"] for p in m["participants"]}
            if not n.get("home") or not n.get("away"):
                continue
            main[m["id"]] = dict(st=st, home=n["home"], away=n["away"], ml={}, tot={})
        if not main:
            continue
        K_ = get(f"{PIN}/leagues/{pid}/markets/straight") or []
        for k in K_:
            r = main.get(k.get("matchupId"))
            if r is None or k.get("period") != 0:
                continue
            if k["type"] == "moneyline":
                for p in k["prices"]:
                    if p.get("designation"):
                        r["ml"][p["designation"]] = dec(p["price"])
            elif k["type"] == "total":
                pts = k["prices"][0].get("points")
                if pts is not None and pts % 1 == 0.5:
                    r["tot"][pts] = {p["designation"]: dec(p["price"]) for p in k["prices"]}
        for mid, r in main.items():
            if not all(x in r["ml"] for x in ("home", "draw", "away")):
                continue
            o = [r["ml"]["home"], r["ml"]["draw"], r["ml"]["away"]]
            margin = sum(1 / x for x in o) - 1
            p1, px, p2 = power(o)
            lines = [l for l, v in r["tot"].items() if "over" in v and "under" in v]
            line = 2.5 if 2.5 in lines else (min(lines, key=lambda l: abs(l - 2.5)) if lines else None)
            po = power([r["tot"][line]["over"], r["tot"][line]["under"]])[0] if line else None
            l1, l2 = fit(p1, px, p2, line, po)
            m = mk(grid(l1, l2))
            pct = lambda x: int(round(100 * x))
            P = {"home_win": pct(m["1"]), "draw": pct(m["X"]), "away_win": pct(m["2"]),
                 "double_chance": {"1x": pct(m["1X"]), "x2": pct(m["X2"]), "12": pct(m["12"])},
                 "over_15": pct(m["Over 1.5"]), "under_15": pct(m["Under 1.5"]), "over_25": pct(m["Over 2.5"]),
                 "under_25": pct(m["Under 2.5"]), "under_35": pct(m["Under 3.5"]), "btts": pct(m["Gol"]),
                 "no_btts": pct(m["NoGol"]), "expected_goals": {"home": round(float(l1), 2), "away": round(float(l2), 2)}}
            flat = {"home_win": P["home_win"], "draw": P["draw"], "away_win": P["away_win"], "dc_1x": P["double_chance"]["1x"],
                    "dc_x2": P["double_chance"]["x2"], "dc_12": P["double_chance"]["12"], "over_15": P["over_15"],
                    "over_25": P["over_25"], "under_25": P["under_25"], "btts": P["btts"], "no_btts": P["no_btts"]}
            P["strength"] = {k: flat[k] >= v for k, v in STRENGTH.items()}
            pick = None
            if margin <= MAX_MARGIN:
                cands = []
                for label, key in PICK_KEYS.items():
                    pc = min(0.97, m[label] + CORR.get(label, 0))
                    if PICK_MIN <= pc <= PICK_MAX:
                        cands.append((pc, label, key, m[label]))
                if cands:
                    pc, label, key, praw = max(cands)
                    pick = {"market": label, "key": key, "value": int(round(100 * pc)), "p_market": round(praw, 3),
                            "fair_odds": round(1 / pc, 2), "min_odds": round(1.03 / pc, 2)}
            st = rome(r["st"])
            fx = {"fixture": {"id": f"p{mid}", "date": st.isoformat(), "timestamp": int(r["st"].timestamp()),
                              "status": {"short": "NS", "long": "Not Started", "elapsed": None}},
                  "league": {"id": afid, "name": lname, "country": country,
                             "logo": f"https://media.api-sports.io/football/leagues/{afid}.png"},
                  "teams": {"home": {"name": r["home"], "logo": ""}, "away": {"name": r["away"], "logo": ""}},
                  "goals": {"home": None, "away": None}, "score": {"fulltime": {"home": None, "away": None}},
                  "predictions": P, "confidence": "high" if margin <= 0.045 else "medium" if margin <= MAX_MARGIN else "low",
                  "pick": pick, "margin": round(margin, 3), "source": "pinnacle"}
            days.setdefault(st.strftime("%Y-%m-%d"), []).append(fx)
    return days


# ------------------------------------------------------------------ TENNIS
def norm(s):
    s = unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z ]", " ", s).split()


def same_player(a, b):
    A, B = norm(a), norm(b)
    return bool(A and B and A[-1] == B[-1] and (A[0][0] == B[0][0]))


def tennis():
    M = get(f"{PIN}/sports/33/matchups") or []
    Kt = get(f"{PIN}/sports/33/markets/straight?primaryOnly=false") or []
    info, allm = {}, []
    for m in M:
        if m.get("type") != "matchup" or m.get("parent") or len(m.get("participants", [])) != 2:
            continue
        n = {p["alignment"]: p["name"] for p in m["participants"]}
        lg = m["league"]["name"]
        allm.append((lg, n.get("home", ""), n.get("away", ""), m.get("isLive", False)))
        st = dt.datetime.fromisoformat(m["startTime"].replace("Z", "+00:00"))
        if m.get("isLive") or not (NOW < st < NOW + dt.timedelta(hours=30)):
            continue
        info[m["id"]] = dict(lg=lg, p1=n.get("home"), p2=n.get("away"), st=st)
    new = []
    for k in Kt:
        r = info.get(k.get("matchupId"))
        if not r or k["type"] != "moneyline" or k["period"] != 0:
            continue
        o = {p["designation"]: dec(p["price"]) for p in k["prices"] if p.get("designation")}
        if "home" not in o or "away" not in o:
            continue
        mg = 1 / o["home"] + 1 / o["away"] - 1
        ph = (1 / o["home"]) / (1 + mg)
        fav, opp, p = (r["p1"], r["p2"], ph) if ph >= .5 else (r["p2"], r["p1"], 1 - ph)
        L = r["lg"]
        ok_tour = any(t in L for t in ("ATP", "WTA", "Challenger"))
        if not (ok_tour and 0.68 <= p <= 0.82 and mg <= MAX_MARGIN and "ITF" not in L and "Qualif" not in L
                and "Doubles" not in L and "/" not in fav and "/" not in opp):
            continue
        st = rome(r["st"])
        new.append({"id": k["matchupId"], "day": st.strftime("%d/%m"), "time": st.strftime("%H:%M"),
                    "start": r["st"].isoformat(), "date": st.strftime("%Y-%m-%d"), "tournament": L.replace(" - ", " · "),
                    "league_raw": L, "match": f"{r['p1']} vs {r['p2']}", "pick": fav, "opponent": opp,
                    "probability": int(round(100 * p)), "fair_odds": round(1 / p, 2), "min_odds": round(1.03 / p, 2),
                    "margin": round(mg, 3)})
    return new, allm


def grade(pick, allm):
    """vinto/perso se uno dei due compare in un turno successivo dello stesso torneo"""
    base = pick.get("league_raw", "").rsplit(" - ", 1)[0]
    for lg, a, b, live in allm:
        if lg == pick.get("league_raw") or lg.rsplit(" - ", 1)[0] != base:
            continue
        for name in (a, b):
            if same_player(name, pick["pick"]):
                return True
            if same_player(name, pick["opponent"]):
                return False
    return None


def worker_get(path):
    try:
        r = requests.get(WORKER + path, timeout=30)
        return r.json() if r.status_code == 200 else None
    except Exception:
        return None


def worker_post(path, body):
    r = requests.post(WORKER + path, json=body, headers={"x-admin-token": TOKEN}, timeout=60)
    print("POST", path, r.status_code, r.text[:200])
    return r.status_code == 200


def main():
    if not TOKEN:
        sys.exit("ADMIN_TOKEN mancante")
    # calcio
    days = football()
    for d, fx in sorted(days.items()):
        worker_post("/admin/pin", {"date": d, "fixtures": fx})
    # tennis: unisce con quanto già pubblicato, congela ciò che è iniziato, valuta gli esiti
    new, allm = tennis()
    today = rome(NOW).date()
    for off in (-2, -1, 0, 1):
        d = (today + dt.timedelta(days=off)).isoformat()
        cur = worker_get(f"/tennis?date={d}&exact=1") or {}
        legacy = [p for p in cur.get("picks", []) if cur.get("date") == d and "id" not in p]
        old = {p["id"]: p for p in cur.get("picks", []) if cur.get("date") == d and "id" in p}
        changed = False
        for p in new:
            if p["date"] != d:
                continue
            if p["id"] in old and old[p["id"]].get("result") is not None:
                continue
            if old.get(p["id"]) != p:
                old[p["id"]] = {**old.get(p["id"], {}), **p}; changed = True
        for p in old.values():
            started = dt.datetime.fromisoformat(p["start"]) < NOW
            if started and p.get("result") is None:
                g = grade(p, allm)
                age_h = (NOW - dt.datetime.fromisoformat(p["start"])).total_seconds() / 3600
                if g is not None:
                    p["result"] = g; changed = True
                elif age_h > 72:
                    p["result"] = "void"; p["void_reason"] = "esito non verificabile"; changed = True
        if changed or (old and off >= 0):
            worker_post("/admin/tennis", {"date": d, "picks": legacy + sorted(old.values(), key=lambda x: x["start"])})
    print("calcio:", {d: len(v) for d, v in days.items()}, "| tennis nuove:", len(new))


if __name__ == "__main__":
    main()
