const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const loginInput = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("jeevanUsers")) || [];

    const user = users.find(
        user =>
            (user.email === loginInput || user.phone === loginInput) &&
            user.password === password
    );

    if (user) {
        loginMessage.textContent = "Login successful!";

        localStorage.setItem("jeevanCurrentUser", JSON.stringify(user));

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } else {
        loginMessage.textContent = "No registered user found or incorrect credentials.";
    }
});