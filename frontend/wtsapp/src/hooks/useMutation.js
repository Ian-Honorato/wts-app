import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// REFERENTE AOS CLIENTES

// ================================================================
// Constantes de Configuração da API
// Centralizam a URL base e a lógica de autenticação.
// ================================================================
const baseUrl = "/api/clientes/";

function createBarerTokenConfig() {
  const token = sessionStorage.getItem("token");

  // Objeto de configuração do Axios com o header de autorização.
  const barerTokenConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  return barerTokenConfig;
}
// ================================================================
// API Functions
// ================================================================

export const detailsClientApi = async (clientId) => {
  const barerTokenConfig = createBarerTokenConfig();
  const { data } = await axios.get(`${baseUrl}${clientId}`, barerTokenConfig);
  return data;
};

const updateClientApi = async (clientData) => {
  const barerTokenConfig = createBarerTokenConfig();
  const { data } = await axios.put(
    `${baseUrl}${clientData.id}`,
    clientData,
    barerTokenConfig
  );
  return data;
};
const downloadClientsApi = async () => {
  const token = sessionStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  };

  const url = "/api/download/clientes";
  const response = await axios.get(url, config);
  return response.data;
};
const deleteClientApi = async (clientId) => {
  const barerTokenConfig = createBarerTokenConfig();
  const { data } = await axios.delete(
    `${baseUrl}${clientId}`,
    barerTokenConfig
  );
  return data;
};

const createClientApi = async (clientData) => {
  const barerTokenConfig = createBarerTokenConfig();
  const { data } = await axios.post(
    `${baseUrl}cadastrar`,
    clientData,
    barerTokenConfig
  );
  return data;
};

const importClientApi = async (formData) => {
  const barerTokenConfig = createBarerTokenConfig();
  const importConfig = {
    headers: {
      ...barerTokenConfig.headers,
      "Content-Type": "multipart/form-data",
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
export function useDownloadMutation() {
  return useMutation({
    mutationFn: downloadClientsApi,
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Lista_Clientes.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Erro ao fazer o download do arquivo:", error);
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
