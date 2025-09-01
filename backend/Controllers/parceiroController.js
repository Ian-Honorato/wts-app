// 1. Importa o modelo 'Parceiro' a partir do inicializador central
import { Parceiro } from "../Models/index.js";

// Importando os tipos de erro específicos do Sequelize para tratamento
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";
import { handleError } from "../Util/errorHandler.js";
/**
 * Função auxiliar para centralizar o tratamento de erros.
 */
class ParceiroController {
  /**
   * Cria um novo parceiro, associando-o ao usuário logado.
   */
  async store(req, res) {
    try {
      const { nome_escritorio } = req.body;
      if (!nome_escritorio) {
        return res
          .status(400)
          .json({ error: "O campo 'nome_escritorio' é obrigatório." });
      }

      const novoParceiro = await Parceiro.create({
        nome_escritorio,
        cadastrado_por_id: req.userId, // Associa o parceiro ao usuário que o criou
      });

      return res.status(201).json(novoParceiro);
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Lista todos os parceiros.
   */
  async index(req, res) {
    try {
      const parceiros = await Parceiro.findAll({
        order: [["nome_escritorio", "ASC"]],
      });
      return res.json(parceiros);
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Exibe um parceiro específico.
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const parceiro = await Parceiro.findByPk(id);

      if (!parceiro) {
        return res.status(404).json({ error: "Parceiro não encontrado." });
      }

      return res.json(parceiro);
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Atualiza um parceiro existente.
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome_escritorio } = req.body;

      const parceiro = await Parceiro.findByPk(id);
      if (!parceiro) {
        return res.status(404).json({ error: "Parceiro não encontrado." });
      }

      if (!nome_escritorio) {
        return res
          .status(400)
          .json({ error: "O campo 'nome_escritorio' é obrigatório." });
      }

      const parceiroAtualizado = await parceiro.update({ nome_escritorio });
      return res.json(parceiroAtualizado);
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Exclui um parceiro.
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const parceiro = await Parceiro.findByPk(id);

      if (!parceiro) {
        return res.status(404).json({ error: "Parceiro não encontrado." });
      }

      await parceiro.destroy();
      return res.json({ message: "Parceiro excluído com sucesso." });
    } catch (e) {
      return handleError(e, res);
    }
  }

  /*
   * Pagamento de um parceiro
   */
  async contratosByParceiro(req, res) {
    try {
      const { id } = req.params;

      const parceiro = await Parceiro.findByPk(id, {
        // Inclui os clientes associados
        include: {
          model: Cliente,
          as: "clientes_indicados",
          attributes: ["id", "nome", "cpf_cnpj"],
          // Para cada cliente, inclui os contratos associados
          include: {
            model: ContratoCertificado,
            as: "contratos",
            attributes: ["id", "numero_contrato", "data_vencimento", "status"],
          },
        },
      });

      if (!parceiro) {
        return res.status(404).json({ error: "Parceiro não encontrado." });
      }

      const clientesIndicados = parceiro.clientes_indicados || [];
      const todosOsContratos = clientesIndicados.flatMap(
        (cliente) => cliente.contratos || []
      );

      const response = {
        parceiro: {
          id: parceiro.id,
          nome_escritorio: parceiro.nome_escritorio,
        },
        quantidade_clientes_indicados: clientesIndicados.length,
        contratos_associados: todosOsContratos,
      };

      return res.json(response);
    } catch (e) {
      return handleError(e, res);
    }
  }

  async pagarParceiro(req, res) {}
}

export default new ParceiroController();
