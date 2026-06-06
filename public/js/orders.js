fetch('/api/orders')
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    let ordersList = document.getElementById('ordersList');

    if (!data.success) {
      ordersList.innerHTML = '<p>Please login to view orders!</p>';
      return;
    }

    if (data.orders.length === 0) {
      ordersList.innerHTML = '<p>No orders yet!</p>';
      return;
    }

    data.orders.forEach(function(order) {
      ordersList.innerHTML += `
        <div class="order-card">
          <h3>Order ID: ${order._id}</h3>
          <p>Total: &#8377;${order.totalPrice}</p>
          <p>Status: <span class="status">${order.status}</span></p>
          <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      `;
    });
  });