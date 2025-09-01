// src/pages/dashboard/AdminDashboard.jsx
import React from "react";
import styles from "./adminDashboard.module.css";

// Importe os componentes que vão compor o painel
import StatCard from "../windgets/statCard";
import StatusContratosChart from "../charts/statusContratosChart";
import TopParceirosChart from "../charts/topParceirosChart";
import ClientesCriticos from "../clientesCriticos/clientesCriticos";

const AdminDashboard = ({ summaryData }) => {
  // Mostra um estado de carregamento enquanto os dados não chegam do componente pai
  if (!summaryData) {
    return <div>Carregando dados do dashboard...</div>;
  }

  // Extrai os dados para facilitar o uso no JSX
  const { totalClients, upcomingExpirations, contractsByStatus, topPartners } =
    summaryData;

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

      {/* Linha de Gráficos */}
      <div className={styles.widget}>
        <StatusContratosChart data={contractsByStatus} />
      </div>

      <div className={styles.widget}>
        <TopParceirosChart data={topPartners} />
      </div>

      {/* Widget de Clientes Críticos (ocupa a largura total) */}
      <div className={`${styles.widget} ${styles.fullWidth}`}>
        <ClientesCriticos />
      </div>
    </div>
  );
};

export default AdminDashboard;
