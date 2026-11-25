"""
PreBetPro Engine — eseguito da GitHub Actions ogni 30 minuti: solo tennis (il calcio lo calcola il Worker).

Tennis:  probabilità dalla moneyline Pinnacle senza margine; Top Picks 68-82%, margine <= 6%,
         solo tabelloni principali ATP / WTA / Challenger (no ITF, qualificazioni, doppio).
         "Tutti i pronostici": vincente, totale e handicap di set e game per ogni singolare (stessa risposta Pinnacle).
Esiti tennis: vinto/perso se il giocatore compare nel turno successivo dello stesso torneo.

Invia i risultati al Worker (POST /admin/tennis, /admin/tennis-all) con il token ADMIN_TOKEN.
(26/11: rimosso il vecchio calcolo calcio Pinnacle, disattivato da tempo; resta nella cronologia GitHub.)
"""
import os, sys, time, datetime as dt, re, unicodedata
from zoneinfo import ZoneInfo
import requests

PIN = "https://guest.api.arcadia.pinnacle.com/0.1"
WORKER = os.environ.get("WORKER_URL", "https://prebetpro-api.vincenzodiguida.workers.dev").rstrip("/")
TOKEN = os.environ.get("ADMIN_TOKEN", "")
TZ = ZoneInfo("Europe/Rome")
NOW = dt.datetime.now(dt.timezone.utc)
UA = {"User-Agent": "Mozilla/5.0 (PreBetPro engine)", "Accept": "application/json"}

MAX_MARGIN = 0.06   # margine massimo del bookmaker per i Top Picks tennis


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


def rome(ts):
    return ts.astimezone(TZ)


# ------------------------------------------------------------------ TENNIS
def norm(s):
    s = unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z ]", " ", s).split()


def same_player(a, b):
    A, B = norm(a), norm(b)
    return bool(A and B and A[-1] == B[-1] and (A[0][0] == B[0][0]))


ALL = []


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
    # mercati extra (stessa risposta, nessuna chiamata in più): totale/handicap set sulla partita, totale/handicap game sulla sottopartita "Games"
    gmap = {m["id"]: m["parent"]["id"] for m in M if m.get("parent") and (m.get("units") or "") == "Games" and m["parent"].get("id") in info}
    EX = {}
    for k in Kt:
        if k.get("period") != 0 or k.get("isAlternate") or k.get("type") not in ("total", "spread"):
            continue
        mid = k.get("matchupId"); main = mid if mid in info else gmap.get(mid)
        if main is None:
            continue
        pr = {p.get("designation"): p for p in k.get("prices", [])}
        a, b = ("over", "under") if k["type"] == "total" else ("home", "away")
        if a not in pr or b not in pr or pr[a].get("points") is None:
            continue
        oa, ob = dec(pr[a]["price"]), dec(pr[b]["price"])
        mg = 1 / oa + 1 / ob - 1
        if mg > 0.12:
            continue
        key = ("t" if k["type"] == "total" else "h") + ("s" if mid in info else "g")
        EX.setdefault(main, {})[key] = [pr[a]["points"], int(round(100 * (1 / oa) / (1 + mg)))]
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
        if "Doubles" not in r["lg"] and "/" not in (r["p1"] or "") + (r["p2"] or "") and mg <= 0.12:   # tutte le partite: probabilità di mercato senza margine
            st0 = rome(r["st"])
            ALL.append({"id": k["matchupId"], "date": st0.strftime("%Y-%m-%d"), "time": st0.strftime("%H:%M"), "start": r["st"].isoformat(),
                        "tn": r["lg"].replace(" - ", " · "), "a": r["p1"], "b": r["p2"], "pa": int(round(100 * ph)), "pb": 100 - int(round(100 * ph)),
                        "oa": round(o["home"], 2), "ob": round(o["away"], 2), **EX.get(k["matchupId"], {})})
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
    # tutte le partite di tennis (probabilità di mercato): le partite iniziate restano congelate
    for off in (0, 1):
        d = (today + dt.timedelta(days=off)).isoformat()
        cur = worker_get(f"/tennis/all?date={d}") or {}
        keep = {str(x["id"]): x for x in cur.get("matches", []) if dt.datetime.fromisoformat(x["start"]) <= NOW}
        fresh = {str(x["id"]): x for x in ALL if x["date"] == d and str(x["id"]) not in keep}
        allm_d = sorted({**{k: v for k, v in {str(x["id"]): x for x in cur.get("matches", [])}.items() if k not in fresh and k in keep}, **fresh}.values(), key=lambda x: (x["start"], x["tn"]))
        if allm_d:
            worker_post("/admin/tennis-all", {"date": d, "matches": allm_d})
    print("tennis nuove:", len(new), "| tutti i pronostici:", len(ALL))


if __name__ == "__main__":
    main()
