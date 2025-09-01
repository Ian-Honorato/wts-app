import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

export function errorHandler(e, res) {
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
    details: process.env.NODE_ENV === "development" ? e.message : undefined,
  });
}
