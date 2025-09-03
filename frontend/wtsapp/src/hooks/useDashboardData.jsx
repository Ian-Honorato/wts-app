import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const fetchSumarioData = async () => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get("http://localhost:3001/clientes/sumario", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
const fetchCriticalClients = async (period) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.post(
    `http://localhost:3001/clientes/contratos`,
    { days: period },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(data.Contratos_criticos);
  return data.Contratos_criticos;
};

export function useDashboardData(user) {
  const [criticalPeriod, setCriticalPeriod] = useState("10");

  const { data: sumarioData, isLoading: isSumarioLoading } = useQuery({
    queryKey: ["sumarioData"],
    queryFn: fetchSumarioData,
    enabled: user?.tipo_usuario === "admin",
  });

  const { data: criticalClients, isLoading: isLoadingCritical } = useQuery({
    queryKey: ["criticalClients", criticalPeriod],
    queryFn: () => fetchCriticalClients(criticalPeriod),
  });

  return {
    sumarioData,
    criticalClients: criticalClients || [],
    isDataLoading: isSumarioLoading || isLoadingCritical,
    criticalPeriod,
    setCriticalPeriod,
  };
}
