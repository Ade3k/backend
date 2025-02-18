const Friendship = require("../models/Friendship"); // Modèle 'Friendship' pour gérer les amitiés
const User = require("../models/User"); // Modèle 'User' accéder aux informations des utilisateurs
const nodemailer = require("nodemailer"); // Bibliothèque pour Node.js qui permet d'envoyer des emails
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  // Configuration du transporteur pour envoyer des emails par gmail
  service: "gmail",
  auth: {
    // Objet contenant les informations d'authentification nécessaires pour envoyer des emails
    user: "facebikepro@gmail.com",
    pass: "sqip qasz qlvk eava", // Clé d'application (Mot de passe)
  },
});

exports.sendRecommandation = async (req, res) => {

  try {
    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "adams");

    if (!claims) {
      res.status(401).send({
        message: "Vous n'êtes pas identifié",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const { friendId, recommendedFriendId } = req.body;
    // Pour récupérer les utilisateurs concernés
    const friendToRecommand = await User.findById(friendId);
    const friendRecommanded = await User.findById(recommendedFriendId);

    // Objet 'mail' pour envoyer un email informant un utilisateur qu'il a reçu une demande d'ami
    const mail = {
      from: "facebikepro@gmail.com",
      to: friendToRecommand.email,
      subject: "Recommandation d'amitié",
      text: `Bonjour ${friendToRecommand.pseudonym}, vous avez reçu une recommandation de la part de : "${user.firstName} ${user.lastName}"`,
      html: `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: left;">
                        Bonjour <strong>${friendToRecommand.pseudonym}</strong>,
                    </h2>
                    <p style="font-size: 16px; line-height: 1.6;">
                        Vous avez reçu une recommandation<strong> d'amitié de</strong> :
                    </p>
                    <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                        "${user.firstName} ${user.lastName}" vous recommande "${friendRecommanded.firstName} ${friendRecommanded.lastName}" 
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
        `,
    };

    transporter.sendMail(mail, (e, s) => {
      if (e) {
        console.log(e); // Affiche error dans la console pour le debug
      } else {
        console.log(s.response); // Affiche success dans la console pour le debug
      }
    });

    res.status(201).json({
      message: "Recommandation envoyée.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'envoi de la recommandation.", error }); // Pour renvoyer un message d'erreur pour le debug
  }
};


// Fonction pour envoyer une demande d'ami
exports.sendFriendRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;

    // Requête MongoDB pour vérifier l'existence d'une demande d'ami
    const existingRequest = await Friendship.findOne({
      requester: requesterId,
      recipient: recipientId,
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Demande déjà envoyée ou en attente." }); // Retourne le status de demande sous forme de JSON pour le debug
    }



    // Pour récupérer les utilisateurs concernés
    const envoyeur = await User.findById(requesterId);
    const receveur = await User.findById(recipientId);
    console.log(envoyeur); // Affiche l'envoyeur dans la console pour le debug
    console.log(receveur); // Affiche le receveur dans la console pour le debug

    // Objet 'mail' pour envoyer un email informant un utilisateur qu'il a reçu une demande d'ami
    const mail = {
      from: "facebikepro@gmail.com",
      to: receveur.email,
      subject: "Demande d'amitié reçu",
      text: `Bonjour ${receveur.pseudonym}, vous avez reçu la demande de : "${envoyeur.pseudonym}"`,
      html: `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: left;">
                        Bonjour <strong>${receveur.pseudonym}</strong>,
                    </h2>
                    <p style="font-size: 16px; line-height: 1.6;">
                        Vous avez reçu une <strong>demande d'amitié de</strong> :
                    </p>
                    <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                        "${envoyeur.pseudonym}"
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
        `,
    };

    // Objet 'mail' pour envoyer un email informant un autre utilisateur que sa demande a été envoyée
    const mail2 = {
      from: "facebikepro@gmail.com",
      to: envoyeur.email,
      subject: "Demande d'amitié envoyée",
      text: `Bonjour ${envoyeur.pseudonym}, votre demande a été envoyée à : "${receveur.pseudonym}"`,
      html: `
          <html>
              <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                  <h2 style="color: #4CAF50; text-align: left;">
                      Bonjour <strong>${envoyeur.pseudonym}</strong>,
                  </h2>
                  <p style="font-size: 16px; line-height: 1.6;">
                      Votre <strong>demande d'amitié</strong> a été envoyée à :
                  </p>
                  <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                      "${receveur.pseudonym}"
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
      `,
    };

    // Méthode 'sendMail' de 'nodemailer' pour envoyer un email et afficher les erreurs ou succès
    transporter.sendMail(mail, (e, s) => {
      if (e) {
        console.log(e); // Affiche error dans la console pour le debug
      } else {
        console.log(s.response); // Affiche success dans la console pour le debug
      }
    });

    transporter.sendMail(mail2, (e, s) => {
      if (e) {
        console.log(e);
      } else {
        console.log(s.response);
      }
    });




    // Instance pour créer une nouvelle demande d'ami
    const newFriendRequest = new Friendship({
      requester: requesterId,
      recipient: recipientId,
    });

    const savedRequest = await newFriendRequest.save();
    res.status(201).json({
      message: "Demande d'amitié envoyée.",
      friendRequest: savedRequest,
    }); // Retourne le status de demande sous forme de JSON pour le debug
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'envoi de la demande.", error }); // Pour renvoyer un message d'erreur pour le debug
  }
};

// Fonction pour accepter une demande d'ami
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;

    const friendship = await Friendship.findById(friendshipId);

    if (!friendship) {
      return res.status(404).json({ message: "Demande d'amitié introuvable." }); // Retourne le status de demande sous forme de JSON pour le debug
    }

    // Pour récupérer les utilisateurs concernés
    const envoyeurId = friendship.requester;
    const receveurId = friendship.recipient;
    const envoyeur = await User.findById(envoyeurId);
    const receveur = await User.findById(receveurId);
    console.log(envoyeur); // Affiche l'envoyeur dans la console pour le debug
    console.log(receveur); // Affiche le receveur dans la console pour le debug

    // Objet 'mail' pour envoyer un email informant un utilisateur qu'il a accepté une demande d'ami
    const mail = {
      from: "facebikepro@gmail.com",
      to: receveur.email,
      subject: "Demande d'amitié reçu acceptée",
      text: `Bonjour ${receveur.pseudonym}, vous avez accepté la demande de : "${envoyeur.pseudonym}"`,
      html: `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: left;">
                        Bonjour <strong>${receveur.pseudonym}</strong>,
                    </h2>
                    <p style="font-size: 16px; line-height: 1.6;">
                        Vous avez accepté une <strong>demande d'amitié de</strong> :
                    </p>
                    <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                        "${envoyeur.pseudonym}"
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
        `,
    };

    // Objet 'mail' pour envoyer un email informant un autre utilisateur que sa demande a été acceptée
    const mail2 = {
      from: "facebikepro@gmail.com",
      to: envoyeur.email,
      subject: "Demande d'amitié envoyée acceptée",
      text: `Bonjour ${envoyeur.pseudonym}, votre demande a été accepté par : "${receveur.pseudonym}"`,
      html: `
          <html>
              <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                  <h2 style="color: #4CAF50; text-align: left;">
                      Bonjour <strong>${envoyeur.pseudonym}</strong>,
                  </h2>
                  <p style="font-size: 16px; line-height: 1.6;">
                      Votre <strong>demande d'amitié</strong> a été acceptée par :
                  </p>
                  <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                      "${receveur.pseudonym}"
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
      `,
    };

    // Méthode 'sendMail' de 'nodemailer' pour envoyer un email et afficher les erreurs ou succès
    transporter.sendMail(mail, (e, s) => {
      if (e) {
        console.log(e); // Affiche error dans la console pour le debug
      } else {
        console.log(s.response); // Affiche success dans la console pour le debug
      }
    });

    transporter.sendMail(mail2, (e, s) => {
      if (e) {
        console.log(e);
      } else {
        console.log(s.response);
      }
    });

    // Pour mettre à jour le statut de la relation
    friendship.status = "confirmed";
    await friendship.save();

    // Pour récupérer et renvoyer une demande d'ami mise à jour après acceptation
    const updatedFriendship = await Friendship.findById(friendshipId)
      .populate("requester", "firstName lastName _id")
      .populate("recipient", "firstName lastName _id");

    res.status(200).json({
      // Retourne le status d'amitié sous forme de JSON pour le debug
      message: "Demande d'amitié acceptée.",
      friendship: updatedFriendship,
    });
  } catch (error) {
    console.error("Erreur lors de l'acceptation de la demande :", error); // Pour renvoyer un message d'erreur pour le debug
    res
      .status(500)
      .json({ message: "Erreur lors de l'acceptation de la demande.", error }); // Pour renvoyer un message d'erreur pour le debug
  }
};

// Fonction pour refuser une demande d'ami
exports.declineFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({ message: "Demande d'amitié introuvable." }); // Retourne le status d'amitié sous forme de JSON pour le debug
    }

    // Pour récupérer les utilisateurs concernés
    const envoyeurId = friendship.requester;
    const receveurId = friendship.recipient;
    const envoyeur = await User.findById(envoyeurId);
    const receveur = await User.findById(receveurId);

    // Objet 'mail' pour envoyer un email informant un utilisateur qu'il a refusé une demande d'ami
    const mail = {
      from: "facebikepro@gmail.com",
      to: receveur.email,
      subject: "Demande d'amitié reçu refusée",
      text: `Bonjour ${receveur.pseudonym}, vous avez refusé la demande de : "${envoyeur.pseudonym}"`,
      html: `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: left;">
                        Bonjour <strong>${receveur.pseudonym}</strong>,
                    </h2>
                    <p style="font-size: 16px; line-height: 1.6;">
                        Vous avez refusé une <strong>demande d'amitié de</strong> :
                    </p>
                    <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                        "${envoyeur.pseudonym}"
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
        `,
    };

    // Objet 'mail' pour envoyer un email informant un aurtre utilisateur que sa demande d'ami à été refusée
    const mail2 = {
      from: "facebikepro@gmail.com",
      to: envoyeur.email,
      subject: "Demande d'amitié envoyée refusée",
      text: `Bonjour ${envoyeur.pseudonym}, votre demande a été refusée par : "${receveur.pseudonym}"`,
      html: `
          <html>
              <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                  <h2 style="color: #4CAF50; text-align: left;">
                      Bonjour <strong>${envoyeur.pseudonym}</strong>,
                  </h2>
                  <p style="font-size: 16px; line-height: 1.6;">
                      Votre <strong>demande d'amitié</strong> a été refusée par :
                  </p>
                  <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                      "${receveur.pseudonym}"
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
      `,
    };

    // Méthode 'sendMail' de 'nodemailer' pour envoyer un email et afficher les erreurs ou succès
    transporter.sendMail(mail, (e, s) => {
      if (e) {
        console.log(e);
      } else {
        console.log(s.response);
      }
    });

    transporter.sendMail(mail2, (e, s) => {
      if (e) {
        console.log(e);
      } else {
        console.log(s.response);
      }
    });

    // Pour mettre à jour le statut de la relation
    friendship.status = "refused";
    await friendship.save();
    res.status(200).json({ message: "Demande d'amitié refusée.", friendship }); // Retourne le status d'amitié sous forme de JSON pour le debug
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors du refus de la demande.", error }); // Pour renvoyer un message d'erreur pour le debug
  }
};

// Fonction pour récupérer la liste des amis d'un utilisateur
exports.getFriends = async (req, res) => {
  try {

    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Rechercher les amis confirmés d'un utilisateur
    const friends = await Friendship.find({
      $or: [
        { requester: userId, status: "confirmed" },
        { recipient: userId, status: "confirmed" },
      ],
    })
      .populate("requester", "firstName email lastName photo _id")
      .populate("recipient", "firstName email lastName photo _id");

    // Vérifier si des amis ont été trouvés
    if (!friends || friends.length === 0) {
      return res.status(404).json({ message: "No friends found." });
    }

    // Pour transformer les relations et retourner uniquement les amis
    const friendList = friends.map((friendship) => {
      let friend = null;

      // Vérifier la validité de friendship.requester et friendship.recipient avant d'accéder à _id
      if (friendship.requester && friendship.requester._id.toString() === userId) {
        friend = friendship.recipient; // Si l'utilisateur est le demandeur, retourner le receveur
      } else if (friendship.recipient && friendship.recipient._id.toString() === userId) {
        friend = friendship.requester; // Sinon, retourner le demandeur
      }
      return friend; // Retourne soit le demandeur, soit le receveur si valides
    }).filter(friend => friend != null); // Filtrer les amis invalides

    // Vérifier s'il y a des amis dans la liste
    if (friendList.length === 0) {
      return res.status(404).json({ message: "No valid friends found." });
    }
    res.status(200).json({ friends: friendList });
  } catch (error) {
    console.error("Erreur lors de la récupération des amis :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des amis.", error });
  }
};


// Fonction pour récupérer les demandes d'ami en attente
exports.getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const pendingRequests = await Friendship.find({
      recipient: userId,
      status: "pending",
    }).populate("requester", "firstName lastName pseudonym photo _id");
    res.status(200).json({ pendingRequests }); // Retourne le status de demande sous forme de JSON pour le debug
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes en attente :",
      error
    ); // Pour renvoyer un message d'erreur pour le debug
    res.status(500).json({
      message: "Erreur lors de la récupération des demandes en attente.",
      error,
    }); // Pour renvoyer un message d'erreur pour le debug
  }
};
