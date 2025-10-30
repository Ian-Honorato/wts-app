import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// REFERENTE AOS CLIENTES

// ================================================================
// Constantes de Configuração da API
// Centralizam a URL base e a lógica de autenticação.
// ================================================================
const baseUrl = "/api/clientes/";
const baseUrlContratos = "/api/contratos/";

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
const downloadClientsApi = async (filters) => {
  const token = sessionStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  };

  let url = "/api/download/clientes";

  const cleanFilters = {};
  if (filters) {
    if (filters.status) cleanFilters.status = filters.status;
    if (filters.startDate) cleanFilters.startDate = filters.startDate;
    if (filters.endDate) cleanFilters.endDate = filters.endDate;
  }

  const params = new URLSearchParams(cleanFilters);
  const queryString = params.toString();

  if (queryString) {
    url += `?${queryString}`;
  }
  // /api/download/clientes?status=Ativo&startDate=2025-01-01
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
const createContractApi = async (contractData) => {
  const config = createBarerTokenConfig();

  const { data } = await axios.post(baseUrlContratos, contractData, config);
  return data;
};

const updateContractApi = async (contractData) => {
  const { id, ...dataToUpdate } = contractData;
  const config = createBarerTokenConfig();

  const { data } = await axios.put(
    `${baseUrlContratos}${id}`,
    dataToUpdate,
    config
  );
  return data;
};

// ============================================================
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
export function useCreateContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContractApi,
    // Ao criar um contrato, a única coisa que precisa ser atualizada
    // é a lista de contratos dentro dos detalhes do cliente específico.
    onSuccess: (data, variables) => {
      // 'variables' contém os dados que foram enviados para a mutation, incluindo o cliente_id
      const clienteId = variables.cliente_id;
      // Invalida a query de detalhes daquele cliente para recarregar a lista de contratos
      queryClient.invalidateQueries({ queryKey: ["client", clienteId] });
    },
    onError: (error) => {
      console.log("Erro ao criar contrato:", error);
    },
  });
}

export function useUpdateContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContractApi,

    onSuccess: (data, variables) => {
      const clienteId = variables.cliente_id;
      queryClient.invalidateQueries({ queryKey: ["client", clienteId] });
    },
    onError: (error) => {
      console.log("Erro ao atualizar contrato:", error);
    },
  });
}
