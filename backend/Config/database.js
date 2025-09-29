require("dotenv").config();

export default {
  dialect: process.env.DB_DIALECT || "mariadb",
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE,

  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  dialectOptions: {
    timezone: "-03:00",
  },
  timezone: "-03:00",
};
