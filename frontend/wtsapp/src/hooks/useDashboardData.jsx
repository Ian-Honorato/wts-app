import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const fetchSumarioData = async () => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get("http://localhost:3001/dashboard/sumario", {
    headers: { Authorization: `Bearer ${token}` },
  });
  //console.log("dados do sumario", data);
  return data;
};
const fetchCriticalClients = async (period) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.post(
    `http://localhost:3001/clientes/contratos`,
    { days: period },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  //console.log("dados do contrato", data.Contratos_criticos);
  return data.Contratos_criticos;
};
const fetchRenovationsData = async (filters) => {
  const token = sessionStorage.getItem("token");
  const params = new URLSearchParams();
  if (filters.data_inicio) params.append("data_inicio", filters.data_inicio);
  if (filters.data_fim) params.append("data_fim", filters.data_fim);

  const { data } = await axios.get(
    `http://localhost:3001/dashboard/renovations?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log("REcebendo dados", data);
  return data;
};

export function useDashboardData(user) {
  const [criticalPeriod, setCriticalPeriod] = useState("10");
  const [filters, setFilters] = useState({ data_inicio: "", data_fim: "" });
  const [activeFilters, setActiveFilters] = useState({
    data_inicio: "",
    data_fim: "",
  });

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
