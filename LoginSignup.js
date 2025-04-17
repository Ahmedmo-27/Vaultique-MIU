document.addEventListener("DOMContentLoaded", function () {
    const flipContainer = document.querySelector(".flip-container");
    const registerLink = document.getElementById("register-link");
    const loginLink = document.getElementById("login-link");
    const forgotPasswordLink = document.getElementById("forgot-password");
    const adminLoginLink = document.getElementById("admin-login-link");
    const forgotPasswordContainer = document.getElementById("forgot-password-container");
    const closeForgotPasswordButton = document.getElementById("close-forgot-password");
    const loginForm = document.getElementById("login-form-id");

    // Toggle between login and signup forms
    registerLink.addEventListener("click", function (event) {
        event.preventDefault();
        flipContainer.classList.add("flipped");
    });

    loginLink.addEventListener("click", function (event) {
        event.preventDefault();
        flipContainer.classList.remove("flipped");
    });

    // Admin login (validate email and password)
    adminLoginLink.addEventListener("click", function (event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (email === "Admin@gmail.com" && password === "Admin123") {
            alert("Admin login successful");
            // Redirect to the admin dashboard
            window.location.href = "Admin Dashboard/AdminHubHomePage.html"; // Redirects to the dashboard page
        } else {
            alert("Invalid admin credentials");
        }
    });

    // Forgot password prompt with animation
    forgotPasswordLink.addEventListener("click", function (event) {
        event.preventDefault();
        forgotPasswordContainer.style.display = "flex";
    });

    // Close the forgot password prompt
    closeForgotPasswordButton.addEventListener("click", function () {
        forgotPasswordContainer.style.display = "none";
    });

    // Forgot password email sending
    document.getElementById("send-reset-link").addEventListener("click", function () {
        let email = document.getElementById("forgot-email").value;
        if (email) {
            alert(`A reset link has been sent to ${email}`);
            forgotPasswordContainer.style.display = "none";
        } else {
            alert("Please enter your email address.");
        }
    });
});
