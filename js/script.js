const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
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