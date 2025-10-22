import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

//======================= API Functions =======================
const API_BASE_URL = "/api/financeiro";

// Função auxiliar para obter o token
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// --- Funções  ---
const fetchParceiros = async (mes, tipoId) => {
  const { data } = await axios.get(`${API_BASE_URL}`, {
    params: { mes, tipoId },
    ...getAuthHeaders(),
  });
  return data;
};

const fetchCertificadosPendentes = async (parceiro_id, mes_referencia) => {
  const { data } = await axios.get(`${API_BASE_URL}/pendentes`, {
    params: { parceiro_id, mes_referencia },
    ...getAuthHeaders(),
  });
  return data;
};

const createPagamentoCertificados = async (pagamentos) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/pagamentos`,
    pagamentos,
    getAuthHeaders()
  );
  return data;
};

const fetchSumarioFinanceiro = async ({ queryKey }) => {
  const [_key, { mes, ano }] = queryKey;
  const { data } = await axios.get(`${API_BASE_URL}/sumario`, {
    params: { mes, ano },
    ...getAuthHeaders(),
  });
  return data;
};

const fetchDetalhesPagamento = async ({ queryKey }) => {
  const [_key, pagamentoId] = queryKey;
  const { data } = await axios.get(
    `${API_BASE_URL}/detalhes/${pagamentoId}`,
    getAuthHeaders()
  );
  return data;
};

//======================= Query Hooks =======================

// --- Hooks existentes ---
export const useFetchParceiros = (mes, tipoId) => {
  return useQuery({
    queryKey: ["parceiros", mes, tipoId],
    queryFn: () => fetchParceiros(mes, tipoId),
    enabled: !!mes,
  });
};

export const useCertificadosPendentes = (mesReferencia, parceiroId) => {
  return useQuery({
    queryKey: ["certificadosPendentes", mesReferencia, parceiroId],
    queryFn: () => fetchCertificadosPendentes(parceiroId, mesReferencia),
    enabled: !!mesReferencia && !!parceiroId,
  });
};

export const useSumarioFinanceiro = (mes, ano) => {
  return useQuery({
    queryKey: ["sumarioFinanceiro", { mes, ano }],
    queryFn: fetchSumarioFinanceiro,

    enabled: !!mes && !!ano,
    //manter dados anteriores enquanto a nova busca acontece
    // keepPreviousData: true,
  });
};

export const useDetalhesPagamento = (pagamentoId) => {
  return useQuery({
    queryKey: ["detalhesPagamento", pagamentoId],
    queryFn: fetchDetalhesPagamento,
    enabled: !!pagamentoId,
  });
};

//======================= Mutations Hooks =======================
export const useCreatePagamentoCertificados = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pagamentos) => createPagamentoCertificados(pagamentos),
    onSuccess: () => {
      // Invalida a query do sumário para que ela seja recarregada com os novos dados
      queryClient.invalidateQueries({ queryKey: ["sumarioFinanceiro"] });
      queryClient.invalidateQueries({ queryKey: ["parceiros"] });
      queryClient.invalidateQueries({ queryKey: ["certificadosPendentes"] });
    },
    onError: (error) => {
      console.error("Error creating pagamentos:", error);
    },
  });
};
