import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// ================================================================
// API Functions
// ================================================================

export const detailsClientApi = async (clientId) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get(
    `http://localhost:3001/clientes/${clientId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

const updateClientApi = async (clientData) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.put(
    `http://localhost:3001/clientes/${clientData.id}`,
    clientData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
const deleteClientApi = async (clientId) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.delete(
    `http://localhost:3001/clientes/${clientId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
const createClientApi = async (clientData) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.post(
    "http://localhost:3001/clientes/cadastrar",
    clientData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
const importClientApi = async (formData) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(
    "http://localhost:3001/upload/clientes",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
// ================================================================
// Mutations Hooks
// ================================================================

export function useUpdateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["sumarioData"] });

      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "criticalClients",
      });
    },
  });
}
export function useCreateClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["sumarioData"] });

      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "criticalClients",
      });
    },
  });
}
export function useImportClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["sumarioData"] });

      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "criticalClients",
      });
    },
  });
}
export function useDeleteClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["sumarioData"] });

      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "criticalClients",
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}
