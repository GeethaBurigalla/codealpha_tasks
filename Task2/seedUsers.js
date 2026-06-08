const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Post = require('./models/Post');

mongoose.connect('mongodb://25wh5a0505_db_user:geetha27@ac-dwapf1c-shard-00-00.neyljct.mongodb.net:27017,ac-dwapf1c-shard-00-01.neyljct.mongodb.net:27017,ac-dwapf1c-shard-00-02.neyljct.mongodb.net:27017/?ssl=true&replicaSet=atlas-ynzcau-shard-0&authSource=admin&appName=Cluster0')
.then(() => console.log('MongoDB Connected!'))
.catch(err => console.log('Connection failed:', err));

async function seedData() {
  try {
   await User.deleteMany({ email: { $in: ['virat@cricket.com', 'rohit@cricket.com', 'dhoni@cricket.com', 'bumrah@cricket.com', 'hardik@cricket.com'] } });
await Post.deleteMany({ isSeeded: true });
    let password = await bcrypt.hash('password123', 10);

    let users = await User.insertMany([
      { name: 'Virat Kohli', email: 'virat@cricket.com', password: password, bio: 'Professional Cricketer 🏏 | RCB Captain', isSeeded: true },
      { name: 'Rohit Sharma', email: 'rohit@cricket.com', password: password, bio: 'Indian Cricket Captain 🏏 | Mumbai Indians', isSeeded: true },
      { name: 'MS Dhoni', email: 'dhoni@cricket.com', password: password, bio: 'Former Indian Captain 🏏 | CSK', isSeeded: true },
      { name: 'Jasprit Bumrah', email: 'bumrah@cricket.com', password: password, bio: 'Fast Bowler 🏏 | India', isSeeded: true },
      { name: 'Hardik Pandya', email: 'hardik@cricket.com', password: password, bio: 'All-rounder 🏏 | India', isSeeded: true }
    ]);

    await Post.insertMany([
      { user: users[0]._id, text: '🏏 Another day, another net session! Hard work is the only shortcut to success. Keep grinding! 💪 #Cricket #RCB', isSeeded: true },
      { user: users[0]._id, text: 'Proud to represent my country every single time I step on the field. 🇮🇳❤️ #TeamIndia', isSeeded: true },
      { user: users[1]._id, text: '🎯 Century number 32 in ODIs! Thank you for all your love and support! 🙏 #Rohit #Cricket', isSeeded: true },
      { user: users[1]._id, text: 'Mumbai Indians forever in my heart ❤️ What a journey! 🏆 #MI #IPL', isSeeded: true },
      { user: users[2]._id, text: 'Stay calm, trust the process. 🏏💛 #Dhoni #CSK #WhistlePodu', isSeeded: true },
      { user: users[2]._id, text: 'Champions never quit. CSK is not just a team, it is an emotion! 💛🏆 #CSK', isSeeded: true },
      { user: users[3]._id, text: 'Wickets in the powerplay feel amazing! 🎳 Working hard every day! #Bumrah', isSeeded: true },
      { user: users[4]._id, text: 'All-rounder life 🏏💪 Batting, bowling, fielding — 100% in everything! #Hardik', isSeeded: true }
    ]);

    console.log('✅ Seed data added successfully!');
    console.log('Login with password: password123');
    process.exit();
  } catch (err) {
    console.log('Error:', err);
    process.exit();
  }
}

seedData();