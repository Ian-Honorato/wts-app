import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useDashboardData(user) {
  const [summaryData, setSummaryData] = useState(null);
  const [criticalClients, setCriticalClients] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [criticalPeriod, setCriticalPeriod] = useState("10");

  const fetchCriticalClients = useCallback(async () => {}, [criticalPeriod]);

  useEffect(() => {
    if (!user) return;
    const token = sessionStorage.getItem("token");

    const fetchData = async () => {
      setIsDataLoading(true);
      if (user.tipo_usuario === "admin") {
        //dados paa formação dos graficos
        try {
          const response = await axios.get(
            "http://localhost:3001/dashboard/sumario",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSummaryData(response.data);
        } catch (error) {
          console.error("Erro ao buscar dados do sumário:", error);
        }
      }
      //dados para formação clientes criticos
      try {
        const response = await axios.post(
          "http://localhost:3001/clientes/contratos",
          { days: criticalPeriod },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCriticalClients(response.data.Contratos_criticos);
        console.log(response.data.Contratos_criticos);
      } catch (error) {
        console.error("Erro ao buscar clientes críticos:", error);
      }
      setIsDataLoading(false);
    };

    fetchData();
  }, [user]);

  return {
    summaryData,
    criticalClients,
    isDataLoading,
    criticalPeriod,
    setCriticalPeriod,
    fetchCriticalClients,
  };
}
