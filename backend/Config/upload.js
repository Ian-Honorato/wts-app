import multer from "multer";

// Configuração do Multer
const multerConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Permite apenas arquivos XML
    if (file.mimetype === "text/xml" || file.mimetype === "application/xml") {
      cb(null, true);
    } else {
      cb(
        new Error("Formato de arquivo inválido. Apenas XML é permitido."),
        false
      );
    }
  },
};

export default multer(multerConfig);
