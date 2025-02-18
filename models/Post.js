const mongoose = require("mongoose");

// Définition du schéma pour gérer les publications des utilisateurs
const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String },
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      author: String,
      content: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  image: { type: String, default: null }, // URL ou chemin de l'image
});

module.exports = mongoose.model("Post", PostSchema);
