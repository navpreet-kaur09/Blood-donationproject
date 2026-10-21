document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const emailOrPhone =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");

        const savedUser = JSON.parse(
            localStorage.getItem("jeevanUser")
        );

        if (!savedUser) {
            message.textContent =
                "No account found. Please register first.";

            message.style.color = "red";
            return;
        }

        if (
            (emailOrPhone === savedUser.email ||
             emailOrPhone === savedUser.phone) &&
            password === savedUser.password
        ) {

            localStorage.setItem("jeevanLoggedIn", "true");

            message.textContent = "Login successful!";
            message.style.color = "green";

            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);

        } else {

            message.textContent =
                "Invalid email/phone or password.";

            message.style.color = "red";
        }

    });

});