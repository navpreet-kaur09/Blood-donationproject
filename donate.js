

const donorRegistrationForm = document.getElementById("donorRegistrationForm");

if (donorRegistrationForm) {
  const message = document.getElementById("message");

  function showMessage(text, isError) {
    message.textContent = text;
    message.style.color = isError ? "#b91c1c" : "#166534";
  }

  donorRegistrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("fullName").value.trim();
    const age = Number(document.getElementById("age").value);
    const email = document.getElementById("email").value.trim().toLowerCase();
    const phone = document.getElementById("phone").value.trim();
    const bloodGroup = document.getElementById("bloodGroup").value;
    const city = document.getElementById("city").value.trim();

    if (age < 18) {
      showMessage("You are not eligible to donate blood because donors must be at least 18 years old.", true);
      return;
    }
    if (age > 65) {
      showMessage("Donors must be 65 years old or younger. Please check with a donation center for guidance.", true);
      return;
    }
    if (!name || !email || !bloodGroup || !city) {
      showMessage("Please complete all fields before registering.", true);
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      showMessage("Please enter a valid 10-digit phone number.", true);
      return;
    }

    try {
      const savedDonors = localStorage.getItem("jeevanDonors") || localStorage.getItem("donors") || "[]";
      const donors = JSON.parse(savedDonors);
      if (!Array.isArray(donors)) throw new Error("Saved donor data must be a list.");

      const existingDonor = donors.find(function (donor) {
        return donor.email && donor.email.toLowerCase() === email;
      });
      if (existingDonor) {
        showMessage("This email is already registered as a donor.", true);
        return;
      }

      donors.push({
        id: "donor_" + Date.now(),
        name,
        age,
        email,
        phone,
        group: bloodGroup,
        city,
        available: true
      });
      localStorage.setItem("jeevanDonors", JSON.stringify(donors));
      showMessage("Thank you, " + name + "! You are registered as a donor.", false);
      donorRegistrationForm.reset();
    } catch (error) {
      console.error("[Jeevan] Could not save donor data.", error);
      showMessage("Could not save your registration in this browser. Please check browser storage and try again.", true);
    }
  });
}