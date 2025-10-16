import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const fetchSumarioData = async () => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get("/api/dashboard/sumario", {
    headers: { Authorization: `Bearer ${token}` },
  });
  //console.log("dados do sumario", data);
  return data;
};
const fetchCriticalClients = async (period) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.post(
    `/api/clientes/contratos`,
    { days: period },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data.Contratos_criticos;
};
const fetchRenovationsData = async (filters) => {
  const token = sessionStorage.getItem("token");
  const params = new URLSearchParams();
  if (filters.data_inicio) params.append("data_inicio", filters.data_inicio);
  if (filters.data_fim) params.append("data_fim", filters.data_fim);

  const { data } = await axios.get(
    `/api/dashboard/renovations?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
// Função auxiliar para formatar Date -> "YYYY-MM-DD" (que o <input type="date"> precisa)
const formatDateToYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const hoje = new Date();
const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

// Cria o objeto de estado inicial formatado
const initialState = {
  data_inicio: formatDateToYMD(primeiroDiaDoMes),
  data_fim: formatDateToYMD(ultimoDiaDoMes),
};
export function useDashboardData(user) {
  const [criticalPeriod, setCriticalPeriod] = useState("10");
  const [filters, setFilters] = useState(initialState);
  const [activeFilters, setActiveFilters] = useState(initialState);

  const { data: sumarioData, isLoading: isSumarioLoading } = useQuery({
    queryKey: ["sumarioData"],
    queryFn: fetchSumarioData,
    enabled: user?.tipo_usuario === "admin",
  });

  const { data: criticalClients, isLoading: isLoadingCritical } = useQuery({
    queryKey: ["criticalClients", criticalPeriod],
    queryFn: () => fetchCriticalClients(criticalPeriod),
  });

  const { data: renovationsData, isLoading: isRenovationsLoading } = useQuery({
    queryKey: ["renovationsData", activeFilters],
    queryFn: () => fetchRenovationsData(activeFilters),
    enabled: user?.tipo_usuario === "admin",
  });

  const handleSearch = () => {
    setActiveFilters(filters);
  };
  return {
    sumarioData,
    criticalClients: criticalClients || [],
    isDataLoading:
      isSumarioLoading || isLoadingCritical || isRenovationsLoading,
    criticalPeriod,
    setCriticalPeriod,
    setFilters,
    filters,
    renovationsData,
    handleSearch,
  };
}
