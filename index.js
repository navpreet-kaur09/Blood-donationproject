document.addEventListener("DOMContentLoaded", function () {

    // Mobile menu
    const menuBtn = document.getElementById("menuBtn");
    const navbar = document.getElementById("navbar");

    menuBtn.addEventListener("click", function () {
        navbar.classList.toggle("show");
    });

});


const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

// Hamburger menu
if (menuBtn && navbar) {
    menuBtn.addEventListener("click", function () {
        navbar.classList.toggle("show");
    });
}

// Active navigation link
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll("nav a").forEach(function (link) {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
        link.classList.add("active");
    }
});