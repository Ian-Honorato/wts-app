import React from "react";
import styles from "./AdminDashboard.module.css";

// Importe os componentes que vão compor o painel
import StatCard from "../windgets/statCard";
import StatusContratosChart from "../charts/statusContratosChart";
import TopParceirosChart from "../charts/topParceirosChart";
import ClientesCriticos from "../clientesCriticos/ClientesCriticos";
import RenovationsCard from "../renovationsCard/renovationsCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faHourglassHalf,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = ({
  summaryData,
  criticalClientsData,
  renovationsData,
  filters,
  setFilters,
  handleSearch,
  onShowDetails,
}) => {
  // Condições de carregamento e de dados vazios
  if (criticalClientsData.isLoading) {
    return (
      <div className={styles.statusMessage}>
        Carregando dados do dashboard...
      </div>
    );
  }
  if (!summaryData || summaryData.totalClients === 0) {
    return (
      <div className={styles.statusMessage}>
        Nenhum cliente cadastrado no momento.
      </div>
    );
  }
  // registrando alteração
  // Extração de dados das props
  const { totalClients, upcomingExpirations, contractsByStatus, topPartners } =
    summaryData;

  const renovacoes = {
    total: renovationsData?.totalRenovados || 0,
    list: renovationsData?.renovacoes || [],
  };

  return (
    <div className={styles.dashboardGrid}>
      {/* Linha de Cards de KPI */}
      <StatCard title="Total de Clientes" value={totalClients} icon={faUsers} />
      <StatCard
        title="Vencem em 30 dias"
        value={upcomingExpirations["Próximos 30 dias"]}
        icon={faHourglassHalf}
      />
      <StatCard
        title="Vencem em 31-60 dias"
        value={upcomingExpirations["31-60 dias"]}
        icon={faCalendarDays}
      />

      {/* Card de renovados agora é o nosso componente customizado */}
      <RenovationsCard
        value={renovacoes.total}
        renovacoes={renovacoes.list} // Passa a lista de renovações
        filters={filters}
        setFilters={setFilters}
        handleSearch={handleSearch}
        onClientClick={onShowDetails}
      />

      {/* Linha de Gráficos */}
      <div className={styles.widget}>
        <StatusContratosChart data={contractsByStatus} />
      </div>

      <div className={styles.widget}>
        <TopParceirosChart data={topPartners} />
      </div>

      {/* Widget de Clientes Críticos (ocupa a largura total) */}
      <div className={`${styles.widget} ${styles.fullWidth}`}>
        <ClientesCriticos
          clients={criticalClientsData.clients}
          isLoading={criticalClientsData.isLoading}
          period={criticalClientsData.period}
          setPeriod={criticalClientsData.setPeriod}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
