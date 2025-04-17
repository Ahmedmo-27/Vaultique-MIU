document.addEventListener("DOMContentLoaded", function () {
    const darkModeToggle = document.querySelector("#switch-mode");
    const body = document.body;

    // Check localStorage for dark mode setting
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark");
        darkModeToggle.checked = true;
    }

    // Toggle dark mode
    darkModeToggle.addEventListener("change", function () {
        if (this.checked) {
            body.classList.add("dark");
            localStorage.setItem("darkMode", "enabled");
        } else {
            body.classList.remove("dark");
            localStorage.setItem("darkMode", "disabled");
        }
    });
});
