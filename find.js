document.addEventListener("DOMContentLoaded", function () {
   const donors = [
    { name: "Amit Kumar",      group: "A+",  city: "Chandigarh" },
    { name: "Priya Singh",     group: "O+",  city: "Mohali" },
    { name: "Rajesh Verma",    group: "B+",  city: "Panchkula" },
    { name: "Sneha Patel",     group: "AB-", city: "Chandigarh" },
    { name: "Harpreet Kaur",   group: "O-",  city: "Ludhiana" },
    { name: "Gurpreet Singh",  group: "A-",  city: "Amritsar" },
    { name: "Manish Sharma",   group: "B-",  city: "Patiala" },
    { name: "Neha Gupta",      group: "AB+", city: "Jalandhar" },
    { name: "Rohit Malhotra",  group: "O+",  city: "Chandigarh" },
    { name: "Simran Arora",    group: "A+",  city: "Mohali" },
    { name: "Vikas Yadav",     group: "B+",  city: "Delhi" },
    { name: "Anjali Mehta",    group: "O-",  city: "Delhi" },
    { name: "Karan Bansal",    group: "A+",  city: "Rajpura" },
    { name: "Pooja Chauhan",   group: "AB+", city: "Panchkula" },
    { name: "Deepak Thakur",   group: "B-",  city: "Shimla" },
    { name: "Ritu Sethi",      group: "O+",  city: "Ludhiana" },
    { name: "Arjun Dhillon",   group: "A-",  city: "Chandigarh" },
    { name: "Meera Joshi",     group: "B+",  city: "Patiala" },
    { name: "Sandeep Bhatia",  group: "AB-", city: "Amritsar" },
    { name: "Rishika Jindal", group :"O+", city: "Kashmir"},
    { name: "Gurshant", group:"A+",  city:"Kanniyakumari "},
    {name :"Rohit", group:"O+", city: "Bhatinda"},
    {name :"navpreet kaur", group: "O+", city:"Shimla"}
];

    const groupSelect = document.querySelector(".search-form select");
    const cityInput   = document.querySelector(".search-form input");
    const searchBtn   = document.querySelector(".search-form button");
    const grid        = document.querySelector(".results-grid");

    const noResults = document.createElement("p");
    noResults.textContent = "No donors found. Try a different blood group or city.";
    noResults.style.display = "none";
    noResults.style.textAlign = "center";
    grid.after(noResults);

    function renderDonors(list) {
        grid.innerHTML = "";
        noResults.style.display = list.length === 0 ? "block" : "none";

        list.forEach(function (d) {
            const card = document.createElement("div");
            card.className = "donor-card";
            card.innerHTML =
                '<div class="blood-badge">' + d.group + '</div>' +
                '<div class="donor-details">' +
                    '<h3>' + d.name + '</h3>' +
                    '<p>📍 ' + d.city + '</p>' +
                    '<p class="available">● Available</p>' +
                '</div>';
            grid.appendChild(card);
        });
    }

    function searchDonors() {
        const group = groupSelect.value;
        const city  = cityInput.value.trim().toLowerCase();

        const filtered = donors.filter(function (d) {
            return (group === "" || d.group === group) &&
                   (city === "" || d.city.toLowerCase().includes(city));
        });

        renderDonors(filtered);
    }

    searchBtn.addEventListener("click", searchDonors);

    cityInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            searchDonors();
        }
    });

    renderDonors(donors);
});