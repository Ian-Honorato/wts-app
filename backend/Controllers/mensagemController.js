import axios from "axios";
import { MensagensEnviadas } from "../Models/index.js";

const INSTANCE_ID = "3E3B092DD6D8A02007B3764AFE850DAC";
const INSTANCE_TOKEN = "1035234992EB1CAA10FC88B8";
const CLIENT_TOKEN = "Fd6a19274e4484b53a90dd0816ea9feb7S";

const ZAPI_URL = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${INSTANCE_TOKEN}/send-text`;

class MensagemController {
  async enviarTodos(req, res) {
    const { clientes } = req.body;
    const usuarioId = req.userId;

    if (!clientes || !Array.isArray(clientes) || clientes.length === 0) {
      return res.status(400).json({
        error: "A lista de clientes está vazia ou em formato inválido.",
      });
    }

    const relatorioSucesso = [];
    const relatorioFalha = [];

    for (const cliente of clientes) {
      //console.log(cliente);
      try {
        const dias = cliente.diasRestantes;
        const textoDias = dias === 1 ? "dia" : "dias";
        const dataFormatada = new Date(
          cliente.vencimento_certificado
        ).toLocaleDateString("pt-BR");
        const mensagemDinamica = `
${cliente.nome_empresa} - ${cliente.registro}
Olá, tudo bem? 👋
Lembrando que o certificado digital vence no dia ${dataFormatada}.
Podemos agendar a renovação com antecedência, por videoconferência ou presencialmente aqui na Incubadora de Empresas em Lins.
Se já estiver agendado, por favor, desconsidere esta mensagem automática. ✅📅`;

        const telefoneLimpo = cliente.contato.replace(/\D/g, "");
        const payload = {
          phone: `${telefoneLimpo}@c.us`,
          message: mensagemDinamica,
        };
        const config = {
          headers: { "Client-Token": CLIENT_TOKEN },
        };
        const response = await axios.post(ZAPI_URL, payload, config);
        await MensagensEnviadas.create({
          data_envio: new Date(),
          cliente_id: cliente.id,
          enviada_por_id: usuarioId,
        });
        relatorioSucesso.push({
          nome: cliente.representante,
          apiResponse: response.data,
        });
      } catch (error) {
        console.error(
          `Falha ao enviar notificação para ${cliente.representante}.`
        );
        const errorDetails = error.response
          ? error.response.data
          : { error: error.message };
        relatorioFalha.push({ nome: cliente.representante, errorDetails });
      }
    }

    console.log(`\n--- Processo Finalizado ---`);

    return res.status(200).json({
      message: "Processamento de notificações concluído.",
      enviadosComSucesso: relatorioSucesso.length,
      falhasNoEnvio: relatorioFalha.length,
      detalhesSucesso: relatorioSucesso,
      detalhesFalha: relatorioFalha,
    });
  }
}

export default new MensagemController();
