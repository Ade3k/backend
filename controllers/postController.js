const Post = require("../models/Post"); // Modèle Post pour gérer les publications des utilisateurs
const jwt = require("jsonwebtoken"); // Importation de jsonwebtoken pour la gestion des tokens d'authentification
const User = require("../models/User"); // Modèle User pour accéder aux informations des utilisateurs
const nodemailer = require("nodemailer"); // Bibliothèque pour Node.js qui permet d'envoyer des emails

const transporter = nodemailer.createTransport({
  service: "gmail",
  // Configuration du transporteur pour envoyer des emails par gmail
  auth: {
    // Objet contenant les informations d'authentification nécessaires pour envoyer des emails
    user: "facebikepro@gmail.com",
    pass: "sqip qasz qlvk eava", // Clé d'application (Mot de passe)
  },
});

// Fonction pour créer une nouvelle publication
exports.createPost = async (req, res) => {
  // Difficuté à la programation : utilisation de nodemailer
  try {
    // Récupération des données envoyées depuis le front
    const { Author, content } = req.body; // Recupere formdata depuis le front
    console.log(Author); // Affiche l'auteur dans la console pour le debug

    const newPost = new Post({
      author: Author, // ID de l'auteur de la publication
      content,
      image: req.file ? req.file.path : null, // Ajout de l'image si fournie, sinon null
    });

    const savedPost = await newPost.save(); // Enregistre la publication dans la base de données
    const createurDuPost = await User.findById(Author); // Pour rechercher les informations de l'utilisateur qui a créé la publication
    console.log(savedPost); // Affiche la publication après son enregistrement pour le debug

    // Objet 'mail' pour envoyer un email informant un utilisateur qu'il a crée une publication
    const mail = {
      from: "facebikepro@gmail.com",
      to: createurDuPost.email,
      subject: "Nouvelle publication",
      text: `Bonjour ${createurDuPost.pseudonym}, vous avez créé une nouvelle publication : "${content}"`,
      html: `
                <html>
                    <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
                        <h2 style="color: #4CAF50; text-align: left;">
                            Bonjour <strong>${createurDuPost.pseudonym}</strong>,
                        </h2>
                        <p style="font-size: 16px; line-height: 1.6;">
                            Vous avez effectué une <strong>nouvelle publication</strong> :
                        </p>
                        <blockquote style="font-size: 14px; color: #555; border-left: 4px solid #4CAF50; padding-left: 10px;">
                            "${content}"
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

    res.status(201).json({ message: "Post créé avec succès", savedPost });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du post" });
  }
};

// Fonction pour récupérer toutes les publications d'un utilisateur
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params; // Pour récupérer l'ID de l'utilisateur depuis les paramètres de la requête

    // Pour récupérer les publications de l'utilisateur, triées par date décroissante
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "pseudonym firstName photo lastName"); // Populer pour obtenir des détails sur l'auteur

    res.status(200).json(posts); // Retourne les publications sous forme de JSON pour le debug
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des posts", error }); // Pour renvoyer un message d'erreur pour le debug
  }
};

// Fonction pour supprimer une publication
exports.deletePost = async (req, res) => {
  try {
    const { PostId } = req.params; // Pour récupérer l'ID de la publication depuis les paramètres de la requête

    const deletedPost = await Post.findByIdAndDelete(PostId);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post introuvable" }); // Retourne le status de la publication sous forme de JSON pour le debug
    }
    res.status(201).json({ message: "Post supprimé avec succès" }); // Retourne le status de la publication sous forme de JSON pour le debug
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du post" }); // Pour renvoyer un message d'erreur pour le debug
  }
};

// Fonction pour ajouter un commentaire à une publication
exports.addComment = async (req, res) => {
  try {
    const { PostId, content } = req.body; // Pour récupérer des données de la publication depuis le corps de la requête

    const cookie = req.cookies["jwt"]; // Pour récupérer le cookie JWT pour l'authentification
    const claims = jwt.verify(cookie, "adams"); // Vérification du JWT pour récupérer les informations de l'utilisateur
    const post = await Post.findById(PostId); // Pour rechercher la publication par son ID
    const user = await User.findOne({ _id: claims._id }); // Pour rechercher l'utilisateur dans la base de données à l'aide de son ID extrait du JWT

    // Pour récupérer le pseudonym de l'utilisateur pour l'afficher dans le commentaire
    const userComment = user.pseudonym;
    console.log(userComment); // Retourne le commentaire sous forme de JSON pour le debug

    if (!post) {
      return res.status(404).json({ message: "Publication non trouvée" }); // Retourne le status de la publication sous forme de JSON pour le debug
    }
    const comment = { author: userComment, content }; // Création de l'objet de commentaire avec l'auteur et le contenu
    post.comments.push(comment); // Pour ajouter un commentaire à la liste des commentaires de la publication
    await post.save();

    res.status(201).json({ message: "Ajout du commentaire avec succès", post }); // Retourne le status de la publication sous forme de JSON pour le debug
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire" }); // Pour renvoyer un message d'erreur pour le debug
  }
};
