import { parseStringPromise } from "xml2js";
import { sequelize, Cliente, DocCliente } from "../Models/index.js";

import { errorHandler } from "../Util/errorHandler.js";

class DocClienteController {
  async store(req, res) {
    try {
      // 1. Pega o ID do cliente da URL
      const { id: id_cliente } = req.params;

      // 2. Verifica se o cliente existe (Boa prática)
      const cliente = await Cliente.findByPk(id_cliente);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado." });
      }

      // 3. Verifica se o arquivo foi enviado
      // Se o fileFilter do Multer rejeitar, req.file não existirá.
      if (!req.file) {
        return res.status(400).json({
          error: "Nenhum arquivo enviado ou formato inválido.",
        });
      }

      // 4. Pega os dados do arquivo processado pelo Multer (diskStorage)
      const {
        originalname, // O nome original (ex: "contrato.pdf")
        filename, // O nome único salvo no disco (ex: "a1b2c3-contrato.pdf")
      } = req.file;

      // 5. Salva no banco de dados
      const novoDocumento = await DocCliente.create({
        nome_arquivo: originalname,
        caminho_do_arquivo: filename,
        id_cliente: id_cliente,
      });

      return res.status(201).json(novoDocumento);
    } catch (error) {
      // Usa seu errorHandler
      const errors = errorHandler(error);
      return res.status(400).json({ errors });
    }
  }
}

export default new DocClienteController();
