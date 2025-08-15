import { Sequelize } from "sequelize";
import database from "../config/database";

// Import models

const models = [];

const connection = new Sequelize(database);

models.forEach((model) => model.init(connection));

models.forEach(
  (model) => model.associate && model.associate(connection.models)
);

export { connection };
