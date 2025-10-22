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
export const useClientDocs = (clienteId, isOpen) => {
  return useQuery({
    queryKey: ["clientDocs", clienteId],
    queryFn: async () => {
      // CORRETO: Já estava usando getAuthHeaders()
      const { data } = await axios.get(
        `${API_BASE_URL}/listar/${clienteId}`,
        getAuthHeaders() // <-- OK
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
    mutationFn: async ({ clienteId, formData }) => {
      // 1. Pega os cabeçalhos de autenticação
      const { headers: authHeaders } = getAuthHeaders();

      const { data } = await axios.post(
        // 2. CORRIGIDO: Adicionada a barra "/"
        `${API_BASE_URL}/cadastrar/${clienteId}`,
        formData,
        {
          // 3. CORRIGIDO: Mescla os headers de Auth e Content-Type
          headers: {
            ...authHeaders, // Adiciona o header de Autorização
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: (newData, variables) => {
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
      await axios.delete(
        `${API_BASE_URL}/deletar/${documentoId}`,
        getAuthHeaders() // <-- CORRIGIDO: Adicionado auth headers
      );
      return documentoId;
    },
    onSuccess: (deletedId, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clientDocs"] });
    },
  });
};
