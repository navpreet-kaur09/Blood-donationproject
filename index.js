document.addEventListener("DOMContentLoaded", function () {

    // Mobile menu
    const menuBtn = document.getElementById("menuBtn");
    const navbar = document.getElementById("navbar");

    menuBtn.addEventListener("click", function () {
        navbar.classList.toggle("show");
    });

});