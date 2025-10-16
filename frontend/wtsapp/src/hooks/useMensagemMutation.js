import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// =======================================================
// 1. FUNÇÕES DE API (Uma para cada operação)
// =======================================================

const enviarMensagem = async (clientesParaEnviar) => {
  const token = sessionStorage.getItem("token");
  const payload = { clientes: clientesParaEnviar };
  const { data } = await axios.post("/api/mensagem/clientes", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
// =======================================================
// 2. HOOKS DE MUTAÇÃO (
// =======================================================

// Hook para enviar Mensagem
export function useMensagemEnviadaMutation({ onFeedback }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enviarMensagem,
    onSuccess: () => {
      if (onFeedback) {
        "success",
          `Processo concluído! ${data.enviadosComSucesso} mensagens enviadas com sucesso.`;
      }
    },
    onerror: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        "Ocorreu um erro ao enviar as mensagens.";
      console.log("Erro na mutação:", error);
      if (onFeedback) {
        onFeedback("error", errorMessage);
      }
    },
  });
}
