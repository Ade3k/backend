const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const cookieParser = require("cookie-parser");
const upload = require("../middlewares/upload");

router.use(cookieParser());
router.put("/users/:userId/password", userController.updatePassword); // Route pour mettre à jour le mot de passe d'un utilisateur
router.delete("/users/:userId", userController.deleteUser); // Route pour supprimer un utilisateur
router.get("/logout", userController.logOut); // Route pour se déconnecter
router.post("/login", userController.loginUser); // Route pour se connecter
router.get("/", userController.getUser); // Route pour récupérer les informations d'un utilisateur connecté
router.get("/verifyToken", userController.verifyToken); // Route pour vérifier la validité d'un token
router.get("/logout", userController.logoutUser); // Route pour se déconnecter
router.get("/all", userController.getAllUsers); // Route pour récupérer la liste de tous les utilisateurs
router.post("/", upload.single("photo"), userController.createUser); // Route pour créer un nouvel utilisateur avec upload d'une photo de profil
router.post("/resetPassword",userController.resetPassword)
module.exports = router;
