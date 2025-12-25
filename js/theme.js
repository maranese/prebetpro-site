document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggle.textContent = "☀️ Light mode";
  }

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");

    toggle.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});
