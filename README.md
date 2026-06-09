# CodeAlpha Internship Tasks

**Name:** Burigalla Geetha
**Student ID:** CA/DF1/110980
**Domain:** Full Stack Development
**Duration:** 1st June 2026 to 30th June 2026

---

## Task 1 - E-Commerce Store (ShopEasy) 🛒

A fully functional cricket equipment e-commerce website.

### Features
- User Registration & Login (bcrypt password hashing)
- Product listing by category (Jerseys, Bats, Balls, Gloves, Helmets)
- Search & filter products by category
- Add to Cart with quantity controls
- Place Orders & view Order History
- User Profile (account, address, language settings)
- Cricket-themed UI with logo

### Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Auth:** express-session, bcrypt

### Folder Structure
```
Task1/
├── models/          # Mongoose models (User, Product, Order)
├── public/          # Frontend (HTML, CSS, JS)
├── seedProducts.js  # Seed script for cricket products
├── server.js        # Express server & API routes
├── package.json
└── package-lock.json
```

---

## Task 2 - Social Media Platform (SocialApp) 📱

A feature-rich social media web application.

### Features
- User Registration & Login
- Create, Edit & Delete Posts (with image upload)
- Like & Comment on posts
- Follow / Unfollow users
- Notifications
- Search users
- Profile editing
- Dark Mode
- Share posts (clipboard)
- Seeded cricket player accounts for testing

### Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **File Uploads:** Multer

### Folder Structure
```
Task2/
├── models/          # Mongoose models (User, Post)
├── public/          # Frontend (HTML, CSS, JS)
├── seedUsers.js     # Seed script for cricket player accounts
├── server.js        # Express server & API routes
├── package.json
└── package-lock.json
```

---

## Task 3 - Project Management Tool 📋

A real-time project management application.

### Features
- User Registration & Login
- Create & manage Projects
- Add, update & delete Tasks within projects
- Real-time updates with Socket.io
- Assign tasks to team members
- Track task status (To Do / In Progress / Done)

### Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Real-time:** Socket.io

### Folder Structure
```
Task3/
├── models/          # Mongoose models (User, Project, Task)
├── public/          # Frontend (HTML, CSS, JS)
├── server.js        # Express server & Socket.io
├── package.json
└── package-lock.json
```

Built with ❤️ using Node.js, Express & MongoDB
