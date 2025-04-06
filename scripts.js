
const cartItems = document.querySelectorAll('.cart-item');
const emptyCartMessage = document.querySelector('.empty-cart');
const itemsInCartDisplay = document.querySelector('#cart-items-count');
const shippingDropdown = document.querySelector('#shipping');
const subtotalElement = document.querySelector('.subtotal');
const totalPriceElement = document.querySelector('.total-price');
const shippingCostElement = document.querySelector('#shipping-cost');

function updateTotalPrice() {
  let subtotal = 0;
  cartItems.forEach(item => {
    const quantity = parseInt(item.querySelector('.quantity-display').textContent);
    const price = parseFloat(item.querySelector('.item-price').textContent.replace('$', ''));
    subtotal += quantity * price;
  });

  const selectedShipping = shippingDropdown.value;
  let shippingCost = selectedShipping === 'fast' ? 50 : 20;
  shippingCostElement.textContent = `$${shippingCost.toFixed(2)}`;
  const total = subtotal + shippingCost;
  subtotalElement.textContent = `Subtotal: $${subtotal.toFixed(2)}`;
  totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;
}

function checkEmptyCart() {
  let empty = true;
  cartItems.forEach(item => {
    const quantity = parseInt(item.querySelector('.quantity-display').textContent);
    if (quantity > 0) empty = false;
  });
  emptyCartMessage.style.display = empty ? 'block' : 'none';
}

function updateItemsInCart() {
  let totalItems = 0;
  cartItems.forEach(item => {
    const quantity = parseInt(item.querySelector('.quantity-display').textContent);
    totalItems += quantity;
  });
  itemsInCartDisplay.textContent = totalItems;
}

shippingDropdown.addEventListener('change', updateTotalPrice);

cartItems.forEach(item => {
  const increaseBtn = item.querySelector('.increase');
  const decreaseBtn = item.querySelector('.decrease');
  const quantityDisplay = item.querySelector('.quantity-display');

  increaseBtn.addEventListener('click', () => {
    let quantity = parseInt(quantityDisplay.textContent);
    quantity++;
    quantityDisplay.textContent = quantity;
    item.style.display = 'flex';
    updateTotalPrice();
    updateItemsInCart();
    checkEmptyCart();
  });

  decreaseBtn.addEventListener('click', () => {
    let quantity = parseInt(quantityDisplay.textContent);
    if (quantity > 0) {
      quantity--;
      quantityDisplay.textContent = quantity;
      if (quantity === 0) item.style.display = 'none';
      updateTotalPrice();
      updateItemsInCart();
    }
    checkEmptyCart();
  });
});

updateTotalPrice();
updateItemsInCart();
checkEmptyCart();