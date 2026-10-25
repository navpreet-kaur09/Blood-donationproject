js

document.addEventListener("DOMContentLoaded", function () {
    const donors = [
        { name: "Amit Kumar", group: "A+", city: "Chandigarh" },
        { name: "Priya Singh", group: "O+", city: "Mohali" },
        { name: "Rajesh Verma", group: "B+", city: "Panchkula" },
        { name: "Sneha Patel", group: "AB-", city: "Chandigarh" },
        { name: "Harpreet Kaur", group: "O-", city: "Ludhiana" },
        { name: "Gurpreet Singh", group: "A-", city: "Amritsar" },
        { name: "Manish Sharma", group: "B-", city: "Patiala" },
        { name: "Neha Gupta", group: "AB+", city: "Jalandhar" },
        { name: "Rohit Malhotra", group: "O+", city: "Chandigarh" },
        { name: "Simran Arora", group: "A+", city: "Mohali" },
        { name: "Vikas Yadav", group: "B+", city: "Delhi" },
        { name: "Anjali Mehta", group: "O-", city: "Delhi" },
        { name: "Karan Bansal", group: "A+", city: "Rajpura" },
        { name: "Pooja Chauhan", group: "AB+", city: "Panchkula" },
        { name: "Deepak Thakur", group: "B-", city: "Shimla" },
        { name: "Ritu Sethi", group: "O+", city: "Ludhiana" },
        { name: "Arjun Dhillon", group: "A-", city: "Chandigarh" },
        { name: "Meera Joshi", group: "B+", city: "Patiala" },
        { name: "Sandeep Bhatia", group: "AB-", city: "Amritsar" },
        { name: "Rishika Jindal", group: "O+", city: "Kashmir" },
        { name: "Gurshant", group: "A+", city: "Kanniyakumari" },
        { name: "Rohit", group: "O+", city: "Bathinda" },
        { name: "Navpreet Kaur", group: "O+", city: "Shimla" }
    ];
    const samplePhones = {
        "amit kumar": "98765-43210",
        "priya singh": "98123-45678",
        "rajesh verma": "99887-65432",
        "sneha patel": "97812-34567",
        "harpreet kaur": "98555-12345"
    };
    donors.forEach(function (donor) {
        donor.phone = samplePhones[donor.name.toLowerCase()] || "";
    });

    const groupSelect = document.querySelector(".search-form select");
    const cityInput = document.getElementById("citySelect");
    const searchBtn = document.querySelector(".search-form button");
    const grid = document.querySelector(".results-grid");
    if (!groupSelect || !cityInput || !searchBtn || !grid) return;

    try {
        const savedDonors = localStorage.getItem("jeevanDonors") || localStorage.getItem("donors");
        if (savedDonors) {
            const parsedDonors = JSON.parse(savedDonors);
            if (!Array.isArray(parsedDonors)) throw new Error("Saved donor data must be a list.");
            donors.push(...parsedDonors.filter(function (donor) {
                return donor && donor.name && (donor.group || donor.bloodGroup) && donor.city;
            }).map(function (donor) {
                return {
                    id: donor.id || "",
                    name: donor.name,
                    group: donor.group || donor.bloodGroup,
                    city: donor.city,
                    phone: donor.phone || ""
                };
            }));
        }
    } catch (error) {
        console.error("[Jeevan] Could not load registered donors.", error);
    }

    const cities = [...new Set(donors.map(function (donor) { return donor.city.trim(); }))].sort();
    cities.forEach(function (city) {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        cityInput.appendChild(option);
    });

    const noResults = document.createElement("p");
    noResults.textContent = "No donors found. Try a different blood group or city.";
    noResults.style.display = "none";
    noResults.style.textAlign = "center";
    grid.after(noResults);

    const cityCount = document.createElement("p");
    cityCount.style.textAlign = "center";
    cityCount.style.fontWeight = "600";
    cityCount.style.color = "#b91c1c";
    grid.before(cityCount);

    function renderDonors(list) {
        grid.replaceChildren();
        noResults.style.display = list.length === 0 ? "block" : "none";

        list.forEach(function (donor) {
            const card = document.createElement("div");
            card.className = "donor-card";

            const badge = document.createElement("div");
            badge.className = "blood-badge";
            badge.textContent = donor.group;

            const details = document.createElement("div");
            details.className = "donor-details";
            const name = document.createElement("h3");
            name.textContent = donor.name;
            const city = document.createElement("p");
            city.textContent = "📍 " + donor.city;
            const status = document.createElement("p");
            status.className = "available";
            status.textContent = "● Available";

            const requestButton = document.createElement("button");
            requestButton.type = "button";
            requestButton.className = "btn primary request-blood-btn";
            requestButton.textContent = "Request blood";

            const requestForm = document.createElement("form");
            requestForm.className = "donor-request-form";
            requestForm.hidden = true;
            requestForm.innerHTML = `
                <h4>Send a request to the hospital</h4>
                <label>Hospital
                    <select name="hospitalId" required>
                        <option value="HOSP-101">GMCH-32</option>
                        <option value="PGI-CHD-102">PGIMER Chandigarh</option>
                        <option value="GOV-HOSP-2024">District Civil Hospital, Mohali</option>
                        <option value="AIIMS-DEL-01">AIIMS Delhi</option>
                    </select>
                </label>
                <label>Your name
                    <input name="requesterName" type="text" autocomplete="name" required>
                </label>
                <label>Your phone number
                    <input name="requesterPhone" type="tel" autocomplete="tel" inputmode="tel" required>
                </label>
                <label>Units needed
                    <input name="units" type="number" min="1" max="10" value="1" required>
                </label>
                <label>When is the blood needed?
                    <input name="neededBy" type="date" required>
                </label>
                <label>Additional details (optional)
                    <textarea name="details" rows="2" maxlength="300" placeholder="Anything the hospital should know"></textarea>
                </label>
                <p class="request-privacy-note">Your request and phone number will be shared with the selected hospital. Donor contact details are shown only in that hospital’s dashboard.</p>
                <button type="submit" class="btn primary">Send request</button>
                <p class="request-message" role="status"></p>
            `;
            try {
                const savedSession = localStorage.getItem("jeevanHospitalSession");
                const hospitalSession = savedSession ? JSON.parse(savedSession) : null;
                if (hospitalSession && hospitalSession.verified && hospitalSession.hospitalId) {
                    let hospitalOption = Array.from(requestForm.elements.hospitalId.options)
                        .find(function (option) { return option.value === hospitalSession.hospitalId; });
                    if (!hospitalOption) {
                        hospitalOption = document.createElement("option");
                        hospitalOption.value = hospitalSession.hospitalId;
                        hospitalOption.textContent = hospitalSession.hospitalName || hospitalSession.hospitalId;
                        requestForm.elements.hospitalId.appendChild(hospitalOption);
                    }
                    requestForm.elements.hospitalId.value = hospitalSession.hospitalId;
                }
            } catch (error) {
                console.error("[Jeevan] Could not read the active hospital session.", error);
            }
            const neededBy = requestForm.querySelector('[name="neededBy"]');
            neededBy.min = new Date().toISOString().split("T")[0];
            requestButton.addEventListener("click", function () {
                requestForm.hidden = !requestForm.hidden;
            });
            requestForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const formData = new FormData(requestForm);
                const requesterPhone = String(formData.get("requesterPhone")).trim();
                const message = requestForm.querySelector(".request-message");
                if (!/^[0-9+() -]{7,18}$/.test(requesterPhone)) {
                    message.textContent = "Please enter a valid phone number.";
                    return;
                }
                const request = {
                    id: "request_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
                    hospitalId: formData.get("hospitalId"),
                    donorName: donor.name,
                    donorGroup: donor.group,
                    donorCity: donor.city,
                    donorPhone: donor.phone || "",
                    requesterName: String(formData.get("requesterName")).trim(),
                    requesterPhone: requesterPhone,
                    units: Number(formData.get("units")),
                    neededBy: formData.get("neededBy"),
                    details: String(formData.get("details")).trim(),
                    status: "New",
                    createdAt: new Date().toISOString()
                };
                try {
                    const savedRequests = localStorage.getItem("jeevanBloodRequests");
                    const requests = savedRequests ? JSON.parse(savedRequests) : [];
                    if (!Array.isArray(requests)) throw new Error("Saved blood requests must be a list.");
                    requests.unshift(request);
                    localStorage.setItem("jeevanBloodRequests", JSON.stringify(requests));
                    const hospitalName = requestForm.elements.hospitalId.selectedOptions[0].textContent;
                    message.textContent = "Request sent to " + hospitalName + ". It will appear in that hospital's dashboard on this browser.";
                    requestForm.reset();
                    neededBy.min = new Date().toISOString().split("T")[0];
                } catch (error) {
                    console.error("[Jeevan] Could not save blood request.", error);
                    message.textContent = "The request could not be saved in this browser. Please try again.";
                }
            });

            details.append(name, city, status, requestButton, requestForm);
            card.append(badge, details);
            grid.appendChild(card);
        });
    }

    function searchDonors() {
        const group = groupSelect.value;
        const city = cityInput.value.trim().toLowerCase();

        if (group === "" && city === "") {
            grid.style.display = "none";
            noResults.style.display = "none";
            cityCount.textContent = "";
            return;
        }
        grid.style.display = "";

        const filtered = donors.filter(function (donor) {
            return (group === "" || donor.group === group) &&
                (city === "" || donor.city.toLowerCase().includes(city));
        });
        renderDonors(filtered);

        const cityName = cityInput.value.trim();
        if (cityName === "" || filtered.length === 0) {
            cityCount.textContent = "";
        } else {
            const groupText = group === "" ? "" : group + " ";
            const word = filtered.length === 1 ? "donor" : "donors";
            cityCount.textContent = filtered.length + " " + groupText + word + " available in " + cityName;
        }
    }

    searchBtn.addEventListener("click", searchDonors);
    groupSelect.addEventListener("change", searchDonors);
    cityInput.addEventListener("change", searchDonors);
    cityInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            searchDonors();
        }
    });

    searchDonors();
});