const express = require("express");
const Message = require("../models/Message"); // Import du modèle Message
const Room = require("../models/Room"); // Import du modèle Room
const { v4: uuidv4 } = require("uuid"); // Utilitaire pour générer des identifiants uniques
const cookieParser = require("cookie-parser");
const router = express.Router();
router.use(cookieParser());
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const nodemailer = require("nodemailer");

// Objet créé pour permettre d'envoyer des emails via gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "facebikepro@gmail.com",
    pass: "sqip qasz qlvk eava",
  },
});

// Route pour récupérer les messages d'une salle
router.get("/:room", async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .populate("user", "name")
      .populate("room", "name createdAt")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

// Route pour ajouter un message
router.post("/", async (req, res) => {
  const { user, message, room } = req.body; // Les données envoyées

  // Vérification que les champs nécessaires sont présents
  if (!message || !room) {
    return res.status(400).json({ message: "Message and room are required" });
  }

  try {
    const newMessage = new Message({
      user,
      message,
      room,
    });

    await newMessage.save();

    const roomData = await Room.findById(room);
    const participantIds = roomData.participants;
    const participants = await User.find({ _id: { $in: participantIds } }); //
    console.log(participants);

    participants.forEach((participant) => {
      let subject = "";
      let text = "";
      let html = "";
      if (String(participant.firstName) === String(user)) {
        subject = "Vous avez envoyé un message";
        text = `Bonjour ${participant.pseudonym}, vous avez envoyé le message suivant : "${message}"`;
        html = `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: left;">
                        Bonjour <strong>${participant.pseudonym}</strong>,
                    </h2>
                    <p style="font-size: 16px; line-height: 1.6;">
                        Vous avez envoyé un <strong>nouveau message</strong> :
                    </p>
                    <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                        "${message}"
                    </blockquote>
                    <p style="font-size: 14px; color: #555;">
                        <strong>Cordialement,</strong><br>
                        L'équipe FaceBike
                    </p>
                    <footer style="margin-top: 20px; font-size: 12px; color: #888;">
                        Merci pour votre engagement auprès de la communauté FaceBike !<i class="bi bi-bicycle"></i>
                    </footer>
                </body>
            </html>
        `;
      } else {
        subject = "Vous avez reçu un message";
        text = `Bonjour ${participant.pseudonym}, vous avez reçu un nouveau message : "${message}"`;
        html = `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: left;">
                        Bonjour <strong>${participant.pseudonym}</strong>,
                    </h2>
                    <p style="font-size: 16px; line-height: 1.6;">
                        Vous avez reçu un <strong>nouveau message</strong> :
                    </p>
                    <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                        "${message}"
                    </blockquote>
                    <p style="font-size: 14px; color: #555;">
                        <strong>Cordialement,</strong><br>
                        L'équipe FaceBike
                    </p>
                    <footer style="margin-top: 20px; font-size: 12px; color: #888;">
                        Merci pour votre engagement auprès de la communauté FaceBike !
                    </footer>
                </body>
            </html>
        `;
      }
      const mail = {
        from: "facebikepro@gmail.com",
        to: participant.email,
        subject: subject,
        text: text,
        html: html,
      };

      transporter.sendMail(mail, (e, s) => {
        if (e) {
          console.log(e);
        } else {
          console.log(s.response);
        }
      });
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du message:", error);
    res.status(500).json({ message: "Error saving message", error });
  }
});

// Route pour créer un nouveau salon
router.post("/rooms", async (req, res) => {
  const { user1Id, user2Id } = req.body;

  if (!user1Id || !user2Id) {
    return res
      .status(400)
      .json({ message: "Both user1Id and user2Id are required" });
  }

  try {
    const existingRoom = await Room.findOne({
      participants: { $all: [user1Id, user2Id] },
    });

    if (existingRoom) {
      return res.status(200).json({ roomId: existingRoom._id });
    }

    const roomId = uuidv4();

    const newRoom = new Room({
      name: `${roomId}`,
      participants: [user1Id, user2Id],
      createdAt: new Date(),
    });

    await newRoom.save();

    res.status(201).json({ roomId: newRoom._id });
  } catch (error) {
    res.status(500).json({ message: "Error creating room", error });
  }
});

// Route pour renvoyer toutes les salles où un utilisateur est inscrit
router.get("/users/:userId/rooms", async (req, res) => {
  const { userId } = req.params;

  try {
    const rooms = await Room.find({ participants: userId });

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user rooms", error });
  }
});

module.exports = router;
