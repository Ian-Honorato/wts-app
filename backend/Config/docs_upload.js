/**
 * @file config/docs_upload.js
 * @description Configura o Multer para upload de documentos de clientes (PDF, Imagens).
 * Este módulo salva os arquivos fisicamente no disco do servidor.
 */
import multer from "multer";
import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

// --- Workaround para __dirname em ES Modules ---
// Em módulos ESM, __dirname não é definido por padrão.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ------------------------------------------------

// Define o diretório de destino dos uploads
// ex: /seu-projeto/uploads/documentos_clientes
const uploadDir = resolve(
  __dirname,
  "..", // Sai de /config
  "uploads",
  "documentos_clientes"
);

/**
 * @const {object} docsUploadConfig - Configuração do Multer para documentos de clientes.
 */
const docsUploadConfig = {
  /**
   * @property {object} storage - Define a estratégia de armazenamento em disco.
   * `multer.diskStorage()` salva o arquivo no sistema de arquivos no 'destination'
   * e com o 'filename' especificado.
   */
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Nota: É uma boa prática garantir que este diretório exista
      // na inicialização do seu servidor (ex: no app.js).
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Gera um hash único para o nome do arquivo para evitar colisões
      // e problemas com nomes de arquivos contendo caracteres especiais.
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        const uniqueSuffix = hash.toString("hex");
        const fileName = `${uniqueSuffix}-${file.originalname}`;
        cb(null, fileName);
      });
    },
  }),

  /**
   * @property {object} limits - Limites para os arquivos.
   */
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (ajuste conforme necessário)
  },

  /**
   * @property {function} fileFilter - Valida o tipo de arquivo.
   */
  fileFilter: (req, file, cb) => {
    // Lista de mimetypes permitidos para documentos
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/pjpeg", // Para JPEGs antigos
      "image/png",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Formato de arquivo inválido. Apenas PDF, JPG ou PNG são permitidos."
        ),
        false
      );
    }
  },
};

// Exporta a instância do Multer configurada
export default multer(docsUploadConfig);
