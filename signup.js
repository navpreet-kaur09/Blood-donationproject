
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    const ageInput = document.getElementById("signupAge");
    const message = document.getElementById("signupMessage");
    const roleInputs = document.querySelectorAll('input[name="role"]');

    function updateAgeRequirement() {
        const isDonor = document.querySelector('input[name="role"]:checked').value === "donor";
        ageInput.required = isDonor;
        ageInput.setAttribute("aria-required", String(isDonor));
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "au-msg " + type;
    }

    function readArray(key) {
        const saved = localStorage.getItem(key);
        if (!saved) return [];
        const value = JSON.parse(saved);
        if (!Array.isArray(value)) throw new Error(key + " must contain a list.");
        return value;
    }

    roleInputs.forEach(function (input) {
        input.addEventListener("change", updateAgeRequirement);
    });
    updateAgeRequirement();

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const role = document.querySelector('input[name="role"]:checked').value;
        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim().toLowerCase();
        const phone = document.getElementById("signupPhone").value.trim();
        const city = document.getElementById("signupCity").value.trim();
        const bloodGroup = document.getElementById("signupBloodGroup").value;
        const age = ageInput.value === "" ? null : Number(ageInput.value);
        const gender = document.getElementById("signupGender").value;
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (role === "donor" && !Number.isFinite(age)) {
            showMessage("Please enter your age to register as a donor.", "error");
            ageInput.focus();
            return;
        }
        if (role === "donor" && age < 18) {
            showMessage("You are not eligible to donate blood because donors must be at least 18 years old.", "error");
            ageInput.focus();
            return;
        }
        if (role === "donor" && age > 65) {
            showMessage("Donors must be 65 years old or younger. Please check with a donation center for guidance.", "error");
            ageInput.focus();
            return;
        }
        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", "error");
            return;
        }

        try {
            const users = readArray("jeevanUsers");
            if (users.some(function (user) { return user.email.toLowerCase() === email; })) {
                showMessage("An account with this email already exists.", "error");
                return;
            }

            const newUser = { role, name, email, phone, city, bloodGroup, age, gender, password };
            users.push(newUser);
            localStorage.setItem("jeevanUsers", JSON.stringify(users));

            if (role === "donor") {
                const donorList = readArray("jeevanDonors");
                donorList.push({ name, group: bloodGroup, city, age, gender, phone });
                localStorage.setItem("jeevanDonors", JSON.stringify(donorList));
            }

            showMessage("Account created successfully. You can now log in.", "success");
            window.setTimeout(function () {
                window.location.href = "login.html";
            }, 800);
        } catch (error) {
            console.error("[Jeevan] Could not save account data.", error);
            showMessage("Could not save your account in this browser. Please check browser storage and try again.", "error");
        }
    });
}