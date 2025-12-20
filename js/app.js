fetch("data/placeholder.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("matches");

    if (!data.matches || data.matches.length === 0) {
      container.innerHTML = `
        <div class="no-data">
          No matches available today for the monitored leagues.<br>
          Check statistics and historical reports.
        </div>
      `;
      return;
    }

    data.matches.forEach(match => {
      container.innerHTML += `
        <div class="match">
          <strong>${match.home} vs ${match.away}</strong><br>
          Prediction: ${match.prediction || "ND"}
        </div>
      `;
    });
  })
  .catch(() => {
    document.getElementById("matches").innerHTML = `
      <div class="no-data">
        Data temporarily unavailable. Please try again later.
      </div>
    `;
  });
