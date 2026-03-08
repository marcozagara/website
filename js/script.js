const navbar = document.getElementById("navbar");
const path = window.location.pathname.toLowerCase();
const isGalleryPage =
  path.includes("3dart.html") || path.includes("illustrations.html");
const navScrollThreshold = isGalleryPage ? 5 : 140;

window.addEventListener("scroll", () => {
  if (window.scrollY > navScrollThreshold) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});


document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});




document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (
    event.key === "F12" ||
    (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
    (event.ctrlKey && ["u", "s"].includes(key))
  ) {
    event.preventDefault();
  }
});





const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const mobileWorkToggle = document.getElementById("mobileWorkToggle");

if (navToggle && navMenu && navbar) {
  const closeWorkSubmenu = () => {
    navbar.classList.remove("nav--work-open");
    if (mobileWorkToggle) {
      mobileWorkToggle.setAttribute("aria-expanded", "false");
    }
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.contains("nav--open");
    if (isOpen) {
      navbar.classList.remove("nav--open");
      closeWorkSubmenu();
    } else {
      navbar.classList.add("nav--open");
    }

    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
  });

  if (mobileWorkToggle) {
    mobileWorkToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = navbar.classList.toggle("nav--work-open");
      mobileWorkToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("nav--open");
      closeWorkSubmenu();
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}
