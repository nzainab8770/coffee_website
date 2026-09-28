/* =========================================================
   THE DAILY BREW — Cart & Checkout
   ---------------------------------------------------------
   ORDER FLOW:
   Select item → Add to Cart → Quantity + / − → Remove Item
   → Cart Total → Checkout → Customer Details
   → Delivery / Pickup → Payment Method → Place Order
   → Order Confirmation

   The cart is saved in localStorage, so it's still there
   if you refresh the page.
   ========================================================= */


/* ---------- 1. SETTINGS ---------- */
const DELIVERY_FEE = 2.99;   // added only for delivery orders
const TAX_RATE     = 0.08;   // 8% tax


/* ---------- 2. CART DATA ----------
   The cart is a simple array of objects, e.g.
   [ { id: "latte", name: "Latte", price: 4.75, qty: 2 } ]      */
let cart = JSON.parse(localStorage.getItem("dailyBrewCart")) || [];

// Save the cart to the browser so it survives a page refresh
function saveCart() {
  localStorage.setItem("dailyBrewCart", JSON.stringify(cart));
}

// Turn a number into a price string: 4.5 → "$4.50"
function money(amount) {
  return "$" + amount.toFixed(2);
}


/* ---------- 3. GET PAGE ELEMENTS ---------- */
const cartDrawer   = document.getElementById("cart-drawer");
const overlay      = document.getElementById("overlay");
const cartItemsEl  = document.getElementById("cart-items");
const cartCountEl  = document.getElementById("cart-count");
const cartSubEl    = document.getElementById("cart-subtotal");
const checkoutEl   = document.getElementById("checkout");
const toastEl      = document.getElementById("toast");

const detailsForm  = document.getElementById("step-details");
const paymentForm  = document.getElementById("step-payment");


/* ---------- 4. CART MATH ---------- */

// Total number of items (for the little badge)
function getItemCount() {
  let count = 0;
  cart.forEach(function (item) { count += item.qty; });
  return count;
}

// Price of all items before fees
function getSubtotal() {
  let total = 0;
  cart.forEach(function (item) { total += item.price * item.qty; });
  return total;
}

// Is the customer choosing delivery or pickup?
function getMethod() {
  return document.querySelector('input[name="method"]:checked').value;
}

// Subtotal + delivery fee + tax
function getTotals() {
  const subtotal = getSubtotal();
  const delivery = getMethod() === "delivery" ? DELIVERY_FEE : 0;
  const tax      = subtotal * TAX_RATE;
  return { subtotal: subtotal, delivery: delivery, tax: tax, total: subtotal + delivery + tax };
}


/* ---------- 5. ADD / CHANGE / REMOVE ITEMS ---------- */

function addToCart(id, name, price) {
  // If the item is already in the cart, just increase the quantity
  const existing = cart.find(function (item) { return item.id === id; });

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: id, name: name, price: price, qty: 1 });
  }

  saveCart();
  renderCart();
  showToast(name + " added to cart");

  // Make the badge "pop"
  cartCountEl.classList.remove("bump");
  void cartCountEl.offsetWidth;          // restart the animation
  cartCountEl.classList.add("bump");
}

// change = +1 or -1
function changeQty(id, change) {
  const item = cart.find(function (i) { return i.id === id; });
  if (!item) return;

  item.qty += change;

  // If quantity reaches 0, remove the item
  if (item.qty <= 0) {
    removeItem(id);
    return;
  }

  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(function (item) { return item.id !== id; });
  saveCart();
  renderCart();
}


/* ---------- 6. DRAW THE CART ON THE PAGE ---------- */

function renderCart() {
  // Badge number
  cartCountEl.textContent = getItemCount();

  // Empty or not?
  cartDrawer.classList.toggle("is-empty", cart.length === 0);

  // Build one <li> per item
  cartItemsEl.innerHTML = "";

  cart.forEach(function (item) {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <img src="images/${item.id}.jpg" alt="${item.name}">
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${money(item.price)} each</div>
        <div class="qty">
          <button type="button" data-action="minus" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button type="button" data-action="plus" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-total">${money(item.price * item.qty)}</span>
        <button type="button" class="remove-btn" data-action="remove">Remove</button>
      </div>
    `;

    // Connect the buttons inside this item
    li.querySelector('[data-action="minus"]').addEventListener("click", function () { changeQty(item.id, -1); });
    li.querySelector('[data-action="plus"]').addEventListener("click", function () { changeQty(item.id, 1); });
    li.querySelector('[data-action="remove"]').addEventListener("click", function () { removeItem(item.id); });

    cartItemsEl.appendChild(li);
  });

  // Cart total
  cartSubEl.textContent = money(getSubtotal());

  // Keep the checkout summary up to date too
  renderSummary();
}

// Order summary on the right side of checkout
function renderSummary() {
  const list = document.getElementById("summary-items");
  list.innerHTML = "";

  cart.forEach(function (item) {
    const li = document.createElement("li");
    li.innerHTML = `<span><span class="qty-label">${item.qty}×</span>${item.name}</span>
                    <span>${money(item.price * item.qty)}</span>`;
    list.appendChild(li);
  });

  const t = getTotals();
  document.getElementById("sum-subtotal").textContent = money(t.subtotal);
  document.getElementById("sum-delivery").textContent = t.delivery ? money(t.delivery) : "Free";
  document.getElementById("sum-tax").textContent      = money(t.tax);
  document.getElementById("sum-total").textContent    = money(t.total);
}


/* ---------- 7. "ADD TO CART" BUTTONS ON MENU CARDS ---------- */

document.querySelectorAll(".add-to-cart").forEach(function (button) {
  button.addEventListener("click", function () {
    // Read the item info from the card's data-* attributes
    const card  = button.closest(".menu-card");
    const id    = card.dataset.id;
    const name  = card.dataset.name;
    const price = parseFloat(card.dataset.price);

    addToCart(id, name, price);

    // Show "Added ✓" for a moment
    button.textContent = "Added ✓";
    button.classList.add("added");
    setTimeout(function () {
      button.textContent = "Add to Cart";
      button.classList.remove("added");
    }, 1200);
  });
});


/* ---------- 8. OPEN / CLOSE THE CART DRAWER ---------- */

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";   // stop page from scrolling behind
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

document.getElementById("open-cart").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
document.getElementById("browse-menu").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);


/* ---------- 9. CHECKOUT: OPEN / CLOSE / SWITCH STEPS ---------- */

function showStep(stepNumber) {
  const panels = ["step-details", "step-payment", "step-confirm"];

  // Show only the chosen panel
  panels.forEach(function (id, index) {
    document.getElementById(id).classList.toggle("active", index === stepNumber - 1);
  });

  // Update the step indicator (1 — 2 — 3)
  document.querySelectorAll("#steps li").forEach(function (li, index) {
    li.classList.toggle("active", index === stepNumber - 1);
    li.classList.toggle("done", index < stepNumber - 1);
  });

  // Hide the summary on the final step
  checkoutEl.classList.toggle("confirmed", stepNumber === 3);

  // Scroll the box back to the top
  checkoutEl.querySelector(".checkout-box").scrollTop = 0;
}

function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  showStep(1);
  renderSummary();
  checkoutEl.classList.add("open");
  checkoutEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCheckout() {
  checkoutEl.classList.remove("open");
  checkoutEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.getElementById("go-checkout").addEventListener("click", openCheckout);
document.getElementById("close-checkout").addEventListener("click", function () {
  // If the order was already placed, closing works like "Back to Home"
  if (checkoutEl.classList.contains("confirmed")) {
    finishOrder();
  } else {
    closeCheckout();
  }
});
document.getElementById("back-to-details").addEventListener("click", function () { showStep(1); });

// Press Escape to close the cart or checkout
document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  if (checkoutEl.classList.contains("open") && !checkoutEl.classList.contains("confirmed")) closeCheckout();
  else closeCart();
});


/* ---------- 10. DELIVERY / PICKUP SWITCH ---------- */

function updateMethod() {
  const isDelivery = getMethod() === "delivery";

  // Show address field for delivery, store info for pickup
  document.getElementById("address-group").style.display = isDelivery ? "block" : "none";
  document.getElementById("pickup-info").style.display   = isDelivery ? "none" : "block";

  // "Cash on Delivery" becomes "Cash at Pickup"
  document.getElementById("cash-label").textContent = isDelivery ? "Cash on Delivery" : "Cash at Pickup";

  renderSummary();   // delivery fee changes the total
}

document.querySelectorAll('input[name="method"]').forEach(function (radio) {
  radio.addEventListener("change", updateMethod);
});


/* ---------- 11. PAYMENT METHOD SWITCH ---------- */

function getPayment() {
  return document.querySelector('input[name="payment"]:checked').value;
}

function updatePayment() {
  document.getElementById("card-fields").style.display = getPayment() === "card" ? "block" : "none";
}

document.querySelectorAll('input[name="payment"]').forEach(function (radio) {
  radio.addEventListener("change", updatePayment);
});

// Auto-format the card number as "1234 5678 9012 3456"
document.getElementById("card-number").addEventListener("input", function (e) {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
  e.target.value = digits.replace(/(.{4})/g, "$1 ").trim();
});

// Auto-format expiry as "MM/YY"
document.getElementById("card-expiry").addEventListener("input", function (e) {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
  e.target.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
});

// Only numbers in CVC
document.getElementById("card-cvc").addEventListener("input", function (e) {
  e.target.value = e.target.value.replace(/\D/g, "");
});


/* ---------- 12. SIMPLE FORM CHECKS ---------- */

// Marks a field red if the check fails. Returns true if OK.
function checkField(id, isValid) {
  const input = document.getElementById(id);
  input.classList.toggle("invalid", !isValid);
  return isValid;
}

// Remove the red border as soon as the user types
document.querySelectorAll(".checkout input").forEach(function (input) {
  input.addEventListener("input", function () { input.classList.remove("invalid"); });
});

function value(id) {
  return document.getElementById(id).value.trim();
}


/* ---------- 13. STEP 1 → STEP 2 (Customer details) ---------- */

detailsForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // "&" (not "&&") so every field gets checked and highlighted
  let ok = true;
  ok = checkField("c-name",  value("c-name").length >= 2) && ok;
  ok = checkField("c-phone", value("c-phone").replace(/\D/g, "").length >= 7) && ok;
  ok = checkField("c-email", /^\S+@\S+\.\S+$/.test(value("c-email"))) && ok;

  if (getMethod() === "delivery") {
    ok = checkField("c-address", value("c-address").length >= 5) && ok;
  }

  const errorEl = document.getElementById("details-error");
  if (!ok) {
    errorEl.textContent = "Please fill in the highlighted fields.";
    return;
  }

  errorEl.textContent = "";
  showStep(2);
});


/* ---------- 14. STEP 2 → STEP 3 (Place order) ---------- */

paymentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // Only check card fields if paying by card
  let ok = true;
  if (getPayment() === "card") {
    ok = checkField("card-number", value("card-number").replace(/\s/g, "").length === 16) && ok;
    ok = checkField("card-expiry", /^(0[1-9]|1[0-2])\/\d{2}$/.test(value("card-expiry"))) && ok;
    ok = checkField("card-cvc",    value("card-cvc").length >= 3) && ok;
  }

  const errorEl = document.getElementById("payment-error");
  if (!ok) {
    errorEl.textContent = "Please check your card details.";
    return;
  }
  errorEl.textContent = "";

  placeOrder();
});


/* ---------- 15. PLACE ORDER + CONFIRMATION ---------- */

function placeOrder() {
  const isDelivery = getMethod() === "delivery";
  const t = getTotals();

  // Make a random order number like "DB-48213"
  const orderNumber = "DB-" + Math.floor(10000 + Math.random() * 90000);

  const paymentNames = {
    card:   "Card ending " + value("card-number").slice(-4),
    cash:   isDelivery ? "Cash on Delivery" : "Cash at Pickup",
    wallet: "Mobile Wallet"
  };

  // Fill in the confirmation screen
  document.getElementById("confirm-name").textContent    = value("c-name").split(" ")[0];
  document.getElementById("confirm-email").textContent   = value("c-email");
  document.getElementById("confirm-number").textContent  = orderNumber;
  document.getElementById("confirm-method").textContent  = isDelivery ? "Delivery" : "Pickup";
  document.getElementById("confirm-payment").textContent = paymentNames[getPayment()];
  document.getElementById("confirm-time").textContent    = isDelivery ? "30–45 minutes" : "Ready in 15 minutes";
  document.getElementById("confirm-total").textContent   = money(t.total);

  // Show the address row only for delivery
  document.getElementById("confirm-address-row").style.display = isDelivery ? "flex" : "none";
  document.getElementById("confirm-address").textContent = value("c-address");

  showStep(3);

  // Empty the cart — the order is done
  cart = [];
  saveCart();
  renderCart();
}

// "Back to Home" button on the confirmation screen
function finishOrder() {
  closeCheckout();
  detailsForm.reset();
  paymentForm.reset();
  updateMethod();
  updatePayment();
  showStep(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("finish-order").addEventListener("click", finishOrder);


/* ---------- 16. TOAST MESSAGE ---------- */
let toastTimer;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2000);
}


/* ---------- 17. START ---------- */
// Draw the cart once when the page loads
updateMethod();
updatePayment();
renderCart();

/* ---------- 18. ORDER NOW BUTTON FLOW ---------- */
const orderStartEl = document.getElementById("order-start");
const navOrderNow = document.getElementById("nav-order-now");
const heroOrderNow = document.getElementById("hero-order-now");
const closeOrderStart = document.getElementById("close-order-start");
const startBrowseMenu = document.getElementById("start-browse-menu");
const startViewCart = document.getElementById("start-view-cart");

function openOrderStart() {
  if (cart.length > 0) {
    openCart();
    return;
  }

  orderStartEl.classList.add("open");
  orderStartEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeOrderStartScreen() {
  orderStartEl.classList.remove("open");
  orderStartEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function handleOrderNow(event) {
  event.preventDefault();
  openOrderStart();
}

navOrderNow.addEventListener("click", handleOrderNow);
heroOrderNow.addEventListener("click", handleOrderNow);
closeOrderStart.addEventListener("click", closeOrderStartScreen);

startBrowseMenu.addEventListener("click", function () {
  closeOrderStartScreen();
  setTimeout(function () {
    document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
  }, 50);
});

startViewCart.addEventListener("click", function () {
  closeOrderStartScreen();
  openCart();
});

orderStartEl.addEventListener("click", function (event) {
  if (event.target === orderStartEl) closeOrderStartScreen();
});
