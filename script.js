/* =========================================================
   THE DAILY BREW — JavaScript
   Three small jobs:
   1. Open / close the mobile hamburger menu
   2. Give the navbar a background after scrolling
   3. Show a thank-you message when the contact form is sent
   ========================================================= */

// Grab the elements we need from the page
const navbar    = document.querySelector(".navbar");
const hamburger = document.querySelector(".hamburger");
const navLinks  = document.querySelectorAll(".nav-links a");


/* ---------- 1. HAMBURGER MENU ---------- */

// Toggle the "menu-open" class when the hamburger is clicked
hamburger.addEventListener("click", function () {
  navbar.classList.toggle("menu-open");

  // Tell screen readers whether the menu is open
  const isOpen = navbar.classList.contains("menu-open");
  hamburger.setAttribute("aria-expanded", isOpen);
});

// Close the menu after a link is clicked (on mobile)
navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    navbar.classList.remove("menu-open");
    hamburger.setAttribute("aria-expanded", false);
  });
});


/* ---------- 2. NAVBAR BACKGROUND ON SCROLL ---------- */

function updateNavbar() {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", updateNavbar);
updateNavbar(); // run once on page load too


/* ---------- 3. CONTACT FORM ---------- */

const form        = document.querySelector("#contact-form");
const successMsg  = document.querySelector(".form-success");

form.addEventListener("submit", function (event) {
  // Stop the page from reloading (there's no real server)
  event.preventDefault();

  // Get the name the visitor typed so we can thank them personally
  const name = document.querySelector("#name").value.trim();

  successMsg.textContent =
    "Thanks, " + name + "! Your message has been sent. We'll get back to you soon.";
  successMsg.classList.add("show");

  // Clear the form fields
  form.reset();

  // Hide the message again after 6 seconds
  setTimeout(function () {
    successMsg.classList.remove("show");
  }, 6000);
});


/* ---------- 4. FOOTER YEAR ---------- */
// Keeps the copyright year up to date automatically
document.querySelector("#year").textContent = new Date().getFullYear();
