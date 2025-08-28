import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Usuario } from "../Models/index.js";

// Importando os tipos de erro específicos do Sequelize
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

/**
 * Função auxiliar para centralizar o tratamento de erros do Sequelize.
 */
function handleError(e, res) {
  if (e instanceof ValidationError) {
    const errors = e.errors.map((err) => ({
      field: err.path,
      message: err.message,
    }));
    return res
      .status(400)
      .json({ error: "Dados inválidos fornecidos.", details: errors });
  }

  if (e instanceof UniqueConstraintError) {
    const errors = e.errors.map((err) => ({
      field: err.path,
      message: `O campo '${err.path}' já está em uso.`,
    }));
    return res
      .status(409)
      .json({ error: "Conflito de dados.", details: errors });
  }

  if (e instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      error: "Operação não permitida.",
      details:
        "Este registro não pode ser excluído pois está associado a outros no sistema.",
    });
  }

  console.error("Erro Inesperado no Servidor:", e);

  return res.status(500).json({
    error: "Ocorreu um erro inesperado no servidor.",
    details: e.message,
  });
}

class UsuarioController {
  /**
   * Cria um novo usuário (apenas administradores).
   */
  async store(req, res) {
    if (req.userTipo !== "admin") {
      return res
        .status(403)
        .json({ error: "Acesso negado. Requer privilégios de administrador." });
    }

    try {
      const { nome, email, senha, tipo_usuario } = req.body;

      if (!senha || senha.length < 3) {
        return res.status(400).json({
          error: "Dados inválidos fornecidos.",
          details: [
            {
              field: "password",
              message: "A senha deve ter pelo menos 3 caracteres.",
            },
          ],
        });
      }

      const password_hash = bcrypt.hashSync(senha, 10);

      const novoUsuario = await Usuario.create({
        nome,
        email,
        password_hash,
        tipo_usuario,
      });

      const {
        id,
        nome: nomeUsuario,
        email: emailUsuario,
        tipo_usuario: tipo,
      } = novoUsuario;

      return res.status(201).json({
        id,
        nome: nomeUsuario,
        email: emailUsuario,
        tipo_usuario: tipo,
      });
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Atualiza os dados de um usuário existente.
   */
  async update(req, res) {
    const { id: paramId } = req.params;
    if (req.userTipo !== "admin" && req.userId !== Number(paramId)) {
      return res.status(403).json({
        error: "Acesso negado. Você só pode editar seu próprio perfil.",
      });
    }

    try {
      const { nome, email, old_password, password } = req.body;

      const usuario = await Usuario.findByPk(paramId);
      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      if (email && email !== usuario.email) {
        const emailExists = await Usuario.findOne({ where: { email } });
        if (emailExists) {
          return res.status(409).json({ error: "Este e-mail já está em uso." });
        }
      }

      let dadosParaAtualizar = { nome, email };

      if (old_password) {
        if (!password) {
          return res.status(400).json({ error: "A nova senha é obrigatória." });
        }

        if (!(await usuario.passwordIsValid(old_password))) {
          return res.status(401).json({ error: "Senha antiga incorreta." });
        }
      }

      if (password) {
        if (password.length < 3) {
          return res.status(400).json({
            error: "Dados inválidos fornecidos.",
            details: [
              {
                field: "password",
                message: "A nova senha deve ter pelo menos 3 caracteres.",
              },
            ],
          });
        }
        dadosParaAtualizar.password_hash = await bcrypt.hash(password, 10);
      }

      const usuarioAtualizado = await usuario.update(dadosParaAtualizar);

      const {
        id: userId,
        nome: nomeUsuario,
        email: emailUsuario,
      } = usuarioAtualizado;

      return res.json({ id: userId, nome: nomeUsuario, email: emailUsuario });
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Exclui um usuário (apenas administradores).
   */
  async destroy(req, res) {
    if (req.userTipo !== "admin") {
      return res
        .status(403)
        .json({ error: "Acesso negado. Requer privilégios de administrador." });
    }

    try {
      const { id } = req.params;
      if (req.userId === Number(id)) {
        return res.status(403).json({
          error: "Você não pode excluir sua própria conta de administrador.",
        });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      await usuario.destroy();
      return res.status(204).send();
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Exibe os dados de um usuário específico (apenas administradores).
   */
  async show(req, res) {
    if (req.userTipo !== "admin") {
      return res
        .status(403)
        .json({ error: "Acesso negado. Requer privilégios de administrador." });
    }

    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id, {
        attributes: ["id", "nome", "email", "tipo_usuario"],
      });

      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      return res.json(usuario);
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Lista todos os usuários (apenas administradores).
   */
  async index(req, res) {
    if (req.userTipo !== "admin") {
      return res
        .status(403)
        .json({ error: "Acesso negado. Requer privilégios de administrador." });
    }

    try {
      const usuarios = await Usuario.findAll({
        attributes: ["id", "nome", "email", "tipo_usuario"],
      });
      return res.json(usuarios);
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Autentica um usuário e retorna um token JWT.
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "E-mail e senha são obrigatórios." });
      }

      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario || !(await usuario.passwordIsValid(password))) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      const { id, nome, tipo_usuario } = usuario;

      const token = jwt.sign(
        { id, email: usuario.email, tipo_usuario },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRATION || "1d" }
      );

      return res.json({
        message: "Usuário autenticado com sucesso!",
        user: { id, nome, email: usuario.email, tipo_usuario },
        token,
      });
    } catch (e) {
      return handleError(e, res);
    }
  }
}

export default new UsuarioController();
