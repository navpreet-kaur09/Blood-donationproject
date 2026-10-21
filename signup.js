document.addEventListener("DOMContentLoaded", function () {

    const signupForm = document.getElementById("signupForm");

    signupForm.addEventListener("submit", function (event) {

        event.preventDefault();

        // Get form values
        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const phone = document.getElementById("signupPhone").value.trim();
        const bloodGroup = document.getElementById("signupBloodGroup").value;

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const role =
            document.querySelector('input[name="role"]:checked').value;

        const message =
            document.getElementById("signupMessage");


        // Check password
        if (password !== confirmPassword) {

            message.textContent = "Passwords do not match.";
            message.style.color = "red";

            return;
        }


        // Get existing users
        let users =
            JSON.parse(localStorage.getItem("jeevanUsers")) || [];


        // Check if email already exists
        const emailExists = users.some(function (user) {
            return user.email === email;
        });

        if (emailExists) {

            message.textContent =
                "This email is already registered. Please login.";

            message.style.color = "red";

            return;
        }


        // Check if phone already exists
        const phoneExists = users.some(function (user) {
            return user.phone === phone;
        });

        if (phoneExists) {

            message.textContent =
                "This phone number is already registered. Please login.";

            message.style.color = "red";

            return;
        }


        // Create new user
        const user = {

            name: name,
            email: email,
            phone: phone,
            bloodGroup: bloodGroup,
            role: role,
            password: password

        };


        // Add user to users array
        users.push(user);


        // Save users
        localStorage.setItem(
            "jeevanUsers",
            JSON.stringify(users)
        );


        // Success message
        message.textContent =
            "Account created successfully!";

        message.style.color = "green";


        // Go to login page
        setTimeout(function () {

            window.location.href = "login.html";

        }, 1000);

    });

});