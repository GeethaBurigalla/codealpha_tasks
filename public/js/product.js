// Get product id from URL
let productId = window.location.search.split('=')[1];

// Load product details
fetch(`/api/products/${productId}`)
  .then(function(res) {
    return res.json();
  })
  .then(function(product) {
    console.log('Product data:', product); // DEBUG
    document.getElementById('productDetails').innerHTML = `
      <div class="product-detail-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-detail-info">
          <h1>${product.name}</h1>
          <p>${product.description}</p>
          <p class="price">₹${product.price}</p>
          <p>Category: ${product.category}</p>
          <p>Stock: ${product.stock} items left</p>
          <button class="btn" onclick="addToCart('${product._id}')">Add to Cart</button>
          <a href="/" class="btn" style="display:inline-block; margin-top:10px;">Back to Home</a>
        </div>
      </div>
    `;
  });

// Add to cart function
function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let existingItem = cart.find(function(item) { return item.id === productId; });

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 }); // ✅ saves as "id"
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  console.log('Cart after add:', JSON.parse(localStorage.getItem('cart'))); // DEBUG
  alert('Product added to cart!');
}