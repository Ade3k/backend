const mongoose = require("mongoose");

// Définition du schéma peour gérer les relations d'amitié entre utilisateurs
const FriendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "refused"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Friendship", FriendshipSchema);
