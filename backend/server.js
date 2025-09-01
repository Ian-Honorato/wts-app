import app from "./app";

const porta = 3001;
app.listen(porta, () => {
  console.log(`\n🚀 Servidor backend iniciado com sucesso!`);
  console.log(`👂 Escutando na porta ${porta}`);
  console.log(`🌐 Acesse em http://localhost:${porta}`);
});
