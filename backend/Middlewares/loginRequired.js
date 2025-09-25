import jwt from "jsonwebtoken";
import Usuario from "../Models/Usuario.js";

export default async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      errors: ["Login necessário. Token não fornecido."],
    });
  }

  const [, token] = authorization.split(" ");

  try {
    const dados = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id, email } = dados;

    const usuario = await Usuario.findOne({
      where: { id, email },
      attributes: ["id", "nome", "email", "tipo_usuario"],
    });

    if (!usuario) {
      return res.status(401).json({
        errors: ["Sessão inválida. O usuário não existe mais."],
      });
    }

    req.userId = usuario.id;
    req.userEmail = usuario.email;
    req.userTipo = usuario.tipo_usuario;

    return next();
  } catch (e) {
    return res.status(401).json({
      errors: ["Token expirado ou inválido."],
    });
  }
};
