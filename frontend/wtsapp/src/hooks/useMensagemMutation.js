// frontend/src/hooks/useMensagemMutation.js

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// =======================================================
// 1. FUNÇÃO DE API
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
// 2. HOOK DE MUTAÇÃO
// =======================================================

export function useMensagemEnviadaMutation({ onFeedback }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enviarMensagem,

    onSuccess: (data) => {
      if (onFeedback) {
        onFeedback(
          "success",
          `Processo concluído! ${data.enviadosComSucesso} mensagens enviadas com sucesso.`
        );
      }
      // Você pode invalidar queries aqui, se necessário.
      queryClient.invalidateQueries({ queryKey: ["kpisMensagens"] });
    },

    onError: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        "Ocorreu um erro ao enviar as mensagens.";

      if (onFeedback) {
        onFeedback("error", errorMessage);
      }
      console.error("Erro na mutação:", error);
    },
  });
}
