/**
 * @file config/upload.js (ou o nome do seu arquivo)
 * @description Configura e exporta o middleware Multer para o tratamento de uploads de arquivos.
 * Este módulo está configurado especificamente para aceitar arquivos XML, armazená-los
 * em memória para processamento e impor um limite de tamanho.
 */
import multer from "multer";

/**
 * @const {object} multerConfig - Objeto de configuração para o Multer.
 * Define as regras de armazenamento, limites de tamanho e filtragem de tipo de arquivo.
 */

// Configuração do Multer
const multerConfig = {
  /**
   * @property {object} storage - Define a estratégia de armazenamento dos arquivos.
   * `multer.memoryStorage()` armazena o arquivo como um Buffer na memória RAM (`req.file.buffer`).
   * É ideal para quando o arquivo precisa ser processado ou enviado para outro serviço
   * sem a necessidade de ser salvo fisicamente no disco do servidor.
   */
  storage: multer.memoryStorage(),
  limits: {
    // Define o tamanho máximo do arquivo permitido em bytes.
    // Neste caso, 8 * 1024 * 1024 = 8MB.
    fileSize: 8 * 1024 * 1024,
  },
  /**
   * @property {function} fileFilter - Função para validar e filtrar os arquivos recebidos.
   * Decide se um arquivo deve ser aceito ou rejeitado com base em suas propriedades.
   * @param {object} req - O objeto da requisição Express.
   * @param {object} file - O objeto do arquivo enviado pelo Multer.
   * @param {function} cb - A função de callback para sinalizar a decisão (aceitar ou rejeitar).
   */
  fileFilter: (req, file, cb) => {
    // Verifica o mimetype do arquivo para garantir que seja do tipo XML.
    if (file.mimetype === "text/xml" || file.mimetype === "application/xml") {
      // Se for XML, aceita o arquivo passando 'true' no callback.
      cb(null, true);
    } else {
      // Se não for XML, rejeita o arquivo passando 'false' e uma instância de Error.
      // Este erro pode ser capturado em um middleware de tratamento de erros.
      cb(
        new Error("Formato de arquivo inválido. Apenas XML é permitido."),
        false
      );
    }
  },
};

// Inicializa o Multer com as configurações definidas e exporta a instância.
// Esta instância será usada como um middleware nas rotas que precisam de upload de arquivos.
export default multer(multerConfig);
