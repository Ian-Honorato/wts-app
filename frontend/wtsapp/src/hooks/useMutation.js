import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const updateClientApi = async (clientData) => {
  console.log("dados do cliente ", clientData);
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

// Hook para ALTERAR um cliente
export function useUpdateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"]);
      console.log("cliente atualizado");
      queryClient.invalidateQueries({ queryKey: ["sumarioData"] });
      queryClient.invalidateQueries({ queryKey: ["criticalClients"] });
    },
  });
}
export function useCreateClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"]);
      queryClient.invalidateQueries({ queryKey: ["sumarioData"] });
      queryClient.invalidateQueries({ queryKey: ["criticalClients"] });
    },
  });
}
export function useImportClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"]);
      queryClient.invalidateQueries({ queryKey: ["sumarioData"] });
      queryClient.invalidateQueries({ queryKey: ["criticalClients"] });
    },
  });
}
export function useDeleteClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"]);
      queryClient.invalidateQueries({ queryKey: ["sumarioData"] });
      queryClient.invalidateQueries({ queryKey: ["criticalClients"] });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}
