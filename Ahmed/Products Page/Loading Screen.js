document.addEventListener("DOMContentLoaded", function () {
    const loadingScreen = document.querySelector('.loading-screen');
    const header = document.querySelector('header');

    // Simulate loading delay (e.g., 3 seconds)
    setTimeout(() => {
        // Fade out the loading screen
        loadingScreen.style.opacity = '0';

        // Show the header (welcome page) after the fade-out transition
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            header.style.display = 'block'; // Ensure the header is visible
        }, 1000); // Match the fade-out transition duration
    }, 3000); // Adjust the loading delay as needed
});