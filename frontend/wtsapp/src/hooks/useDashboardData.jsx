import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// --- FUNÇÕES DE API ---
// Cada função é responsável por obter o token diretamente, garantindo robustez.

const fetchSumarioData = async () => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get("/api/dashboard/sumario", {
    headers: { Authorization: `Bearer ${token}` },
  });
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

// NOVA FUNÇÃO para buscar as notificações mensais
const fetchNotificacoesMensais = async (month) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get("/api/dashboard/notificacoes-mes", {
    headers: { Authorization: `Bearer ${token}` },
    params: { month },
  });
  return {
    totalNotificados: data.length,
    notificacoes: data,
  };
};

// --- LÓGICA DE DATAS ---

const formatDateToYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const hoje = new Date();
const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

const initialState = {
  data_inicio: formatDateToYMD(primeiroDiaDoMes),
  data_fim: formatDateToYMD(ultimoDiaDoMes),
};

// --- HOOK PRINCIPAL ---

export function useDashboardData(user) {
  const [criticalPeriod, setCriticalPeriod] = useState("10");
  const [filters, setFilters] = useState(initialState);
  const [activeFilters, setActiveFilters] = useState(initialState);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // As queries voltam ao seu estado original e funcional
  const { data: sumarioData, isLoading: isSumarioLoading } = useQuery({
    queryKey: ["sumarioData"], // Chave simples
    queryFn: fetchSumarioData,
    enabled: !!user,
  });

  const { data: criticalClients, isLoading: isLoadingCritical } = useQuery({
    queryKey: ["criticalClients", criticalPeriod], // Chave com dependência
    queryFn: () => fetchCriticalClients(criticalPeriod),
    enabled: !!user,
  });

  const { data: renovationsData, isLoading: isRenovationsLoading } = useQuery({
    queryKey: ["renovationsData", activeFilters], // Chave com dependência
    queryFn: () => fetchRenovationsData(activeFilters),
    enabled: !!user,
  });

  const { data: notificacoesMensaisData, isLoading: isNotificacoesLoading } =
    useQuery({
      queryKey: ["notificacoesMensais", selectedMonth],
      queryFn: () => fetchNotificacoesMensais(selectedMonth),
      enabled: !!user,
    });

  const handleSearch = () => {
    setActiveFilters(filters);
  };

  return {
    sumarioData,
    criticalClients: criticalClients || [],
    renovationsData,
    notificacoesMensaisData,
    isDataLoading:
      isSumarioLoading ||
      isLoadingCritical ||
      isRenovationsLoading ||
      isNotificacoesLoading,
    criticalPeriod,
    setCriticalPeriod,
    filters,
    setFilters,
    handleSearch,
    selectedMonth,
    setSelectedMonth,
  };
}
