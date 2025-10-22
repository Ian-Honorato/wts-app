import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
//======================= API Functions =======================
const API_BASE_URL = "/api/documentos";

/**
 * Hook (useQuery) para buscar a lista de documentos de um cliente.
 */
export const useClientDocs = (clienteId, isOpen) => {
  return useQuery({
    queryKey: ["clientDocs", clienteId],
    queryFn: async () => {
      // Rota GET que criamos: /clientes/documentos/:id
      const { data } = await axios.get(`${API_BASE_URL}/listar/${clienteId}`);
      return data;
    },
    enabled: isOpen && !!clienteId, // Só busca quando o modal está aberto
    staleTime: 1000 * 60, // Cache de 1 minuto
  });
};

/**
 * Hook (useMutation) para ADICIONAR um novo documento.
 */
export const useAddClientDocMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clienteId, formData }) => {
      const { data } = await axios.post(
        `${API_BASE_URL}cadastrar/${clienteId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: (newData, variables) => {
      // Invalida o cache para forçar o refetch da lista
      queryClient.invalidateQueries({
        queryKey: ["clientDocs", variables.clienteId],
      });
    },
  });
};

/**
 * Hook (useMutation) para DELETAR um documento.
 */
export const useDeleteClientDocMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentoId) => {
      // Rota DELETE:
      await axios.delete(`${API_BASE_URL}/deletar/${documentoId}`);
      return documentoId; // Retorna o ID para o onSuccess
    },
    onSuccess: (deletedId, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clientDocs"] });
    },
  });
};
