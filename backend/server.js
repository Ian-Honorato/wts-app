import app from "./app";

const porta = 3001;
app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
