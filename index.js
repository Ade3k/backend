require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const nodemailer = require("nodemailer");

// Configuration du middleware CORS pour gérer les requêtes cross-origin
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Connection à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Middleware pour parser (analyser) les requêtes au format JSON
app.use(express.json());

// Pour tester le serveur
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// Importation des différents fichiers de routes
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const friendshipRoutes = require("./routes/friendshipRoutes");
const messageRoutes = require("./routes/messageRoutes"); // Importer les routes de message

// Définition des chemins pour chaque groupe de routes
app.use("/api/users", userRoutes); // Les routes utilisateurs sont maintenant accessibles sous "/api/users"
app.use("/api/posts", postRoutes);
app.use("/api/friendship", friendshipRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/messages", messageRoutes); // Ajouter la route pour les messages

// Pour gérer les interactions entre plusieurs utilisateurs (permettre des messages en temps réel et de gérer des salons)
io.on("connection", (socket) => {
  socket.on("join", (data) => {
    socket.join(data.room);
    socket.broadcast.to(data.room).emit("user joined");
  });

  socket.on("message", (data) => {
    io.in(data.room).emit("new message", {
      user: data.user,
      message: data.message,
    });
  });
});

// Pour démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
