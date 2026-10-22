console.log("donate.js is connected");

const registerBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");

registerBtn.addEventListener("click", function () {
  const name = document.getElementById("fullName").value.trim();
  const age = Number(document.getElementById("age").value);
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const bloodGroup = document.getElementById("bloodGroup").value;
  const city = document.getElementById("city").value.trim();

  if (name === "") {
    showMessage("Please enter your name.", "red");
    return;
  }
  if (age < 18 || age > 65) {
    showMessage("Age must be between 18 and 65.", "red");
    return;
  }
  if (!email.includes("@") || !email.includes(".")) {
    showMessage("Please enter a valid email.", "red");
    return;
  }
  if (phone.length !== 10 || isNaN(phone)) {
    showMessage("Phone number must be 10 digits.", "red");
    return;
  }
  if (bloodGroup === "") {
    showMessage("Please select your blood group.", "red");
    return;
  }
  if (city === "") {
    showMessage("Please enter your city.", "red");
    return;
  }

  const donor = { name, age, email, phone, bloodGroup, city };
  const donors = JSON.parse(localStorage.getItem("donors")) || [];
  donors.push(donor);
  localStorage.setItem("donors", JSON.stringify(donors));

  showMessage("Thank you, " + name + "! You are registered.", "green");
  document.querySelector("form").reset();
});

function showMessage(text, color) {
  message.textContent = text;
  message.style.color = color;
}