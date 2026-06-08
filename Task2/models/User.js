const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  bio: { type: String, default: '' },
  profilePic: { type: String, default: 'default.png' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

isSeeded: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);