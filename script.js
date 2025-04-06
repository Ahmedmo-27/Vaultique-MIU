document.addEventListener("DOMContentLoaded", function () {
  // Flip card functionality
  const flipCard = document.getElementById("flip-card");
  const flipBtn = document.getElementById("flip-card-btn");
  let isFlipped = false;

  flipBtn.addEventListener("click", () => {
    isFlipped = !isFlipped;
    if (isFlipped) {
      flipCard.classList.add("flipped");
      flipBtn.textContent = "Hide Card Details";
    } else {
      flipCard.classList.remove("flipped");
      flipBtn.textContent = "View Card Details";
    }
  });

  // Form input bindings to card display
  const nameInput = document.getElementById("name");
  const bankNameInput = document.getElementById("bank-name");
  const cardNumberInput = document.getElementById("card-number");
  const cvvInput = document.getElementById("cvv");
  const expiryInput = document.getElementById("expiry");

  // Display elements
  const displayName = document.getElementById("display-card-holder");
  const displayBankName = document.getElementById("display-bank-name");
  const displayNumber = document.getElementById("display-card-number");
  const displayCvv = document.getElementById("display-cvv");
  const displayExpiry = document.getElementById("display-expiry");

  // Initialize with existing values
  displayName.textContent = nameInput.value || "FULL NAME";

  // Bind input events
  nameInput.addEventListener("input", function () {
    displayName.textContent = this.value || "FULL NAME";
  });

  bankNameInput.addEventListener("input", function () {
    displayBankName.textContent = this.value || "BANK NAME";
  });

  cardNumberInput.addEventListener("input", function () {
    let value = this.value.replace(/\s/g, "");
    let formatted = "";
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += " ";
      formatted += value[i];
    }
    displayNumber.textContent = formatted || "################";
    this.value = formatted;
  });

  cvvInput.addEventListener("input", function () {
    const cvv = this.value;
    displayCvv.textContent = cvv ? `CVV: ${cvv.replace(/./g, "•")}` : "CVV";

    // CVV validation
    const isValid = /^\d{3,4}$/.test(cvv);
    document.getElementById("cvvError").style.display =
      cvv && !isValid ? "block" : "none";
    this.classList.toggle("invalid", cvv && !isValid);
    this.classList.toggle("valid", cvv && isValid);
  });

  expiryInput.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    displayExpiry.textContent = value ? `Expires: ${value}` : "MM/YY";
    this.value = value;

    // Expiry validation
    const isValid = /^\d{2}\/\d{2}$/.test(value);
    document.getElementById("expiryError").style.display =
      value && !isValid ? "block" : "none";
    this.classList.toggle("invalid", value && !isValid);
    this.classList.toggle("valid", value && isValid);
  });

  // Form submission
  const completeBtn = document.querySelector(".complete-purchase-btn");
  completeBtn.addEventListener("click", function (event) {
    event.preventDefault();

    // Validate all fields
    const isNameValid = validateName();
    const isCardNumberValid = validateCardNumber();
    const isBankNameValid = validateBankName();
    const isCvvValid = validateCVV();
    const isExpiryValid = validateExpiry();

    if (
      isNameValid &&
      isCardNumberValid &&
      isBankNameValid &&
      isCvvValid &&
      isExpiryValid
    ) {
      // All validations passed - show success message
      showSuccessMessage();

      // Redirect to prototype.html in the same tab after 2 seconds
      setTimeout(function () {
        window.location.href = "/prototype.html";
      }, 2000);
    } else {
      // Show error message
      const errorPopup = document.getElementById("login-message-error-popup");
      errorPopup.querySelector("h2").textContent =
        "Please check your card details";
      errorPopup.style.display = "block";

      // Scroll to first error
      const firstError = document.querySelector(".invalid");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Hide error after 2 seconds
      setTimeout(function () {
        errorPopup.style.display = "none";
      }, 2000);
    }
  });

  // Validation functions
  function validateName() {
    const name = nameInput.value.trim();
    if (!name) {
      showError(nameInput, "Please enter your full name");
      return false;
    }
    if (!/^[a-zA-Z ]+$/.test(name)) {
      showError(nameInput, "Name should only contain letters and spaces");
      return false;
    }
    if (name.split(" ").length < 2) {
      showError(nameInput, "Please enter both first and last name");
      return false;
    }
    clearError(nameInput);
    return true;
  }

  function validateCardNumber() {
    const cardNumber = cardNumberInput.value.replace(/\s/g, "");
    if (!cardNumber) {
      showError(cardNumberInput, "Please enter a card number");
      return false;
    }
    if (!/^\d{16}$/.test(cardNumber)) {
      showError(cardNumberInput, "Card number must be 16 digits");
      return false;
    }
    if (!luhnCheck(cardNumber)) {
      showError(cardNumberInput, "Invalid card number");
      return false;
    }
    clearError(cardNumberInput);
    return true;
  }

  function validateBankName() {
    const bankName = bankNameInput.value.trim();
    if (!bankName) {
      showError(bankNameInput, "Please enter your bank name");
      return false;
    }
    clearError(bankNameInput);
    return true;
  }

  function validateCVV() {
    const cvv = cvvInput.value.trim();
    if (!cvv) {
      showError(cvvInput, "Please enter CVV");
      document.getElementById("cvvError").style.display = "block";
      return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      showError(cvvInput, "CVV must be 3 or 4 digits");
      document.getElementById("cvvError").style.display = "block";
      return false;
    }
    clearError(cvvInput);
    document.getElementById("cvvError").style.display = "none";
    return true;
  }

  function validateExpiry() {
    const expiry = expiryInput.value.trim();
    if (!expiry) {
      showError(expiryInput, "Please enter expiry date");
      document.getElementById("expiryError").style.display = "block";
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      showError(expiryInput, "Invalid format (MM/YY)");
      document.getElementById("expiryError").style.display = "block";
      return false;
    }

    const [month, year] = expiry.split("/").map(Number);
    if (month < 1 || month > 12) {
      showError(expiryInput, "Invalid month (1-12)");
      document.getElementById("expiryError").style.display = "block";
      return false;
    }

    // Check if card is expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      showError(expiryInput, "Card has expired");
      document.getElementById("expiryError").style.display = "block";
      return false;
    }

    clearError(expiryInput);
    document.getElementById("expiryError").style.display = "none";
    return true;
  }

  // Helper functions
  function showError(input, message) {
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains("error")) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
    input.classList.add("invalid");
    input.classList.remove("valid");
  }

  function clearError(input) {
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains("error")) {
      errorElement.style.display = "none";
    }
    input.classList.remove("invalid");
    input.classList.add("valid");
  }

  function luhnCheck(cardNumber) {
    let sum = 0;
    let alternate = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));

      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  }

  function showSuccessMessage() {
    const successPopup = document.getElementById("login-message-popup");
    successPopup.style.display = "flex";

    setTimeout(() => {
      successPopup.style.display = "none";
    }, 2000);
  }

  // Initialize steps
  const steps = document.querySelectorAll(".step");
  const progressFill = document.querySelector(".progress");

  // Function to update progress
  function updateProgress(activeIndex) {
    // Update step classes
    steps.forEach((step, index) => {
      step.classList.remove("active", "completed");
      if (index < activeIndex) {
        step.classList.add("completed");
      } else if (index === activeIndex) {
        step.classList.add("active");
      }
    });

    // Update progress bar
    const progressPercent = (activeIndex / (steps.length - 1)) * 100;
    progressFill.style.width = `${progressPercent}%`;
  }

  // Initialize first step as active
  updateProgress(0);
});

// Make handleFormSubmission available globally for the onclick attribute
function handleFormSubmission(event) {
  // This will be called from the onclick attribute in HTML
  document.querySelector(".complete-purchase-btn").click();
}
