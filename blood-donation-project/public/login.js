
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm && loginMessage) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const loginInput = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        try {
            const storedUsers = localStorage.getItem("jeevanUsers");
            const users = storedUsers ? JSON.parse(storedUsers) : [];
            if (!Array.isArray(users)) throw new Error("Saved account data must be a list.");

            const user = users.find(function (account) {
                return ((account.email && account.email.toLowerCase() === loginInput) || account.phone === loginInput) &&
                    account.password === password;
            });

            if (!user) {
                loginMessage.textContent = "No registered user found or incorrect credentials.";
                loginMessage.className = "au-msg error";
                return;
            }

            const currentUser = { ...user };
            delete currentUser.password;
            localStorage.setItem("jeevanCurrentUser", JSON.stringify(currentUser));
            loginMessage.textContent = "Login successful!";
            loginMessage.className = "au-msg success";
            window.setTimeout(function () {
                window.location.href = "index.html";
            }, 800);
        } catch (error) {
            console.error("[Jeevan] Could not read or save account data.", error);
            loginMessage.textContent = "Could not access account data in this browser. Please check browser storage and try again.";
            loginMessage.className = "au-msg error";
        }
    });
}