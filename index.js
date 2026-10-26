function startPage() {
    const menuBtn = document.getElementById("menuBtn");
    const navbar = document.getElementById("navbar");

    if (menuBtn && navbar) {
        menuBtn.addEventListener("click", function () {
            navbar.classList.toggle("show");
        });
    }

    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll("nav a").forEach(function (link) {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });

    const campsList = document.getElementById("upcomingCampsList");
    const emptyState = document.getElementById("upcomingCampsEmpty");
    if (!campsList || !emptyState) return;

    function addCampDetail(details, label, value) {
        const item = document.createElement("p");
        item.textContent = label + ": " + value;
        details.appendChild(item);
    }

    try {
        const savedCamps = localStorage.getItem("jeevanHospitalCamps");
        const camps = savedCamps ? JSON.parse(savedCamps) : [];
        if (!Array.isArray(camps)) throw new Error("Saved camp data must be a list.");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = camps
            .filter(function (camp) {
                const date = new Date(camp.date + "T00:00:00");
                return camp.name && camp.date && !Number.isNaN(date.getTime()) && date >= today;
            })
            .sort(function (first, second) {
                return new Date(first.date + "T00:00:00") - new Date(second.date + "T00:00:00");
            });

        emptyState.hidden = upcoming.length > 0;
        upcoming.forEach(function (camp) {
            const card = document.createElement("article");
            card.className = "camp-item-card";

            const heading = document.createElement("h3");
            heading.textContent = camp.name;
            card.appendChild(heading);

            const details = document.createElement("div");
            details.className = "camp-details-list";
            addCampDetail(details, "Organizer", camp.organizer || "Not specified");
            addCampDetail(details, "Date", new Date(camp.date + "T00:00:00").toLocaleDateString());
            addCampDetail(details, "Time", camp.timing || "To be announced");
            addCampDetail(details, "Venue", camp.venue || "To be announced");
            card.appendChild(details);
            campsList.appendChild(card);
        });
    } catch (error) {
        console.error("[Jeevan] Could not load upcoming camps.", error);
        emptyState.textContent = "Upcoming camps could not be loaded from this browser.";
        emptyState.hidden = false;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startPage);
} else {
    startPage();
}