const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const User = require('./models/User');
const Post = require('./models/Post');

const app = express();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'socialmedia_secret',
  resave: false,
  saveUninitialized: false
}));

// Connect to MongoDB
mongoose.connect('mongodb://25wh5a0505_db_user:geetha27@ac-dwapf1c-shard-00-00.neyljct.mongodb.net:27017,ac-dwapf1c-shard-00-01.neyljct.mongodb.net:27017,ac-dwapf1c-shard-00-02.neyljct.mongodb.net:27017/?ssl=true&replicaSet=atlas-ynzcau-shard-0&authSource=admin&appName=Cluster0')
.then(() => console.log('MongoDB Connected!'))
.catch(err => console.log('Connection failed:', err));

// ========== PAGE ROUTES ==========
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));
app.get('/user', (req, res) => res.sendFile(path.join(__dirname, 'public', 'user.html')));

// ========== AUTH ROUTES ==========
app.post('/register', async (req, res) => {
  try {
    let email = req.body.email;
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.redirect('/register?error=Invalid email format!');
    }
    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user = new User({
      name: req.body.name,
      email: email,
      password: hashedPassword
    });
    await user.save();
    res.redirect('/login?success=Account created! Please login.');
  } catch (err) {
    res.redirect('/register?error=Email already exists!');
  }
});

app.post('/login', async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.redirect('/login?error=Email not found!');
    let isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.redirect('/login?error=Wrong password!');
    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    res.redirect('/login?error=Something went wrong!');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// ========== API - SESSION USER ==========
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.json({ success: false });
  res.json({ success: true, user: req.session.user });
});

// ========== API - POSTS ==========

// Create post
app.post('/api/posts', upload.single('image'), async (req, res) => {
  if (!req.session.user) return res.json({ success: false, message: 'Please login!' });
  try {
    let post = new Post({
      user: req.session.user._id,
      text: req.body.text,
      image: req.file ? req.file.filename : ''
    });
    await post.save();
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: 'Something went wrong!' });
  }
});

// Get all posts (feed)
app.get('/api/posts', async (req, res) => {
  try {
    let posts = await Post.find()
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    res.json({ success: false });
  }
});

// Like / Unlike post
app.post('/api/posts/:id/like', async (req, res) => {
  if (!req.session.user) return res.json({ success: false, message: 'Please login!' });
  try {
    let post = await Post.findById(req.params.id);
    let userId = req.session.user._id;
    let alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.json({ success: false });
  }
});

// Add comment
app.post('/api/posts/:id/comment', async (req, res) => {
  if (!req.session.user) return res.json({ success: false, message: 'Please login!' });
  try {
    let post = await Post.findById(req.params.id);
    post.comments.push({
      user: req.session.user._id,
      name: req.session.user.name,
      text: req.body.text
    });
    await post.save();
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

// Edit post
app.post('/api/posts/:id/edit', async (req, res) => {
  if (!req.session.user) return res.json({ success: false, message: 'Please login!' });
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.json({ success: false, message: 'Post not found' });
    if (post.user.toString() !== req.session.user._id.toString())
      return res.json({ success: false, message: 'Unauthorized' });
    post.text = req.body.text;
    await post.save();
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  if (!req.session.user) return res.json({ success: false });
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

// ========== API - USERS ==========

// Get user profile
app.get('/api/users/:id', async (req, res) => {
  try {
    let user = await User.findById(req.params.id).select('-password');
    let posts = await Post.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, user, posts });
  } catch (err) {
    res.json({ success: false });
  }
});

// Follow / Unfollow
app.post('/api/users/:id/follow', async (req, res) => {
  if (!req.session.user) return res.json({ success: false, message: 'Please login!' });
  try {
    let targetUser = await User.findById(req.params.id);
    let currentUser = await User.findById(req.session.user._id);
    let isFollowing = currentUser.following.includes(req.params.id);
    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.session.user._id.toString());
    } else {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.session.user._id);
    }
    await currentUser.save();
    await targetUser.save();
    res.json({ success: true, following: !isFollowing });
  } catch (err) {
    res.json({ success: false });
  }
});

// Search users
app.get('/api/users/search/:query', async (req, res) => {
  try {
    let users = await User.find({
      name: { $regex: req.params.query, $options: 'i' }
    }).select('-password');
    res.json({ success: true, users });
  } catch (err) {
    res.json({ success: false });
  }
});

// ========== API - NOTIFICATIONS ==========
app.get('/api/notifications', async (req, res) => {
  if (!req.session.user) return res.json({ success: false });
  try {
    let posts = await Post.find({ user: req.session.user._id })
      .populate('likes', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });

    let notifications = [];
    posts.forEach(post => {
      post.likes.forEach(liker => {
        if (liker._id.toString() !== req.session.user._id.toString()) {
          notifications.push({
            type: 'like',
            message: `${liker.name} liked your post`,
            postId: post._id,
            postText: post.text.substring(0, 30)
          });
        }
      });
      post.comments.forEach(comment => {
        if (comment.user._id.toString() !== req.session.user._id.toString()) {
          notifications.push({
            type: 'comment',
            message: `${comment.name} commented on your post`,
            postId: post._id,
            postText: post.text.substring(0, 30)
          });
        }
      });
    });
    res.json({ success: true, notifications });
  } catch (err) {
    res.json({ success: false });
  }
});

// ========== PAGE ROUTES (EXTRA) ==========
app.get('/notifications', (req, res) => res.sendFile(path.join(__dirname, 'public', 'notifications.html')));

// ========== API - PROFILE ==========
app.post('/api/profile/edit', async (req, res) => {
  if (!req.session.user) return res.json({ success: false });
  try {
    let updated = await User.findByIdAndUpdate(
      req.session.user._id,
      { name: req.body.name, bio: req.body.bio },
      { new: true }
    );
    req.session.user = updated;
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

// ========== START SERVER ==========
app.listen(3000, () => console.log('Server started on port 3000!'));