// Load profile data
fetch('/api/profile')
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (!data.success) {
      window.location.href = '/login';
      return;
    }
    let user = data.user;
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('street').value = user.address ? user.address.street : '';
    document.getElementById('city').value = user.address ? user.address.city : '';
    document.getElementById('state').value = user.address ? user.address.state : '';
    document.getElementById('pincode').value = user.address ? user.address.pincode : '';
    document.getElementById('language').value = user.language || 'English';
  });

function saveAccount() {
  let name = document.getElementById('name').value;
  fetch('/api/profile/account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    let msg = document.getElementById('profileMessage');
    msg.innerText = data.success ? 'Account saved!' : 'Error saving!';
    msg.style.color = data.success ? 'green' : 'red';
  });
}

function saveAddress() {
  let address = {
    street: document.getElementById('street').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    pincode: document.getElementById('pincode').value
  };
  fetch('/api/profile/address', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: address })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    let msg = document.getElementById('profileMessage');
    msg.innerText = data.success ? 'Address saved!' : 'Error saving!';
    msg.style.color = data.success ? 'green' : 'red';
  });
}

function saveLanguage() {
  let language = document.getElementById('language').value;
  fetch('/api/profile/language', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: language })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    let msg = document.getElementById('profileMessage');
    msg.innerText = data.success ? 'Language saved!' : 'Error saving!';
    msg.style.color = data.success ? 'green' : 'red';
  });
}