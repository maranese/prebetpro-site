document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  if (!toggle) return;

  // Load saved theme
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
    toggle.textContent = "☀️ Light mode";
  }

  toggle.addEventListener("click", function () {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
      toggle.textContent = "☀️ Light mode";
      localStorage.setItem("theme", "dark");
    } else {
      toggle.textContent = "🌙 Dark mode";
      localStorage.setItem("theme", "light");
    }
  });
});
// Language detection
const userLang = navigator.language.slice(0, 2);
const siteLang = translations[userLang] ? userLang : "en";

document.documentElement.setAttribute("data-lang", siteLang);

document.querySelector("header p").innerHTML =
  translations[siteLang].tagline;

document.querySelector("#today h2").innerHTML =
  translations[siteLang].today;

document.querySelector(".no-data").innerHTML =
  translations[siteLang].noMatches;

const navLinks = document.querySelectorAll("nav a");
navLinks[0].innerText = translations[siteLang].predictions;
navLinks[1].innerText = translations[siteLang].statistics;
navLinks[2].innerText = translations[siteLang].reports;
navLinks[3].innerText = translations[siteLang].leagues;
