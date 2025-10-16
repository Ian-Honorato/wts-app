// frontend/src/hooks/useMensagemMutation.js

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const enviarMensagem = async (clientesParaEnviar) => {
  const token = sessionStorage.getItem("token");
  const payload = { clientes: clientesParaEnviar };

  const { data } = await axios.post("/api/mensagem/clientes", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export function useMensagemEnviadaMutation() {
  return useMutation({
    mutationFn: enviarMensagem,
  });
}
