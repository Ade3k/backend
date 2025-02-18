const User = require("../models/User");
const bcrypt = require("bcrypt"); // Importation du module bcrypt pour le hachage des mots de passe
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // Bibliothèque pour Node.js qui permet d'envoyer des emails
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  // Configuration du transporteur pour envoyer des emails par gmail
  service: "gmail",
  auth: {
    // Objet contenant les informations d'authentification nécessaires pour envoyer des emails
    user: "facebikepro@gmail.com",
    pass: "sqip qasz qlvk eava", // Clé d'application (Mot de passe)
  },
});

// Fonction pour créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const {
      pseudonym,
      email,
      password,
      firstName,
      lastName,
      age,
      gender,
      bio,
      preferences,
    } = req.body;

    // Hachage du mot de passe avant de le stocker dans la base de données
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'une nouvelle instance de l'utilisateur avec les données reçues
    const newUser = new User({
      pseudonym,
      email,
      password: hashedPassword, // Pour stocker le mot de passe haché
      firstName,
      lastName,
      age,
      gender,
      bio,
      preferences: preferences ? preferences.split(",") : [],
      photo: req.file ? req.file.path : null, // Pour la gestion de l'ajout d'une photo
    });

    // Pour sauvegarder un nouvel utilisateur dans la base de données
    const savedUser = await newUser.save();
    console.log("Utilisateur créé :", savedUser);
    const mail = {
      from: "facebikepro@gmail.com",
      to: savedUser.email,
      subject: "Nouveau compte",
      text: `Bonjour ${savedUser.pseudonym}, vous avez créé un nouveau compte chez nous"`,
      html: `
                <html>
                    <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                        <h2 style="color: #4CAF50; text-align: left;">
                            Bonjour <strong>${savedUser.pseudonym}</strong>,
                        </h2>
                        <p style="font-size: 16px; line-height: 1.6;">
                            Vous avez <strong>crée un compte avec succès !</strong> :
                        </p>
                        <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                            Bienvenu chez nous, profitez de la communauté pour partager votre passion avec vos amis !
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
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: savedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Chercher l'utilisateur par email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email" });
    }

    // Générer un mot de passe temporaire
    const temporaryPassword = crypto.randomBytes(6).toString("hex");

    console.log(temporaryPassword)
    // Hacher le mot de passe temporaire avant de le stocker dans la base de données
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Mettre à jour le mot de passe de l'utilisateur avec le nouveau mot de passe haché
    user.password = hashedPassword;
    await user.save();

    // Créer l'e-mail pour envoyer le mot de passe temporaire
    const mail = {
      from: "facebikepro@gmail.com",
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      text: `Bonjour ${user.pseudonym}, voici votre nouveau mot de passe temporaire : ${temporaryPassword}`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #4CAF50;">Bonjour <strong>${user.pseudonym}</strong>,</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              Vous avez fait une demande pour réinitialiser votre mot de passe. Voici votre nouveau mot de passe temporaire :
            </p>
            <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
              <strong>${temporaryPassword}</strong>
            </blockquote>
            <p style="font-size: 14px; color: #555;">
              Vous pouvez l'utiliser pour vous connecter et changer votre mot de passe dès que possible.
            </p>
            <footer style="margin-top: 20px; font-size: 12px; color: #888;">
              Merci pour votre confiance, l'équipe FaceBike
            </footer>
          </body>
        </html>
      `,
    };
    res.status(200).json({ message: "Mot de passe réinsialiser avec succès" });

    // Envoyer l'e-mail de réinitialisation
    transporter.sendMail(mail, (e, s) => {
      if (e) {
        console.log(e); // Affiche error dans la console pour le debug
      } else {
        console.log(s.response); // Affiche success dans la console pour le debug
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la réinitialisation du mot de passe",
      error: error.message,
    });
  }
};

// Fonction pour mettre à jour le mot de passe d'un utilisateur
exports.updatePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Le mot de passe n'est volontairement pas haché avant d'être stocké

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du mot de passe",
      error,
    });
  }
};

// Fonction pour supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'utilisateur",
      error,
    });
  }
};

// Fonction pour authentifier et vérifier si le mot de passe est correct
exports.loginUser = async (req, res) => {
  try {
    const { pseudonym, password } = req.body;
    if (!pseudonym || !password) {
      return res
        .status(400)
        .json({ message: "Pseudonyme et mot de passe sont requis." });
    }

    const user = await User.findOne({ pseudonym });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign({ _id: user._id }, "adams"); // Pour générer un token JWT pour authentifier l'utilisateur
    // const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("jwt", token, {
      httpOnly: true, // Pour empêcher l'accès au cookie par JavaScript côté client
      maxAge: 24 * 60 * 60 * 1000, // Durée de validité du cookie : 1 heure
      sameSite: "Lax",
      secure: false,
    });

    // Pour suppimer le mot de passe de l'objet utilisateur avant de l'envoyer dans la réponse
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({
      message: "Connexion réussie",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la tentative de connexion",
      error: error.message,
    });
  }
};

// Fonction pour récupérer les données de l'utilisateur et les afficher sur le front
exports.getUser = async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "adams");

    if (!claims) {
      res.status(401).send({
        message: "Vous n'êtes pas identifié",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const { password, ...data } = await user.toJSON();

    res.send(data);
  } catch (error) {
    return res.status(401).send({
      message: " Erreur",
    });
  }
};

// Déconnexion de l'utilisateur en supprimant le cookie JWT
exports.logOut = async (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
  });
  res.send({ message: "Déconnexion réussie" });
};

// Fonction pour récupérer tous les utilisateurs, en excluant les mots de passe
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclure uniquement le champ `password`
    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ message: "Erreur interne" });
  }
};

// Déconnexion de l'utilisateur
exports.logoutUser = (req, res) => {
  /*
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'Lax',
    secure: false,
  });*/

  console.log("j'ai été appelé");

  res.status(200).json({ message: "Déconnecté avec succès" });
};

// Fonction pour vérifier la validité du token
exports.verifyToken = (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  try {
    const decoded = jwt.verify(token, "adams");
    res.status(200).json({ message: "Authentifié", user: decoded });
  } catch (error) {
    res.status(403).json({ message: "Jeton invalide ou expiré" });
  }
};
