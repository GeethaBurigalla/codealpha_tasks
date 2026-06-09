const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'ecommerce_secret',
  resave: false,
  saveUninitialized: false
}));

// Connect to MongoDB
mongoose.connect('mongodb://25wh5a0505_db_user:geetha27@ac-dwapf1c-shard-00-00.neyljct.mongodb.net:27017,ac-dwapf1c-shard-00-01.neyljct.mongodb.net:27017,ac-dwapf1c-shard-00-02.neyljct.mongodb.net:27017/?ssl=true&replicaSet=atlas-ynzcau-shard-0&authSource=admin&appName=Cluster0')
.then(() => {
  console.log('MongoDB Connected!');
})
.catch((err) => {
  console.log('Connection failed:', err);
});

// Routes
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/cart', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.post('/register', async function(req, res) {
  try {
    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.send('Email already exists!');
  }
});

app.post('/login', async function(req, res) {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.send('Email not found!');

    let isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.send('Wrong password!');

    req.session.user = user;
    res.redirect('/');
  } catch (error) {
    res.send('Something went wrong!');
  }
});

// Get all products
app.get('/api/products', async function(req, res) {
  let products = await Product.find();
  res.json(products);
});

// Get single product
app.get('/api/products/:id', async function(req, res) {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.log('Product fetch error:', error);
    res.status(500).json({ error: 'Invalid product ID' });
  }
});

// ✅ FIXED Order route with full debug logging
app.post('/api/order', async function(req, res) {
  try {
    // Check login
    if (!req.session.user) {
      return res.json({ success: false, message: 'Please login first!' });
    }

    let cart = req.body.cart;
    console.log('Cart received:', cart); // DEBUG

    if (!cart || cart.length === 0) {
      return res.json({ success: false, message: 'Cart is empty!' });
    }

    let total = 0;

    for (let item of cart) {
      let itemId = item.id || item._id; // ✅ handle both keys
      console.log('Looking up product id:', itemId); // DEBUG

      let product = await Product.findById(itemId);
      console.log('Found product:', product); // DEBUG

      if (!product) {
        return res.json({ success: false, message: `Product not found: ${itemId}` });
      }

      total += product.price * item.quantity;
    }

    let order = new Order({
      user: req.session.user._id,
      products: cart.map(function(item) {
        return {
          product: item.id || item._id, // ✅ handle both keys
          quantity: item.quantity
        };
      }),
      totalPrice: total,
      status: 'Pending'
    });

    await order.save();
    console.log('Order saved successfully!'); // DEBUG
    res.json({ success: true });

  } catch (error) {
    console.log('Order error:', error); // DEBUG - check terminal for this!
    res.json({ success: false, message: 'Something went wrong!' });
  }
});

app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/product.html', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

app.get('/orders', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'orders.html'));
});

app.get('/api/orders', async function(req, res) {
  if (!req.session.user) {
    return res.json({ success: false });
  }
  let orders = await Order.find({ user: req.session.user._id });
  res.json({ success: true, orders: orders });
});

app.get('/profile', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/api/profile', async function(req, res) {
  if (!req.session.user) return res.json({ success: false });
  let user = await User.findById(req.session.user._id);
  res.json({ success: true, user: user });
});

app.post('/api/profile/account', async function(req, res) {
  if (!req.session.user) return res.json({ success: false });
  await User.findByIdAndUpdate(req.session.user._id, { name: req.body.name });
  res.json({ success: true });
});

app.post('/api/profile/address', async function(req, res) {
  if (!req.session.user) return res.json({ success: false });
  await User.findByIdAndUpdate(req.session.user._id, { address: req.body.address });
  res.json({ success: true });
});

app.post('/api/profile/language', async function(req, res) {
  if (!req.session.user) return res.json({ success: false });
  await User.findByIdAndUpdate(req.session.user._id, { language: req.body.language });
  res.json({ success: true });
});

app.listen(3000, function() {
  console.log('Server started on port 3000');
});