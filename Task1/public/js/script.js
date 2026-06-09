// Search functionality
function searchProducts() {
  let query = document.getElementById('searchInput').value.toLowerCase();
  let cards = document.querySelectorAll('.card');
  let categorySections = document.querySelectorAll('.category-section');

  cards.forEach(card => {
    let name = card.querySelector('h3').textContent.toLowerCase();
    let desc = card.querySelector('p').textContent.toLowerCase();
    card.style.display = (name.includes(query) || desc.includes(query)) ? 'block' : 'none';
  });

  // Hide category title if all products in it are hidden
  categorySections.forEach(section => {
    let visibleCards = section.querySelectorAll('.card:not([style*="display: none"])');
    section.style.display = visibleCards.length === 0 ? 'none' : 'block';
  });
}

fetch('/api/products')
  .then(response => response.json())
  .then(products => {
    const productList = document.getElementById('productList');
    if (!productList) return;

    // Add search bar at top
    let searchHTML = `
      <div class="search-container">
        <input 
          type="text" 
          id="searchInput" 
          placeholder="🔍 Search products..." 
          onkeyup="searchProducts()"
          class="search-input"
        >
      </div>
    `;

    // Group products by category
    const categories = {};
    products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      categories[product.category].push(product);
    });

    let html = searchHTML;

    Object.keys(categories).forEach(category => {
      html += `
        <div class="category-section">
          <h2 class="category-title">${category}</h2>
          <div class="card-container">
      `;

      categories[category].forEach(product => {
  let outOfStock = product.stock === 0;
  let disabledAttr = outOfStock ? 'disabled' : '';
  let disabledStyle = outOfStock ? 'opacity:0.5;cursor:not-allowed;' : '';
  let btnText = outOfStock ? 'Out of Stock' : 'Add to Cart';
  let badge = outOfStock ? '<div class="out-of-stock-badge">Out of Stock</div>' : '';

  html += `
    <div class="card">
      ${badge}
      <img
        src="${product.image}"
        alt="${product.name}"
        onclick="window.location.href='/product.html?id=${product._id}'"
        style="cursor:pointer"
      >
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p class="price">&#8377;${product.price}</p>
      <button class="btn" onclick="addToCart('${product._id}')" ${disabledAttr} style="${disabledStyle}">
        ${btnText}
      </button>
      <a href="/product.html?id=${product._id}" class="btn" style="display:block;margin-top:8px;">
        View Details
      </a>
    </div>
  `;
});
      html += `</div></div>`;
    });

    productList.innerHTML = html;
  })
  .catch(err => console.error(err));

function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  showToast('Product added to cart! 🛒');
  updateCartCount();
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let count = cart.reduce((total, item) => total + item.quantity, 0);
  let cartLink = document.querySelector('.nav-links a[href="/cart"]');
  if (cartLink) cartLink.innerText = `Cart (${count}) 🛒`;
}

// Toast notification instead of alert
function showToast(message) {
  let toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

updateCartCount();