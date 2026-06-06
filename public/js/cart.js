// Load cart items
async function loadCart() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    document.getElementById('cartItems').innerHTML = '<p>Your cart is empty!</p>';
    document.getElementById('cartTotal').innerHTML = ''; // ✅ clear total
    document.getElementById('checkoutBtn').style.display = 'none';
    return;
  }

  let cartItemsDiv = document.getElementById('cartItems');
  cartItemsDiv.innerHTML = '';
  let total = 0;

  for (let item of cart) {
    const itemId = item.id || item._id;

    try {
      let response = await fetch(`/api/products/${itemId}`);
      let product = await response.json();

      total += product.price * item.quantity;

      cartItemsDiv.innerHTML += `
        <div class="cart-item">
          <img src="${product.image}" width="80" alt="${product.name}">
          <div class="cart-item-details">
            <h3>${product.name}</h3>
            <p>Price: ₹${product.price}</p>
            <div class="quantity-controls">
              <button class="qty-btn" onclick="changeQuantity('${itemId}', -1)">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" onclick="changeQuantity('${itemId}', 1)">+</button>
            </div>
            <p>Subtotal: ₹${product.price * item.quantity}</p>
          </div>
          <button class="btn-danger" onclick="removeFromCart('${itemId}')">Remove</button>
        </div>
      `;
    } catch (err) {
      console.error('Failed to load product:', itemId, err);
    }
  }

  document.getElementById('cartTotal').innerHTML = `<h3>Total: ₹${total}</h3>`;
  updateCartCount();
}

// Change quantity +/-
function changeQuantity(productId, change) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let item = cart.find(i => (i.id || i._id) === productId);

  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(i => (i.id || i._id) !== productId);
    }
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart(); // reload to reflect changes
}

// Remove from cart
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => (item.id || item._id) !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

// Update cart count in navbar
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let count = cart.reduce((total, item) => total + item.quantity, 0);
  let cartLink = document.querySelector('.nav-links a[href="/cart"]');
  if (cartLink) cartLink.innerText = `Cart (${count}) 🛒`;
}

// Checkout
function checkout() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart: cart })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.removeItem('cart');
      alert('Order placed successfully!');
      window.location.href = '/orders';
    } else if (data.message === 'Please login first!') {
      alert('Please login first!');
      window.location.href = '/login';
    } else {
      alert(data.message);
    }
  });
}

loadCart();