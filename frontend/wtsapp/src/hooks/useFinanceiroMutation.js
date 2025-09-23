import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

//======================= API Functions =======================
const API_URL = "http://localhost:3001/financeiro";
const fetchParceiros = async (mes) => {
  const token = sessionStorage.getItem("token");

  const { data } = await axios.get(API_URL, {
    params: { mes },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const fetchCertificadosPendentes = async (parceiro_id, mes_referencia) => {
  const token = sessionStorage.getItem("token");

  const { data } = await axios.get(`${API_URL}/pendentes`, {
    params: { parceiro_id, mes_referencia },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const createPagamentoCertificados = async (pagamentos) => {
  const token = sessionStorage.getItem("token");

  const { data } = await axios.post(`${API_URL}/pagamentos`, pagamentos, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};
////======================= Query Hooks =======================
export const useCreatePagamentoCertificados = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pagamentos) => createPagamentoCertificados(pagamentos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parceiros"] });
      queryClient.invalidateQueries({ queryKey: ["certificadosPendentes"] });
    },
    onError: (error) => {
      console.error("Error creating pagamentos:", error);
    },
  });
};
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
//======================= Mutations Hooks =======================
