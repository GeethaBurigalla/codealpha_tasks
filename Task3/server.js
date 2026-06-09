const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'projectmanager_secret',
    resave: false,
    saveUninitialized: false
}));

// MongoDB Connection
mongoose.connect('mongodb://25wh5a0505_db_user:geetha27@ac-dwapf1c-shard-00-00.neyljct.mongodb.net:27017,ac-dwapf1c-shard-00-01.neyljct.mongodb.net:27017,ac-dwapf1c-shard-00-02.neyljct.mongodb.net:27017/projectmanager?ssl=true&replicaSet=atlas-ynzcau-shard-0&authSource=admin&appName=Cluster0')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Auth Middleware
function isLoggedIn(req, res, next) {
    if (req.session.userId) return next();
    res.status(401).json({ success: false, message: 'Not logged in' });
}

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existing = await User.findOne({ username });
        if (existing) return res.json({ success: false, message: 'Username already taken' });
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashed });
        await user.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.json({ success: false, message: 'User not found' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.json({ success: false, message: 'Wrong password' });
        req.session.userId = user._id;
        req.session.username = user.username;
        res.json({ success: true, username: user.username });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/me', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// ─── PROJECT ROUTES ───────────────────────────────────────────────────────────

app.get('/api/projects', isLoggedIn, async (req, res) => {
    const projects = await Project.find({ createdBy: req.session.userId }).sort({ createdAt: -1 });
    res.json(projects);
});

app.post('/api/projects', isLoggedIn, async (req, res) => {
    try {
        const { name, description } = req.body;
        const project = new Project({ name, description, createdBy: req.session.userId });
        await project.save();
        res.json({ success: true, project });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.delete('/api/projects/:id', isLoggedIn, async (req, res) => {
    await Project.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ project: req.params.id });
    res.json({ success: true });
});

// ─── TASK ROUTES ─────────────────────────────────────────────────────────────

app.get('/api/projects/:id/tasks', isLoggedIn, async (req, res) => {
    const tasks = await Task.find({ project: req.params.id }).sort({ createdAt: -1 });
    res.json(tasks);
});

app.post('/api/projects/:id/tasks', isLoggedIn, async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const task = new Task({
            title,
            description,
            priority,
            dueDate: dueDate || null,
            project: req.params.id,
            createdBy: req.session.userId
        });
        await task.save();
        io.emit('taskCreated', { projectId: req.params.id, task });
        res.json({ success: true, task });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});
app.put('/api/tasks/:id/status', isLoggedIn, async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
        io.emit('taskUpdated', task);
        res.json({ success: true, task });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});
app.put('/api/tasks/:id', isLoggedIn, async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, priority, dueDate: dueDate || null },
            { new: true }
        );
        io.emit('taskUpdated', task);
        res.json({ success: true, task });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.delete('/api/tasks/:id', isLoggedIn, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        io.emit('taskDeleted', { taskId: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});