const mongoose = require("mongoose");

// Définition du schéma pour un salon
const roomSchema = new mongoose.Schema({
  name: { type: String, default: "Room" },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ], // Liste des IDs des utilisateurs participants
  createdAt: { type: Date, default: Date.now },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
