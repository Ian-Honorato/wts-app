import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
//======================= API Functions =======================
const API_BASE_URL = "/api/documentos";

// Função para obter os cabeçalhos de autenticação
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  // Retorna o objeto de configuração do Axios
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};
/**
 * Hook (useQuery) para buscar a lista de documentos de um cliente.
 */
export const useClientDocs = (clientId, isOpen) => {
  return useQuery({
    queryKey: ["clientDocs", clientId],

    queryFn: async () => {
      // CORRETO: Já estava usando getAuthHeaders()
      const { data } = await axios.get(
        `${API_BASE_URL}/listar/${clientId}`,
        getAuthHeaders()
      );
      return data;
    },
    enabled: isOpen && !!clientId,
    staleTime: 1000 * 60,
  });
};

/**
 * Hook (useMutation) para ADICIONAR um novo documento.
 */
export const useAddClientDocMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, formData }) => {
      const { headers: authHeaders } = getAuthHeaders();

      const { data } = await axios.post(
        `${API_BASE_URL}/cadastrar/${clientId}`,
        formData,
        {
          headers: {
            ...authHeaders,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: (newData, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["clientDocs", variables.clientId],
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
      await axios.delete(
        `${API_BASE_URL}/deletar/${documentoId}`,
        getAuthHeaders()
      );
      return documentoId;
    },
    onSuccess: (deletedId, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clientDocs"] });
    },
  });
};
