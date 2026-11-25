"""
PreBetPro Lab – modello tennis sperimentale (indipendente dalle quote).
Elo generale + Elo per superficie + classifica + forma + scontri diretti + riposo,
combinati con una regressione logistica ricalibrata sui risultati.
"""
import csv, math, glob, os, re, unicodedata, datetime as dt
from collections import defaultdict, deque
import numpy as np
from scipy.optimize import minimize

SURF = {"hard": "H", "clay": "C", "grass": "G", "carpet": "H"}


def norm(s):
    s = unicodedata.normalize("NFKD", str(s or "")).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z ]+", " ", s)
    return " ".join(s.split())


def surf_code(s):
    return SURF.get(str(s or "").strip().lower(), "H")


def load_archive(folder):
    rows = []
    for f in sorted(glob.glob(os.path.join(folder, "*.csv"))):
        if "doubles" in f:
            continue
        g = "w" if os.path.basename(f).startswith("wta") else "m"
        with open(f, newline="", encoding="utf-8", errors="ignore") as fh:
            for r in csv.DictReader(fh):
                sc = r.get("score") or ""
                if not r.get("winner_name") or not r.get("loser_name") or "W/O" in sc or "DEF" in sc or not sc.strip():
                    continue
                try:
                    d = dt.date(int(r["tourney_date"][:4]), int(r["tourney_date"][4:6]), int(r["tourney_date"][6:8]))
                except Exception:
                    continue
                rk = lambda x: int(float(x)) if x not in (None, "") else None
                rows.append(dict(d=d, k=(r["tourney_date"], r.get("tourney_id", ""), int(float(r.get("match_num") or 0))), g=g,
                                 s=surf_code(r.get("surface")), lvl=r.get("tourney_level", ""), w=norm(r["winner_name"]), l=norm(r["loser_name"]),
                                 wr=rk(r.get("winner_rank")), lr=rk(r.get("loser_rank")), ret="RET" in sc))
    rows.sort(key=lambda x: x["k"])
    return rows


class State:
    """Stato dei giocatori aggiornato partita dopo partita (nessuna informazione dal futuro)."""
    def __init__(self):
        self.elo = defaultdict(lambda: 1500.0); self.n = defaultdict(int)
        self.selo = defaultdict(lambda: 1500.0); self.sn = defaultdict(int)
        self.form = defaultdict(lambda: deque(maxlen=10)); self.last = {}; self.recent = defaultdict(lambda: deque(maxlen=20))
        self.h2h = defaultdict(int); self.rank = {}

    def k(self, n):
        return 250.0 / ((n + 5) ** 0.4)

    def features(self, a, b, s, d, ra=None, rb=None):
        ea, eb = self.elo[a], self.elo[b]; sa, sb = self.selo[(a, s)], self.selo[(b, s)]
        ra = ra or self.rank.get(a); rb = rb or self.rank.get(b)
        lr = math.log(rb or 1500) - math.log(ra or 1500)
        fa = (sum(self.form[a]) / len(self.form[a])) if self.form[a] else 0.5
        fb = (sum(self.form[b]) / len(self.form[b])) if self.form[b] else 0.5
        h = self.h2h[(a, b)] - self.h2h[(b, a)]
        def load(p):   # partite negli ultimi 7 giorni (stanchezza)
            return sum(1 for x in self.recent[p] if 0 <= (d - x).days <= 7)
        def rest(p):
            x = self.last.get(p); return min(30, (d - x).days) if x else 30
        conf = min(self.n[a], self.n[b])
        return [(ea - eb) / 400, (sa - sb) / 400, lr, fa - fb, max(-3, min(3, h)) / 3, (load(a) - load(b)) / 3,
                (math.log1p(rest(a)) - math.log1p(rest(b))) / 3, math.log1p(conf) / 5 * (ea - eb) / 400]

    def update(self, w, l, s, d, wr=None, lr=None, ret=False):
        kk = 0.5 if ret else 1.0
        pe = 1 / (1 + 10 ** ((self.elo[l] - self.elo[w]) / 400))
        kw, kl = self.k(self.n[w]) * kk, self.k(self.n[l]) * kk
        self.elo[w] += kw * (1 - pe); self.elo[l] -= kl * (1 - pe)
        ps = 1 / (1 + 10 ** ((self.selo[(l, s)] - self.selo[(w, s)]) / 400))
        sw, sl = self.k(self.sn[(w, s)]) * kk, self.k(self.sn[(l, s)]) * kk
        self.selo[(w, s)] += sw * (1 - ps); self.selo[(l, s)] -= sl * (1 - ps)
        self.n[w] += 1; self.n[l] += 1; self.sn[(w, s)] += 1; self.sn[(l, s)] += 1
        self.form[w].append(1); self.form[l].append(0)
        self.last[w] = d; self.last[l] = d; self.recent[w].append(d); self.recent[l].append(d)
        self.h2h[(w, l)] += 1
        if wr: self.rank[w] = wr
        if lr: self.rank[l] = lr


def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -30, 30)))


def fit_lr(X, y, l2=1.0):
    X = np.asarray(X); y = np.asarray(y); n, m = X.shape
    def f(w):
        p = sigmoid(X @ w); eps = 1e-12
        return -np.mean(y * np.log(p + eps) + (1 - y) * np.log(1 - p + eps)) + l2 * np.sum(w ** 2) / n
    def gr(w):
        p = sigmoid(X @ w); return X.T @ (p - y) / n + 2 * l2 * w / n
    return minimize(f, np.zeros(m), jac=gr, method="L-BFGS-B").x


def build(rows, until=None, collect_from=None, rng=None):
    """Scorre le partite in ordine; raccoglie le feature (orientamento casuale) per l'addestramento."""
    st = State(); X, y, meta = [], [], []
    rng = rng or np.random.default_rng(7)
    for r in rows:
        if until and r["d"] > until:
            break
        if collect_from and r["d"] >= collect_from and st.n[r["w"]] >= 5 and st.n[r["l"]] >= 5:
            if rng.random() < .5:
                X.append(st.features(r["w"], r["l"], r["s"], r["d"], r["wr"], r["lr"])); y.append(1)
            else:
                X.append(st.features(r["l"], r["w"], r["s"], r["d"], r["lr"], r["wr"])); y.append(0)
            meta.append(r)
        st.update(r["w"], r["l"], r["s"], r["d"], r["wr"], r["lr"], r["ret"])
    return st, np.array(X), np.array(y), meta
