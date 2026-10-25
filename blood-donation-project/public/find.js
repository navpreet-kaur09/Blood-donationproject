document.addEventListener("DOMContentLoaded", function () {
    const groupSelect = document.querySelector(".search-form select");
    const cityInput = document.getElementById("citySelect");
    const grid = document.querySelector(".results-grid");
    const searchControls = document.querySelector(".search-form");

    if (!groupSelect || !cityInput || !grid || !searchControls) return;

    function readArray(key) {
        const saved = localStorage.getItem(key);
        if (!saved) return [];
        const value = JSON.parse(saved);
        if (!Array.isArray(value)) throw new Error(key + " must contain a list.");
        return value;
    }

    function getDonors() {
        const savedDonors = readArray("jeevanDonors").concat(readArray("donors"));
        const donors = [];
        savedDonors.forEach(function (record) {
            const donor = record && {
                ...record,
                group: record.group || record.bloodGroup,
                city: String(record.city || "").trim()
            };
            if (!donor || !donor.name || !donor.group || !donor.city || donor.available === false) return;

            const email = String(donor.email || "").toLowerCase();
            const exists = donors.some(function (saved) {
                return (email && saved.email && saved.email.toLowerCase() === email) ||
                    (saved.name.toLowerCase() === String(donor.name).toLowerCase() &&
                        saved.group === donor.group && saved.city.toLowerCase() === donor.city.toLowerCase());
            });
            if (!exists) donors.push(donor);
        });
        window.JeevanDemoData.donors.forEach(function (demoDonor) {
            if (!donors.some(function (donor) { return donor.id === demoDonor.id; })) {
                donors.push(demoDonor);
            }
        });
        const users = readArray("jeevanUsers");

        users.filter(function (user) {
            return user && user.role === "donor" && user.name && user.bloodGroup && user.city;
        }).forEach(function (user) {
            const exists = donors.some(function (donor) {
                return (donor.email && user.email &&
                    donor.email.toLowerCase() === user.email.toLowerCase()) ||
                    (donor.name.toLowerCase() === user.name.toLowerCase() &&
                        donor.group === user.bloodGroup &&
                        donor.city.toLowerCase() === user.city.toLowerCase());
            });
            if (!exists) {
                donors.push({
                    id: user.email || user.name,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    group: user.bloodGroup,
                    city: user.city,
                    age: user.age,
                    gender: user.gender,
                    available: true
                });
            }
        });
        return donors;
    }

    function makeInput(form, labelText, name, type, value, required) {
        const label = document.createElement("label");
        label.textContent = labelText;
        const input = document.createElement("input");
        input.name = name;
        input.type = type;
        input.value = value || "";
        input.required = required;
        label.appendChild(input);
        form.appendChild(label);
        return input;
    }

    function addRequestForm(card, donor) {
        const form = document.createElement("form");
        form.className = "donor-request-form";
        form.hidden = true;

        const heading = document.createElement("h4");
        heading.textContent = "Request blood from " + donor.name;
        form.appendChild(heading);

        let currentUser = null;
        try {
            currentUser = JSON.parse(localStorage.getItem("jeevanCurrentUser") || "null");
        } catch (error) {
            console.error("[Jeevan] Could not read the signed-in user.", error);
        }

        makeInput(form, "Your name", "requesterName", "text", currentUser && currentUser.name, true);
        makeInput(form, "Your phone", "requesterPhone", "tel", currentUser && currentUser.phone, true);
        makeInput(form, "Your email", "requesterEmail", "email", currentUser && currentUser.email, true);
        makeInput(form, "Your city", "requesterCity", "text", currentUser && currentUser.city, true);
        makeInput(form, "Patient name", "patientName", "text", "", true);

        const units = makeInput(form, "Units needed", "units", "number", "1", true);
        units.min = "1";
        units.max = "10";

        const neededBy = makeInput(form, "Needed by", "neededBy", "date", "", true);
        neededBy.min = new Date().toISOString().split("T")[0];

        const hospitalId = makeInput(form, "Hospital ID", "hospitalId", "text", "HOSP-101", true);
        hospitalId.setAttribute("list", "hospitalIdOptions");
        hospitalId.setAttribute("pattern", "[A-Za-z0-9_\\-]{4,20}");
        hospitalId.title = "Use the same ID when verifying the hospital dashboard.";

        const hospitalOptions = document.createElement("datalist");
        hospitalOptions.id = "hospitalIdOptions";
        Object.keys(window.JeevanDemoData.hospitals).forEach(function (id) {
            const option = document.createElement("option");
            option.value = id;
            hospitalOptions.appendChild(option);
        });
        form.appendChild(hospitalOptions);

        const detailsLabel = document.createElement("label");
        detailsLabel.textContent = "Extra details (optional)";
        const details = document.createElement("textarea");
        details.name = "details";
        details.rows = 3;
        detailsLabel.appendChild(details);
        form.appendChild(detailsLabel);

        const message = document.createElement("p");
        message.className = "request-message";
        message.setAttribute("role", "status");
        form.appendChild(message);

        const submit = document.createElement("button");
        submit.type = "submit";
        submit.className = "btn primary";
        submit.textContent = "Send request to hospital";
        form.appendChild(submit);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(form);
            const requesterPhone = String(formData.get("requesterPhone")).trim();
            if (!/^[+]?[\d\s()-]{7,16}$/.test(requesterPhone)) {
                message.textContent = "Please enter a valid phone number so the hospital can contact you.";
                return;
            }

            try {
                const requests = readArray("jeevanBloodRequests");
                requests.unshift({
                    id: "request_" + Date.now(),
                    hospitalId: String(formData.get("hospitalId")).trim().toUpperCase(),
                    requesterName: String(formData.get("requesterName")).trim(),
                    requesterEmail: String(formData.get("requesterEmail")).trim().toLowerCase(),
                    requesterPhone: requesterPhone,
                    requesterCity: String(formData.get("requesterCity")).trim(),
                    patientName: String(formData.get("patientName")).trim(),
                    donorId: donor.id || donor.email || donor.name,
                    donorName: donor.name,
                    donorEmail: donor.email || "",
                    donorPhone: donor.phone || "",
                    donorGroup: donor.group,
                    donorCity: donor.city,
                    donorAge: donor.age || "",
                    donorGender: donor.gender || "",
                    units: Number(formData.get("units")),
                    neededBy: String(formData.get("neededBy")),
                    details: String(formData.get("details")).trim(),
                    status: "New",
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem("jeevanBloodRequests", JSON.stringify(requests));
                message.textContent = "Request sent. The hospital can now contact you and " + donor.name + ".";
                submit.disabled = true;
                submit.textContent = "Request sent";
            } catch (error) {
                console.error("[Jeevan] Could not save blood request.", error);
                message.textContent = "Could not send your request. Please check browser storage and try again.";
            }
        });

        card.appendChild(form);
        return form;
    }

    let donors;
    try {
        donors = getDonors();
    } catch (error) {
        console.error("[Jeevan] Could not load registered donors.", error);
        const message = document.createElement("p");
        message.className = "donor-list-message";
        message.textContent = "Registered donors could not be loaded from this browser.";
        grid.replaceChildren(message);
        return;
    }

    const cityNames = Array.from(new Set(donors.map(function (donor) {
        return donor.city.trim();
    }))).sort();
    cityNames.forEach(function (city) {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        cityInput.appendChild(option);
    });

    const noResults = document.createElement("p");
    noResults.className = "donor-list-message";
    noResults.textContent = donors.length
        ? "No donors found. Try a different blood group or city."
        : "No donors have signed up yet. Register as a donor to appear here.";
    grid.after(noResults);

    function renderDonors(list) {
        grid.replaceChildren();
        noResults.hidden = list.length > 0;

        list.forEach(function (donor) {
            const card = document.createElement("article");
            card.className = "donor-card";

            const badge = document.createElement("div");
            badge.className = "blood-badge";
            badge.textContent = donor.group;

            const details = document.createElement("div");
            details.className = "donor-details";
            const name = document.createElement("h3");
            name.textContent = donor.name;
            const city = document.createElement("p");
            city.textContent = "Location: " + donor.city;
            const available = document.createElement("p");
            available.className = "available";
            available.textContent = donor.isDemo
                ? "Demo donor · fictional details"
                : "Available donor";
            details.append(name, city, available);

            const requestButton = document.createElement("button");
            requestButton.type = "button";
            requestButton.className = "btn primary request-blood-btn";
            requestButton.textContent = "Request blood";

            card.append(badge, details, requestButton);
            const requestForm = addRequestForm(card, donor);
            requestButton.addEventListener("click", function () {
                requestForm.hidden = !requestForm.hidden;
                if (!requestForm.hidden) {
                    requestForm.querySelector("input").focus();
                }
            });

            grid.appendChild(card);
        });
    }

    function searchDonors() {
        const group = groupSelect.value;
        const city = cityInput.value.trim().toLowerCase();
        const filtered = donors.filter(function (donor) {
            return (!group || donor.group === group) &&
                (!city || donor.city.toLowerCase() === city);
        });
        renderDonors(filtered);
    }

    groupSelect.addEventListener("change", searchDonors);
    groupSelect.addEventListener("input", searchDonors);
    cityInput.addEventListener("change", searchDonors);
    cityInput.addEventListener("input", searchDonors);
    searchDonors();
});
