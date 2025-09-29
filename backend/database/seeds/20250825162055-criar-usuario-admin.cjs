"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash("123", 10);

    await queryInterface.bulkInsert(
      "usuarios",
      [
        {
          nome: "Admin",
          email: "admin@email.com",
          tipo_usuario: "admin", // Garante que o usuário seja um administrador
          password_hash: passwordHash,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove o usuário admin se o seed for desfeito
    await queryInterface.bulkDelete("usuarios", { email: "admin@email.com" });
  },
};
