document.addEventListener('DOMContentLoaded', function () {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);

  const backgroundColor = document.querySelector('body').style.backgroundColor;

  // Get all theme toggle buttons
  const toggleButtons = document.querySelectorAll('[data-theme-toggle]');

  toggleButtons.forEach((button) => {
    button.addEventListener('click', toggleTheme);

    // Initialize button state based on current theme
    if (savedTheme === 'light' || backgroundColor === '#e8d9c4') {
      button.classList.add('dark');
    } else {
      button.classList.remove('dark');
    }
  });
});

function setTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    // Update all toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.classList.add('dark');
    });
  } else {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    // Update all toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.classList.remove('dark');
    });
  }
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
}

// Make functions available globally
window.toggleTheme = toggleTheme;
