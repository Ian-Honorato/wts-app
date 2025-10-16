import React from "react";
import styles from "./AdminDashboard.module.css";

// Componentes
import StatCard from "../windgets/statCard";
import StatusContratosChart from "../charts/statusContratosChart";
import TopParceirosChart from "../charts/topParceirosChart";
import ClientesCriticos from "../clientesCriticos/ClientesCriticos";
import RenovationsCard from "../renovationsCard/renovationsCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// CORREÇÃO: Importa o novo componente da KPI mensal
import NotificacoesMensais from "../notificacoesMensais/NotificacoesMensais";
import {
  faUsers,
  faHourglassHalf,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = ({
  summaryData,
  criticalClientsData,
  renovationsData,
  notificacoesMensaisData,
  isNotificacoesLoading,
  selectedMonth,
  setSelectedMonth,
  filters,
  setFilters,
  handleSearch,
  onShowDetails,
  onFeedback,
}) => {
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

  const { totalClients, upcomingExpirations, contractsByStatus, topPartners } =
    summaryData;

  const renovacoes = {
    total: renovationsData?.totalRenovados || 0,
    list: renovationsData?.renovacoes || [],
  };

  return (
    <div className={styles.dashboardGrid}>
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

      {/* Card de renovados */}
      <RenovationsCard
        value={renovacoes.total}
        renovacoes={renovacoes.list}
        filters={filters}
        setFilters={setFilters}
        handleSearch={handleSearch}
        onClientClick={onShowDetails}
      />

      <NotificacoesMensais
        data={notificacoesMensaisData}
        isLoading={isNotificacoesLoading}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      <div className={styles.widget}>
        <StatusContratosChart data={contractsByStatus} />
      </div>

      <div className={styles.widget}>
        <TopParceirosChart data={topPartners} />
      </div>

      <div className={`${styles.widget} ${styles.fullWidth}`}>
        <ClientesCriticos
          clients={criticalClientsData.clients}
          isLoading={criticalClientsData.isLoading}
          period={criticalClientsData.period}
          setPeriod={criticalClientsData.setPeriod}
          onFeedback={onFeedback}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
