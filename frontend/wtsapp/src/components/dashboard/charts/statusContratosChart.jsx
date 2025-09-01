// src/components/dashboard/charts/StatusContratosChart.jsx
import React from "react";
import Chart from "react-apexcharts";

const StatusContratosChart = ({ data }) => {
  if (!data || data.length === 0) return <p>Não há dados de status.</p>;

  const options = {
    labels: data.map((item) => item.status),
    legend: { position: "bottom" },
    // Adicionando cores personalizadas
    colors: ["#FFA500", "#3498db", "#2ecc71", "#e74c3c", "#95a5a6"],
  };
  const series = data.map((item) => parseInt(item.count, 10));

  return (
    <div>
      <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Contratos por Status
      </h3>
      <Chart options={options} series={series} type="donut" width="100%" />
    </div>
  );
};

export default StatusContratosChart;
