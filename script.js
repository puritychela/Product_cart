const cart = {};
const productList = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartSummary = document.getElementById("cart-summary");

let products = [];

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  // Modal event listeners
  document
    .querySelector(".confirm-btn")
    ?.addEventListener("click", confirmOrder);
  document
    .querySelector(".start-new-btn")
    ?.addEventListener("click", startNewOrder);
});

// Fetch and load products
async function loadProducts() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    products = data.map((item, index) => ({
      id: `product-${index}`,
      title: item.name,
      name: item.name,
      category: item.category,
      price: item.price,
      image: item.image.desktop,
    }));
    renderProducts();
  } catch (error) {
    console.error("Failed to load products:", error);
  }
}

// Render products
function renderProducts() {
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "card";
    card.id = `card-${product.id}`;
    card.dataset.id = product.id;

    card.innerHTML = `
      <div class="image-container">
        <img src="${product.image}" alt="${product.title}" />
        <div class="add-to-cart-container" id="add-${product.id}">
          <button class="add-button" onclick="addToCart('${product.id}')">
            <img src="images/icon-add-to-cart.svg" alt="Add to Cart" />
            Add to Cart
          </button>
        </div>
      </div>
      <div class="details">
        <div class="subtitle">${product.category}</div>
        <div class="title">${product.title}</div>
        <div class="price">$${product.price.toFixed(2)}</div>
      </div>
    `;
    productList.appendChild(card);
  });
}

// Update cart UI
function updateCartUI() {
  const totalItems = Object.values(cart).reduce((a, b) => a + b.quantity, 0);
  cartCount.textContent = totalItems;

  if (totalItems === 0) {
    cartItems.classList.add("empty");
    cartItems.innerHTML = `
      <img src="images/illustration-empty-cart.svg" alt="Empty cart" />
      <p>Your added items will appear here</p>
    `;
    cartSummary.classList.add("hidden");
    return;
  }

  cartItems.classList.remove("empty");
  cartItems.innerHTML = "";
  let total = 0;

  Object.entries(cart).forEach(([id, item]) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const itemEl = document.createElement("div");
    itemEl.classList.add("cart-item");
    itemEl.innerHTML = `
      <div class="item-info">
        <div class="item-title">${item.title}</div>
        <div class="item-meta">
          <span>${item.quantity}x</span>
          <span>@$${item.price.toFixed(2)}</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
      </div>
      <button class="remove-item" onclick="removeItem('${id}')">
        <img src="images/icon-remove-item.svg" alt="Remove" />
      </button>
    `;
    cartItems.appendChild(itemEl);
  });

  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartSummary.classList.remove("hidden");
}

// Add to cart
function addToCart(id) {
  if (!cart[id]) {
    const product = products.find((p) => p.id === id);
    cart[id] = { ...product, quantity: 1 };
  }

  const addDiv = document.getElementById(`add-${id}`);
  addDiv.innerHTML = `
    <div class="in-cart">
      <span>${cart[id].quantity} in Cart</span>
      <div class="counter">
        <button onclick="decrease('${id}')">
          <img src="images/icon-decrement-quantity.svg" alt="Decrease" />
        </button>
        <span id="qty-${id}">${cart[id].quantity}</span>
        <button onclick="increase('${id}')">
          <img src="images/icon-increment-quantity.svg" alt="Increase" />
        </button>
      </div>
    </div>
  `;
  updateCartUI();
}

// Increase quantity
function increase(id) {
  cart[id].quantity++;
  document.getElementById(`qty-${id}`).textContent = cart[id].quantity;

  const container = document.getElementById(`add-${id}`);
  if (container) {
    const label = container.querySelector(".in-cart span");
    if (label) {
      label.textContent = `${cart[id].quantity} in Cart`;
    }
  }

  updateCartUI();
}

// Decrease quantity
function decrease(id) {
  cart[id].quantity--;
  if (cart[id].quantity === 0) {
    removeItem(id);
  } else {
    document.getElementById(`qty-${id}`).textContent = cart[id].quantity;
    const container = document.getElementById(`add-${id}`);
    if (container) {
      const label = container.querySelector(".in-cart span");
      if (label) {
        label.textContent = `${cart[id].quantity} in Cart`;
      }
    }
  }
  updateCartUI();
}

// Remove item
function removeItem(id) {
  delete cart[id];
  const addDiv = document.getElementById(`add-${id}`);
  if (addDiv) {
    addDiv.innerHTML = `
      <button class="add-button" onclick="addToCart('${id}')">
        <img src="images/icon-add-to-cart.svg" alt="Add to Cart" />
        Add to Cart
      </button>
    `;
  }
  updateCartUI();
}

// Confirm order
function confirmOrder() {
  const modal = document.getElementById("confirmationModal");
  const confirmationItems = document.getElementById("confirmationItems");
  const confirmationTotal = document.getElementById("confirmationTotal");

  confirmationItems.innerHTML = "";
  let total = 0;

  Object.values(cart).forEach((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const itemEl = document.createElement("div");
    itemEl.classList.add("cart-item");
    itemEl.innerHTML = `
      <div class="item-info">
        <div class="item-title">${item.title}</div>
        <div class="item-meta">
          <span>${item.quantity}x</span>
          <span>@$${item.price.toFixed(2)}</span>
        </div>
      </div>
      <div class="item-subtotal">$${subtotal.toFixed(2)}</div>
    `;
    confirmationItems.appendChild(itemEl);
  });

  confirmationTotal.textContent = `$${total.toFixed(2)}`;
  modal.classList.remove("hidden");
}

// Start new order
function startNewOrder() {
  // Clear cart object
  for (const id in cart) {
    removeItem(id);
  }

  // Hide modal
  const modal = document.getElementById("confirmationModal");
  modal.classList.add("hidden");
}
