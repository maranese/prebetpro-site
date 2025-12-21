const toggle = document.getElementById("theme-toggle");
const body = document.body;

// Load saved preference
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
  toggle.textContent = "☀️ Light mode";
}

toggle.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    toggle.textContent = "☀️ Light mode";
    localStorage.setItem("theme", "dark");
  } else {
    toggle.textContent = "🌙 Dark mode";
    localStorage.setItem("theme", "light");
  }
});
