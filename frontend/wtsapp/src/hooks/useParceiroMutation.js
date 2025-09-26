import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// =======================================================
// 1. FUNÇÕES DE API (Uma para cada operação)
// =======================================================

const addParceiro = async (parceiroData) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.post("/api/parceiros", parceiroData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const updateParceiro = async ({ id, data }) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.put(`/api/parceiros/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteParceiro = async (id) => {
  const token = sessionStorage.getItem("token");
  await axios.delete(`/api/parceiros/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// =======================================================
// 2. HOOKS DE MUTAÇÃO (Um para cada operação)
// =======================================================

// Hook para CRIAR um parceiro
export function useAddParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addParceiro,
    onSuccess: () => {
      // Invalida a lista de parceiros e os dados do dashboard para recarregar
      queryClient.invalidateQueries({ queryKey: ["parceiros"] });
      queryClient.invalidateQueries({ queryKey: ["summaryData"] });
    },
  });
}

// Hook para ATUALIZAR um parceiro
export function useUpdateParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateParceiro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parceiros"] });
      queryClient.invalidateQueries({ queryKey: ["summaryData"] });
    },
  });
}

// Hook para DELETAR um parceiro
export function useDeleteParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteParceiro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parceiros"] });
      queryClient.invalidateQueries({ queryKey: ["summaryData"] });
    },
  });
}
