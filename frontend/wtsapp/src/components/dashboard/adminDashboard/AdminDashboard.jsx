// src/pages/dashboard/AdminDashboard.jsx
import React from "react";
import styles from "./adminDashboard.module.css";

// Importe os componentes que vão compor o painel
import StatCard from "../windgets/statCard";
import StatusContratosChart from "../charts/statusContratosChart";
import TopParceirosChart from "../charts/topParceirosChart";
import ClientesCriticos from "../clientesCriticos/ClientesCriticos";

const AdminDashboard = ({
  summaryData,
  criticalClientsData,
  renovationsData,
}) => {
  console.log(renovationsData);
  if (criticalClientsData.isLoading) {
    return (
      <div className={styles.statusMessage}>
        Carregando dados do dashboard...
      </div>
    );
  }
  if (!summaryData || summaryData.totalClients === 0) {
    // Se nenhuma informaç
    return (
      <div className={styles.statusMessage}>
        Nenhum cliente cadastrado no momento.
      </div>
    );
  }

  const { totalClients, upcomingExpirations, contractsByStatus, topPartners } =
    summaryData;
  const totalRenovados = renovationsData?.totalRenovados || 0;

  return (
    <div className={styles.dashboardGrid}>
      {/* Linha de Cards de KPI */}
      <StatCard title="Total de Clientes" value={totalClients} icon="👥" />
      <StatCard
        title="Vencem em 30 dias"
        value={upcomingExpirations["Próximos 30 dias"]}
        icon="⏳"
      />
      <StatCard
        title="Vencem em 31-60 dias"
        value={upcomingExpirations["31-60 dias"]}
        icon="🗓️"
      />
      <StatCard title="Renovados no Período" value={totalRenovados} icon="🔄" />

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
