import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// REFERENTE AOS CLIENTES

// ================================================================
// API Functions
// ================================================================

export const detailsClientApi = async (clientId) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get(`/api/clientes/${clientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const updateClientApi = async (clientData) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.put(
    `/api/clientes/${clientData.id}`,
    clientData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
const deleteClientApi = async (clientId) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.delete(`/api/clientes/${clientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
const createClientApi = async (clientData) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.post("/api/clientes/cadastrar", clientData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
const importClientApi = async (formData) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post("/api/upload/clientes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
// ================================================================
// Mutations Hooks
// ================================================================

// Função centralizada para invalidar todos os caches relacionados
const invalidandoQueries = (queryClient) => {
  //console.log("Invalidando todos os caches relevantes...");
  queryClient.invalidateQueries({ queryKey: ["clients"] });
  queryClient.invalidateQueries({ queryKey: ["sumarioData"] });
  queryClient.invalidateQueries({ queryKey: ["renovationsData"] });
  queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === "criticalClients",
  });
  queryClient.invalidateQueries({ queryKey: ["parceiros"] });
  queryClient.invalidateQueries({ queryKey: ["certificadosPendentes"] });
};

export function useUpdateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClientApi,
    onSuccess: () => invalidandoQueries(queryClient),
    onError: (error) => {
      console.log("Erro na mutação:", error);
    },
  });
}
export function useCreateClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClientApi,
    onSuccess: () => invalidandoQueries(queryClient),
    onError: (error) => {
      console.log("Erro na mutação:", error);
    },
  });
}
export function useImportClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importClientApi,
    onSuccess: () => invalidandoQueries(queryClient),
    onError: (error) => {
      console.log("Erro na mutação:", error);
    },
  });
}
export function useDeleteClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClientApi,
    onSuccess: () => invalidandoQueries(queryClient),
    onError: (error) => {
      console.log("Erro na mutação:", error);
    },
  });
}
