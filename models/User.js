const mongoose = require("mongoose");

// Définition du schéma pour gérer la création d'un utilisateur
const UserSchema = new mongoose.Schema({
  pseudonym: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  photo: { type: String },
  bio: { type: String },
  preferences: { type: [String], default: [] },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  recommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
