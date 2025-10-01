import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// REFERENTE AOS CLIENTES

// ================================================================
// Constantes de Configuração da API
// Centralizam a URL base e a lógica de autenticação.
// ================================================================
const baseUrl = "/api/clientes/";
const token = sessionStorage.getItem("token");

// Objeto de configuração do Axios com o header de autorização.
const barerTokenConfig = {
  headers: { Authorization: `Bearer ${token}` },
};

// ================================================================
// API Functions (Refatoradas)
// ================================================================

export const detailsClientApi = async (clientId) => {
  const { data } = await axios.get(`${baseUrl}${clientId}`, barerTokenConfig);
  return data;
};

const updateClientApi = async (clientData) => {
  const { data } = await axios.put(
    `${baseUrl}${clientData.id}`,
    clientData,
    barerTokenConfig
  );
  return data;
};

const deleteClientApi = async (clientId) => {
  const { data } = await axios.delete(
    `${baseUrl}${clientId}`,
    barerTokenConfig
  );
  return data;
};

const createClientApi = async (clientData) => {
  const { data } = await axios.post(
    `${baseUrl}cadastrar`,
    clientData,
    barerTokenConfig
  );
  return data;
};

const importClientApi = async (formData) => {
  // NOTA: Esta função é um caso especial pois precisa de um header extra ('Content-Type').
  const importConfig = {
    headers: {
      ...barerTokenConfig.headers,
      "Content-Type": "multipart/form-data", // -> Adiciona o header específico
    },
  };

  const response = await axios.post(
    "/api/upload/clientes",
    formData,
    importConfig
  );
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
