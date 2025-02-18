const multer = require("multer"); // Module pour gérer l'upload de fichiers
const path = require("path"); // Module pour manipuler les chemins de fichiers

// Pour configuration la gestion du stockage des fichiers téléchargés
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Exportation de l'instance multer pour l'utiliser dans d'autres parties de l'application
module.exports = upload;
