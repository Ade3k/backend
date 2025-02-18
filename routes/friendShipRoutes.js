const express = require("express"); // Importation de la bibliothèque express pour créer des routes
const router = express.Router(); // Création d'un routeur pour gérer les requêtes liées aux amitiés
const friendShipController = require("../controllers/friendShipController"); // Importation du contrôleur pour les actions liées aux demandes d'amitié
const cookieParser = require("cookie-parser");


router.use(cookieParser());
router.post("/send", friendShipController.sendFriendRequest); // Route pour envoyer une demande d'amitié
router.post("/accept/:friendshipId", friendShipController.acceptFriendRequest); // Route pour accepter une demande d'amitié
router.post("/decline/:friendshipId", friendShipController.declineFriendRequest); // Route pour refuser une demande d'amitié
router.get("/friends/:userId", friendShipController.getFriends); // Route pour récupérer une liste de demande d'amis
router.get("/pending/:userId", friendShipController.getPendingRequests); // Route pour récupérer les demande enn attente
router.post("/recommandation", friendShipController.sendRecommandation)
module.exports = router; // Exportation du routeur pour être utilisé dans d'autres fichiers
