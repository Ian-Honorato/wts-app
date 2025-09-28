import { Sequelize } from "sequelize";
import database from "../config/database.js";

import Usuario from "./Usuario.js";
import Cliente from "./Cliente.js";
import ContratoCertificado from "./ContratoCertificado.js";
import MensagensEnviadas from "./MensagensEnviadas.js";
import PagamentoParceiro from "./PagamentoParceiro.js";
import Parceiro from "./Parceiro.js";
import Certificado from "./Certificado.js";
import PagamentoCertificado from "./PagamentoCertificado.js";

const models = [
  Usuario,
  Cliente,
  ContratoCertificado,
  MensagensEnviadas,
  PagamentoParceiro,
  Parceiro,
  Certificado,
  PagamentoCertificado,
];

const connection = new Sequelize(database);

models.forEach((model) => model.init(connection));

models.forEach(
  (model) => model.associate && model.associate(connection.models)
);

export {
  connection as sequelize,
  Usuario,
  Cliente,
  ContratoCertificado,
  MensagensEnviadas,
  PagamentoParceiro,
  Parceiro,
  Certificado,
  PagamentoCertificado,
};
