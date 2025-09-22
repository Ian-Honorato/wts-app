import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

//======================= API Functions =======================

const fetchParceiros = async (mes) => {
  const token = sessionStorage.getItem("token");

  const { data } = await axios.get("http://localhost:3001/pagamentos", {
    params: { mes },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const fetchCertificadosPendentes = async (parceiro_id, mes_referencia) => {
  const token = sessionStorage.getItem("token");

  const { data } = await axios.get(
    "http://localhost:3001/pagamentos/pendentes",
    {
      params: { parceiro_id, mes_referencia },
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};
////======================= Query Hooks =======================

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

//proxima funcionalidade
// filtrar por periodo e tipo de certificado'
