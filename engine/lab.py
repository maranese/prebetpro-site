"""
PreBetPro Lab – motore tennis SPERIMENTALE (studio, non consiglio).
Gira 3 volte al giorno su GitHub Actions. Nessuna chiamata API a pagamento:
 - storico: archivio pubblico Sackmann (mirror HuggingFace, CC BY-NC-SA 4.0, uso non commerciale);
 - risultati recenti: quelli già raccolti dal Worker (/tennis/matches);
 - partite in programma e quote: Pinnacle (pubblico), solo per confronto e scelta dei pick.
Ogni pick sperimentale viene registrato UNA volta, prima dell'inizio, e non viene più modificato.
"""
import os, sys, json, time, math, datetime as dt, urllib.request
from zoneinfo import ZoneInfo
import numpy as np
import requests
from lab_model import load_archive, build, fit_lr, sigmoid, norm, surf_code, State

WORKER = os.environ.get("WORKER_URL", "https://prebetpro.com/api").rstrip("/")
TOKEN = os.environ.get("ADMIN_TOKEN", "")
DATA = os.environ.get("LAB_DATA", "lab_data")
HF = "https://huggingface.co/datasets/Aneeshers/tennis-sackmann-archive/resolve/main/"
PIN = "https://guest.api.arcadia.pinnacle.com/0.1"
UA = {"User-Agent": "Mozilla/5.0 (PreBetPro lab)", "Accept": "application/json"}
TZ = ZoneInfo("Europe/Rome"); NOW = dt.datetime.now(dt.timezone.utc)
COLS = [0, 1, 2, 4]                       # Elo, Elo superficie, classifica, scontri diretti (scelti col backtest 2025-26)
PICK_MIN_P, PICK_MIN_EDGE, PICK_MAX_EDGE, PICK_MIN_ODDS, PICK_MIN_N = 0.55, 0.03, 0.15, 1.50, 20   # scarto oltre 15 punti dal mercato = probabile errore del modello (dati vecchi)
LAB_START = dt.date(2026, 11, 20)          # primi risultati raccolti dal Worker


def get(url, tries=3, js=True):
    for i in range(tries):
        try:
            r = requests.get(url, headers=UA, timeout=60)
            if r.status_code == 200:
                return r.json() if js else r.content
        except Exception as e:
            print("GET error", url, e)
        time.sleep(2 * (i + 1))
    return None


def ensure_archive():
    os.makedirs(DATA, exist_ok=True)
    yrs = range(2019, NOW.year + 1)
    for y in yrs:
        for f in (f"atp/atp_matches_{y}.csv", f"atp/atp_matches_qual_chall_{y}.csv", f"atp/atp_matches_futures_{y}.csv",
                  f"wta/wta_matches_{y}.csv", f"wta/wta_matches_qual_itf_{y}.csv"):
            p = os.path.join(DATA, os.path.basename(f))
            if os.path.exists(p) and os.path.getsize(p) > 1000 and y < NOW.year:
                continue
            b = get(HF + f, js=False)
            if b and len(b) > 1000:
                open(p, "wb").write(b)


def worker_get(path):
    try:
        r = requests.get(WORKER + path, timeout=30); return r.json() if r.status_code == 200 else None
    except Exception:
        return None


def worker_post(path, body):
    if os.environ.get("LAB_DRY") == "1":
        print("DRY POST", path, len(json.dumps(body))); open("/tmp/claude-0/lab_" + body["key"].replace(":", "_") + ".json", "w").write(json.dumps(body["doc"])); return True
    r = requests.post(WORKER + path, json=body, headers={"x-admin-token": TOKEN}, timeout=60)
    print("POST", path, r.status_code, r.text[:160]); return r.status_code == 200


def collected_results():
    """Risultati con vincitore raccolti dal Worker dal LAB_START a ieri/oggi (nessuna chiamata a pagamento)."""
    out, ranks, surf = [], {}, {}
    d = LAB_START; end = NOW.astimezone(TZ).date() + dt.timedelta(days=1)
    while d <= end:
        r = worker_get(f"/tennis/matches?date={d.isoformat()}") or {}
        for x in r.get("matches", []):
            if x.get("db") or len(x.get("p", [])) != 2:
                continue
            a, b = norm(x["p"][0].get("n")), norm(x["p"][1].get("n"))
            if not a or not b:
                continue
            for p in x["p"]:
                if p.get("rk"): ranks[norm(p.get("n"))] = int(p["rk"])
            surf[(a, b)] = surf[(b, a)] = surf_code(x.get("sf"))
            if x.get("fin") and x.get("w") in (1, 2):
                w, l = (a, b) if x["w"] == 1 else (b, a)
                out.append(dict(d=d, w=w, l=l, s=surf_code(x.get("sf")), ret=False, ts=x.get("ts") or ""))
        d += dt.timedelta(days=1)
    out.sort(key=lambda r: r["ts"])
    return out, ranks, surf


def pinnacle():
    M = get(f"{PIN}/sports/33/matchups") or []
    K = get(f"{PIN}/sports/33/markets/straight?primaryOnly=false") or []
    info, allm = {}, []
    for m in M:
        if m.get("type") != "matchup" or m.get("parent") or len(m.get("participants", [])) != 2:
            continue
        n = {p["alignment"]: p["name"] for p in m["participants"]}
        lg = m["league"]["name"]; allm.append((lg, n.get("home", ""), n.get("away", "")))
        st = dt.datetime.fromisoformat(m["startTime"].replace("Z", "+00:00"))
        if m.get("isLive") or not (NOW < st < NOW + dt.timedelta(hours=30)):
            continue
        if "Doubles" in lg or "/" in (n.get("home", "") + n.get("away", "")):
            continue
        info[m["id"]] = dict(lg=lg, a=n.get("home"), b=n.get("away"), st=st)
    out = []
    for k in K:
        r = info.get(k.get("matchupId"))
        if not r or k["type"] != "moneyline" or k["period"] != 0:
            continue
        o = {p["designation"]: (1 + p["price"] / 100 if p["price"] > 0 else 1 + 100 / abs(p["price"])) for p in k["prices"] if p.get("designation")}
        if "home" in o and "away" in o:
            out.append({**r, "id": k["matchupId"], "oa": round(o["home"], 3), "ob": round(o["away"], 3)})
    return out, allm


def tour_of(lg):
    L = lg.lower()
    return "itf" if "itf" in L else "challenger" if "challenger" in L else "wta" if "wta" in L else "atp" if "atp" in L else "other"


def resolve(name, known):
    n = norm(name)
    if n in known:
        return n
    p = n.split()
    if len(p) >= 2:   # "Cognome Nome" o nomi composti: prova l'unico giocatore con stesso cognome e iniziale
        cands = [k for k in known if k.split()[-1] == p[-1] and k[0] == n[0]]
        if len(cands) == 1:
            return cands[0]
    return None


def grade(pr, res_map, allm):
    a, b = pr["na"], pr["nb"]
    if (a, b) in res_map: return res_map[(a, b)]
    if (b, a) in res_map: return 1 - res_map[(b, a)]
    base = pr["lg"].rsplit(" - ", 1)[0]
    for lg, x, y in allm:   # chi compare nel turno successivo dello stesso torneo ha vinto
        if lg == pr["lg"] or lg.rsplit(" - ", 1)[0] != base:
            continue
        for nm in (x, y):
            if norm(nm) == a: return 1
            if norm(nm) == b: return 0
    return None


def main():
    if not TOKEN:
        sys.exit("ADMIN_TOKEN mancante")
    t0 = time.time(); ensure_archive()
    rows = load_archive(DATA); print("archivio", len(rows), rows[-1]["d"] if rows else None)
    st, X, y, meta = build(rows, collect_from=dt.date(2022, 1, 1))
    w = fit_lr(X[:, COLS], y); print("pesi", np.round(w, 3))
    rec, ranks, surf = collected_results()
    res_map = {}
    for r in rec:   # aggiorna il modello con i risultati raccolti (ordine temporale)
        st.update(r["w"], r["l"], r["s"], r["d"], ranks.get(r["w"]), ranks.get(r["l"]))
        res_map[(r["w"], r["l"])] = 1
    for k, v in ranks.items(): st.rank[k] = v      # classifica attuale (dal Worker) per colmare il buco dell'archivio
    known = set(st.n.keys())
    mk, allm = pinnacle(); print("partite Pinnacle", len(mk), "risultati raccolti", len(rec))
    today = NOW.astimezone(TZ).date()
    docs = {}
    for off in (-3, -2, -1, 0, 1):
        d = (today + dt.timedelta(days=off)).isoformat()
        cur = worker_get(f"/lab?date={d}") or {}
        docs[d] = cur if cur.get("date") == d else {"date": d, "preds": {}}
    for m in mk:
        a, b = resolve(m["a"], known), resolve(m["b"], known)
        if not a or not b or a == b:
            continue
        s = surf.get((a, b), "H"); f = np.array(st.features(a, b, s, today))
        p = float(sigmoid(f[COLS] @ w))
        ia, ib = 1 / m["oa"], 1 / m["ob"]; mg = ia + ib - 1; qa = ia / (ia + ib)
        d = m["st"].astimezone(TZ).date().isoformat(); doc = docs.setdefault(d, {"date": d, "preds": {}})
        key = str(m["id"]); old = doc["preds"].get(key)
        if old and (old.get("pick") or dt.datetime.fromisoformat(old["st"]) <= NOW):
            continue                                   # pick già registrato o partita iniziata: congelato
        pr = {"st": m["st"].isoformat(), "lg": m["lg"], "tour": tour_of(m["lg"]), "a": m["a"], "b": m["b"], "na": a, "nb": b,
              "s": s, "p": round(p, 4), "q": round(qa, 4), "oa": m["oa"], "ob": m["ob"], "mg": round(mg, 3),
              "n": [st.n[a], st.n[b]], "at": NOW.isoformat()}
        side = "a" if p >= .5 else "b"; ps = p if side == "a" else 1 - p; qs = qa if side == "a" else 1 - qa
        odds = m["oa"] if side == "a" else m["ob"]
        if ps >= PICK_MIN_P and PICK_MIN_EDGE <= ps - qs <= PICK_MAX_EDGE and odds >= PICK_MIN_ODDS and min(st.n[a], st.n[b]) >= PICK_MIN_N and mg <= 0.08:
            pr["pick"] = {"side": side, "p": round(ps, 4), "q": round(qs, 4), "odds": odds, "at": NOW.isoformat()}
        doc["preds"][key] = pr
    # esiti
    for d, doc in docs.items():
        for key, pr in doc["preds"].items():
            if pr.get("res") is not None or dt.datetime.fromisoformat(pr["st"]) > NOW:
                continue
            g = grade(pr, res_map, allm)
            if g is not None:
                pr["res"] = g
            elif (NOW - dt.datetime.fromisoformat(pr["st"])).total_seconds() > 72 * 3600:
                pr["res"] = "nv"   # esito non verificabile con fonti gratuite
    # report (ultimi 60 giorni)
    allp = []
    for i in range(60):
        d = (today - dt.timedelta(days=i)).isoformat()
        doc = docs.get(d) or (worker_get(f"/lab?date={d}") if (today - dt.timedelta(days=i)) >= LAB_START else None) or {}
        for pr in (doc.get("preds") or {}).values():
            if pr.get("res") in (0, 1):
                allp.append(pr)
    def stats(L, pk=False):
        if not L: return {"n": 0}
        P = np.array([(x["pick"]["p"] if pk else max(x["p"], 1 - x["p"])) for x in L])
        H = np.array([(x["res"] if (x["pick"]["side"] if pk else ("a" if x["p"] >= .5 else "b")) == "a" else 1 - x["res"]) for x in L])
        Qm = np.array([(x["pick"]["q"] if pk else (x["q"] if x["p"] >= .5 else 1 - x["q"])) for x in L])
        out = {"n": len(L), "hit": round(float(H.mean()), 4), "avg_p": round(float(P.mean()), 4), "avg_market": round(float(Qm.mean()), 4),
               "brier": round(float(np.mean((P - H) ** 2)), 4)}
        if pk:
            O = np.array([x["pick"]["odds"] for x in L]); out["roi"] = round(float(np.mean(np.where(H == 1, O - 1, -1))), 4); out["avg_odds"] = round(float(O.mean()), 3)
        mh = np.array([(x["res"] if x["q"] >= .5 else 1 - x["res"]) for x in L]); out["market_hit"] = round(float(mh.mean()), 4)
        return out
    report = {"upd": NOW.isoformat(), "since": LAB_START.isoformat(), "all": stats(allp), "picks": stats([x for x in allp if x.get("pick")], True),
              "params": {"weights": [round(float(v), 4) for v in w], "cols": ["elo", "elo_surface", "rank", "h2h"], "min_p": PICK_MIN_P, "min_edge": PICK_MIN_EDGE, "max_edge": PICK_MAX_EDGE, "min_odds": PICK_MIN_ODDS, "min_matches": PICK_MIN_N},
              "archive_until": rows[-1]["d"].isoformat() if rows else None, "results_collected": len(rec)}
    for d, doc in sorted(docs.items()):
        if doc["preds"]:
            doc["upd"] = NOW.isoformat(); worker_post("/admin/lab", {"key": f"lab:{d}", "doc": doc})
    worker_post("/admin/lab", {"key": "lab:report", "doc": report})
    print("fatto in", round(time.time() - t0), "s; pick oggi:", sum(1 for x in docs.get(today.isoformat(), {"preds": {}})["preds"].values() if x.get("pick")))


if __name__ == "__main__":
    main()
