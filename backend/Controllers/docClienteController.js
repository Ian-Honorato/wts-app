import { parseStringPromise } from "xml2js";
import { sequelize, Cliente, DocCliente } from "../Models/index.js";

import { errorHandler } from "../Util/errorHandler.js";

class DocClienteController {
  async store(req, res) {
    try {
      const { id: id_cliente } = req.params;

      const cliente = await Cliente.findByPk(id_cliente);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado." });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "Nenhum arquivo enviado ou formato inválido.",
        });
      }

      const { originalname, filename } = req.file;

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
