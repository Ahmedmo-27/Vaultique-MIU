document.addEventListener('DOMContentLoaded', function () {
  const loadingScreen = document.querySelector('.loading-screen');
  const header = document.querySelector('header');
  const progressBar = document.querySelector('.progress-bar-loading');
  const progressText = document.querySelector('.progress-text');
  const spinner = document.querySelector('.spinner');

  const MIN_DISPLAY_TIME = 1500; // Minimum time to show loading screen (1.5 seconds)
  const startTime = Date.now();

  // Function to update progress
  function updateProgress(progress) {
    const roundedProgress = Math.round(progress);
    progressBar.style.width = `${roundedProgress}%`;
    progressText.textContent = `${roundedProgress}%`;
  }

  // Function to check if all resources are loaded
  function checkAllResourcesLoaded() {
    const resources = document.querySelectorAll('img, video, audio, iframe');
    let loadedCount = 0;
    const totalResources = resources.length;
    let hasError = false;

    if (totalResources === 0) {
      // If no resources to load, complete after minimum display time
      updateProgress(100);
      setTimeout(hideLoadingScreen, MIN_DISPLAY_TIME);
      return;
    }

    resources.forEach((resource) => {
      if (resource.complete || resource.readyState >= 4) {
        loadedCount++;
        updateProgress((loadedCount / totalResources) * 100);
      } else {
        resource.addEventListener('load', () => {
          loadedCount++;
          updateProgress((loadedCount / totalResources) * 100);
          checkCompletion();
        });

        resource.addEventListener('error', () => {
          hasError = true;
          loadedCount++;
          updateProgress((loadedCount / totalResources) * 100);
          checkCompletion();
        });
      }
    });

    function checkCompletion() {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime);

      if (loadedCount === totalResources) {
        setTimeout(hideLoadingScreen, remainingTime);
      }
    }

    // Fallback in case some resources fail to load
    setTimeout(() => {
      if (loadingScreen.style.display !== 'none') {
        hideLoadingScreen();
      }
    }, 8000); // Increased timeout to 8 seconds
  }

  function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      if (header) header.style.display = 'block';
    }, 800);
  }

  // Start checking resources
  checkAllResourcesLoaded();
});
