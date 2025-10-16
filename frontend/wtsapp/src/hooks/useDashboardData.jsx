import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// --- FUNÇÕES DE API ---

const fetchSumarioData = async (token) => {
  const { data } = await axios.get("/api/dashboard/sumario", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const fetchCriticalClients = async (token, period) => {
  const { data } = await axios.post(
    `/api/clientes/contratos`,
    { days: period },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data.Contratos_criticos;
};

const fetchRenovationsData = async (token, filters) => {
  const params = new URLSearchParams();
  if (filters.data_inicio) params.append("data_inicio", filters.data_inicio);
  if (filters.data_fim) params.append("data_fim", filters.data_fim);

  const { data } = await axios.get(
    `/api/dashboard/renovations?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

// NOVO: Função para buscar as notificações mensais (corrigida)
const fetchNotificacoesMensais = async (token, month) => {
  const { data } = await axios.get("/api/dashboard/notificacoes-mes", {
    headers: { Authorization: `Bearer ${token}` }, // Garante que o token seja enviado
    params: { month },
  });
  return data;
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

  // NOVO: State para controlar o mês selecionado
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const { data: sumarioData, isLoading: isSumarioLoading } = useQuery({
    queryKey: ["sumarioData", user?.token],
    queryFn: () => fetchSumarioData(user?.token),
    enabled: !!user,
  });

  const { data: criticalClients, isLoading: isLoadingCritical } = useQuery({
    queryKey: ["criticalClients", criticalPeriod, user?.token],
    queryFn: () => fetchCriticalClients(user?.token, criticalPeriod),
    enabled: !!user,
  });

  const { data: renovationsData, isLoading: isRenovationsLoading } = useQuery({
    queryKey: ["renovationsData", activeFilters, user?.token],
    queryFn: () => fetchRenovationsData(user?.token, activeFilters),
    enabled: !!user,
  });

  // NOVO: Query para buscar os dados da KPI de notificações mensais
  const { data: notificacoesMensaisData, isLoading: isNotificacoesLoading } =
    useQuery({
      queryKey: ["notificacoesMensais", selectedMonth, user?.token],
      queryFn: () => fetchNotificacoesMensais(user?.token, selectedMonth),
      enabled: !!user,
    });

  const handleSearch = () => {
    setActiveFilters(filters);
  };

  return {
    sumarioData,
    criticalClients: criticalClients || [],
    renovationsData,
    notificacoesMensaisData, // Retorna os dados da nova KPI
    isDataLoading:
      isSumarioLoading ||
      isLoadingCritical ||
      isRenovationsLoading ||
      isNotificacoesLoading, // Inclui o loading da nova KPI
    criticalPeriod,
    setCriticalPeriod,
    filters,
    setFilters,
    handleSearch,
    selectedMonth, // Retorna o state do mês
    setSelectedMonth, // Retorna o setter do mês
  };
}
