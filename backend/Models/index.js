import { Sequelize } from "sequelize";
import database from "../config/database";

// Import models
import Usuario from "./Usuario";
import Cliente from "./Cliente";
import ContratoCertificado from "./ContratoCertificado";
import MensagensEnviadas from "./MensagensEnviadas";
import PagamentoParceiro from "./PagamentoParceiro";
import Parceiro from "./Parceiro";
import Certificado from "./Certificado";
import PagamentoCertificado from "./PagamentoCertificado";

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
