/* =========================
   BASE
========================= */
body {
  margin: 0;
  font-family: system-ui, Arial, sans-serif;
  background: #ffffff;
  color: #1a1a1a;
}

body.dark {
  background: #0f1115;
  color: #f1f1f1;
}

a {
  text-decoration: none;
  color: inherit;
}

/* =========================
   HEADER & NAV
========================= */
header {
  background: linear-gradient(90deg, #ff7a00, #ff9f1a);
  padding: 16px;
  text-align: center;
  color: #fff;
}

nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

nav a {
  font-weight: 700;
  color: #ff7a00;
}

/* =========================
   SECTIONS
========================= */
main {
  max-width: 1100px;
  margin: auto;
  padding: 20px;
}

section {
  margin-bottom: 50px;
}

h2 {
  border-left: 4px solid #ff7a00;
  padding-left: 10px;
}

/* =========================
   MATCH LIST
========================= */
.match-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fafafa;
}

body.dark .match-card {
  background: #1b1f27;
  border-color: #2a2f3a;
}

.match-league {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ff7a00;
  margin-bottom: 4px;
}

.match-teams {
  font-weight: 700;
  margin-bottom: 4px;
}

.match-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #555;
}

body.dark .match-info {
  color: #ccc;
}

/* =========================
   PREDICTIONS
========================= */
.prediction-card {
  background: #f4f6f8;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

body.dark .prediction-card {
  background: #1b1f27;
}

.prediction-header {
  font-weight: 800;
  margin-bottom: 12px;
}

.prediction-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  margin: 10px 0 4px;
  color: #666;
}

body.dark .prediction-section-title {
  color: #aaa;
}

.prediction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .prediction-grid {
    grid-template-columns: 1fr;
  }
}

.prediction-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  padding: 4px 0;
}

.prediction-row strong {
  font-weight: 800;
}

/* HIGH CONFIDENCE */
.prediction-high {
  border-left: 4px solid #ff7a00;
  padding-left: 8px;
}

.prediction-high strong {
  color: #ff7a00;
}
