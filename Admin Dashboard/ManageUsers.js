document.querySelectorAll(".update-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const userCard = button.parentElement;
    const name = userCard.querySelector("h2").textContent;
    const email = userCard.querySelector("input[type='email']").value;
    const phone = userCard.querySelector("input[type='tel']").value;

    alert(`Updated info for ${name}:\nEmail: ${email}\nPhone: ${phone}`);
  });
});
