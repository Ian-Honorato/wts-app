import fs from "fs";
import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { sequelize, Cliente, DocCliente } from "../Models/index.js";
import { errorHandler } from "../Util/errorHandler.js";

// --- DEFINIÇÃO DO CAMINHO DE UPLOADS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = resolve(
  __dirname,
  "..", // Sai de /Controllers para /backend
  "uploads", // Acessa /backend/uploadsds
  "documentos_clientes" // Acessa /backend/uploadsds/documentos_clientes
);
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

  async findByCliente(req, res) {
    try {
      const { id: id_cliente } = req.params;

      const cliente = await Cliente.findByPk(id_cliente, {
        include: {
          model: DocCliente,
          as: "documentos",
          order: [["created_at", "DESC"]],
        },
      });

      if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado." });
      }

      return res.status(200).json(cliente.documentos);
    } catch (error) {
      const errors = errorHandler(error);
      return res.status(400).json({ errors });
    }
  }
  async delete(req, res) {
    try {
      const { id: docId } = req.params;

      const documento = await DocCliente.findByPk(docId);
      if (!documento) {
        return res.status(404).json({ error: "Documento não encontrado." });
      }

      const caminhoArquivo = path.join(uploadDir, documento.caminho_do_arquivo);

      try {
        await fs.promises.unlink(caminhoArquivo);
      } catch (fsError) {
        console.warn(
          `Falha ao deletar arquivo físico: ${caminhoArquivo}`,
          fsError
        );
      }

      await documento.destroy();
      return res.status(204).send();
    } catch (error) {
      const errors = errorHandler(error);
      return res.status(400).json({ errors });
    }
  }
  async downloadDoc(req, res) {
    try {
      const { id: docId } = req.params;

      const documento = await DocCliente.findByPk(docId);
      if (!documento) {
        return res.status(404).json({ error: "Documento não encontrado." });
      }

      // Constrói o caminho absoluto para o arquivo
      const caminhoArquivo = path.join(uploadDir, documento.caminho_do_arquivo);

      try {
        await fs.promises.access(caminhoArquivo);
      } catch (fsError) {
        console.error("Arquivo não encontrado no disco:", caminhoArquivo);
        return res
          .status(404)
          .json({ error: "Arquivo não encontrado no servidor." });
      }

      res.download(caminhoArquivo, documento.nome_arquivo, (err) => {
        if (err) {
          console.error("Erro ao enviar o arquivo:", err);
        }
      });
    } catch (error) {
      const errors = errorHandler(error);
      return res.status(400).json({ errors });
    }
  }
}

export default new DocClienteController();
