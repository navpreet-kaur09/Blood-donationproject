const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const role = document.querySelector('input[name="role"]:checked').value;
    const name = document.querySelector('input[type="text"]').value.trim();
    const email = document.querySelector('input[type="email"]').value.trim();
    const phone = document.querySelector('input[type="tel"]').value.trim();
    const bloodGroup = document.querySelector("select").value;

    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const password = passwordInputs[0].value;
    const confirmPassword = passwordInputs[1].value;

    // Validation
    if (!name || !email || !phone || !bloodGroup || !password || !confirmPassword) {
        alert("Please fill all the fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Get existing users
    let users = JSON.parse(localStorage.getItem("jeevanUsers")) || [];

    // Check if email already exists
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        alert("An account with this email already exists.");
        return;
    }

    // Create new user
    const newUser = {
        role: role,
        name: name,
        email: email,
        phone: phone,
        bloodGroup: bloodGroup,
        password: password
    };

    // Save user
    users.push(newUser);
    localStorage.setItem("jeevanUsers", JSON.stringify(users));

    alert("Account created successfully!");

    // Go to login
    window.location.href = "login.html";
});