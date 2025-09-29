import app from "./app.js";
const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor backend iniciado com sucesso!`);
  console.log(`👂 Escutando em ${HOST}:${PORT}`);
  console.log(`🌐 Acesse em http://localhost:${PORT}`);
});
