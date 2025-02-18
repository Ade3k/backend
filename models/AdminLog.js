const mongoose = require("mongoose");

// Définition du schéma pour enregistrer les actions réalisées par les administrateurs
const AdminLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  details: String,
  createdAt: { type: Date, default: Date.now },
});

// Exportation du modèle pour l'utiliser dans d'autres parties de l'application
module.exports = mongoose.model("AdminLog", AdminLogSchema); 
