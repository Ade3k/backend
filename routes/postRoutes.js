const express = require("express");
const postController = require("../controllers/postController");
const router = express.Router();
const cookieParser = require("cookie-parser");
const upload = require("../middlewares/upload");

router.use(cookieParser()); // Utilisation du middleware 'cookie-parser' pour gérer les cookies dans les requêtes HTTP
router.post("/", upload.single("image"), postController.createPost); // Route pour créer une nouvelle publication
router.delete("/delete/:PostId", postController.deletePost); // Route pour supprimer une publication
router.get("/:userId", postController.getUserPosts); // Route pour récupérer toutes les publications
router.post("/comment", postController.addComment); // Route pour ajouter un commentaire à une publication

module.exports = router;
