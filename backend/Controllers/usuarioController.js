import Usuario from "../Models/Usuario.js";
import * as bcrypt from "bcryptjs";

//Importando erros do Sequelize
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

class UsuarioController {
  async store(req, res) {
    try {
      const { nome, email, senha, tipo_usuario } = req.body;
      const emailExists = await Usuario.findOne({ where: { email } });
      if (emailExists) {
        return res.status(409).json({ error: "Este e-mail já está em uso." });
      }

      // CORREÇÃO CRÍTICA: Passar a senha para o campo VIRTUAL 'password'
      // O hook 'beforeSave' no modelo irá cuidar da criptografia.
      const novoUsuario = await Usuario.create({
        nome,
        email,
        password: senha, // Alterado de 'password_hash' para 'password'
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
      return this._handleError(e, res);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, senha_antiga, senha } = req.body;

      if (!id) {
        return res.status(400).json({ error: "ID do usuário não fornecido." });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      if (email && email !== usuario.email) {
        const emailExists = await Usuario.findOne({ where: { email } });
        if (emailExists) {
          return res.status(409).json({ error: "Este e-mail já está em uso." });
        }
      }

      let novaSenha = {};
      if (senha_antiga && senha) {
        // CORREÇÃO: Usar o nome correto do método do modelo
        const senhaAntigaValida = await usuario.passwordIsValid(senha_antiga);
        if (!senhaAntigaValida) {
          return res.status(401).json({ error: "Senha antiga incorreta." });
        }
        novaSenha = { password: senha }; // Passa para o campo virtual
      }

      const usuarioAtualizado = await usuario.update({
        nome,
        email,
        ...novaSenha,
      });
      const {
        id: userId,
        nome: nomeUsuario,
        email: emailUsuario,
      } = usuarioAtualizado;
      return res.json({ id: userId, nome: nomeUsuario, email: emailUsuario });
    } catch (e) {
      return this._handleError(e, res);
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }
      await usuario.destroy();
      return res.status(204).send();
    } catch (e) {
      return this._handleError(e, res);
    }
  }

  async show(req, res) {
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
      return this._handleError(e, res);
    }
  }

  async index(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ["id", "nome", "email", "tipo_usuario"],
      });
      return res.json(usuarios);
    } catch (e) {
      return this._handleError(e, res);
    }
  }

  async verificaUsuario(req, res) {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) {
        return res
          .status(400)
          .json({ error: "E-mail e senha são obrigatórios." });
      }
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      // CORREÇÃO: Usar o método do modelo para consistência
      const senhaValida = await usuario.passwordIsValid(senha);
      if (!senhaValida) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      const { id, nome, tipo_usuario } = usuario;
      return res.json({
        message: "Usuário autenticado com sucesso!",
        user: { id, nome, email, tipo_usuario },
      });
    } catch (e) {
      return this._handleError(e, res);
    }
  }

  //----------------------------------------------------------------------------
  // MÉTODO PRIVADO PARA CENTRALIZAR O TRATAMENTO DE ERROS
  //----------------------------------------------------------------------------

  _handleError(e, res) {
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
        message: `O valor para '${err.path}' já está em uso.`,
      }));
      return res
        .status(409)
        .json({ error: "Conflito de dados.", details: errors });
    }

    if (e instanceof ForeignKeyConstraintError) {
      return res.status(409).json({
        error: "Operação não permitida.",
        details:
          "Este registro não pode ser excluído pois está associado a outros registros no sistema.",
      });
    }

    console.error("Erro Inesperado no Servidor:", e);
    return res.status(500).json({
      error: "Ocorreu um erro inesperado no servidor.",
      details: process.env.NODE_ENV === "development" ? e.message : undefined,
    });
  }
}

export default new UsuarioController();
