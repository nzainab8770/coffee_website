# The Daily Brew — Coffee Shop Website

A simple, responsive coffee shop website with a full ordering flow.
Built with plain HTML, CSS and JavaScript — no libraries or frameworks.

## How to open it
Unzip the folder and double-click `index.html`. It opens in any browser.

## Files

```
index.html   → all page content (sections, cart drawer, checkout)
style.css    → main website design (colors, layout, responsive rules)
cart.css     → design for the cart + checkout
script.js    → mobile menu, navbar on scroll, contact form
cart.js      → the whole ordering system
images/      → all photos
```

## Order flow
1. **Select item**: click "Add to Cart" on any menu card
2. **Cart**: click the bag icon in the navbar
   - change the quantity with + / −
   - remove items
   - see the cart total
3. **Checkout**: enter your name, phone and email
4. **Delivery or Pickup**: delivery adds a $2.99 fee and asks for an address
5. **Payment method**: Card, Cash, or Mobile Wallet
6. **Place Order**: shows the confirmation (order number, time, total)

The cart is saved in the browser (localStorage), so it stays after a refresh.

## Easy changes
- **Colors:** edit the variables at the top of `style.css`
- **Delivery fee / tax:** edit `DELIVERY_FEE` and `TAX_RATE` at the top of `cart.js`
- **Add a menu item:** copy one `<article class="menu-card">` in `index.html`,
  then change `data-id`, `data-name`, `data-price`, the text and the image.
  The image must be saved as `images/<data-id>.jpg`.

## Note
This is a front-end demo. No real payments or emails are sent.
To take real orders you'd connect a backend or a service
(e.g. Stripe for payments, Formspree or EmailJS for emails).
