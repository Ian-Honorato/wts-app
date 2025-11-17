// src/components/dashboard/charts/TopParceirosChart.jsx
import React from "react";
import Chart from "react-apexcharts";

const TopParceirosChart = ({ data }) => {
  if (!data || data.length === 0) return <p>Não há dados de parceiros.</p>;

  const options = {
    chart: { type: "bar" },
    xaxis: {
      categories: data.map((item) => item.parceiro_indicador.nome_escritorio),
    },
    plotOptions: { bar: { borderRadius: 4, horizontal: true } }, // Gráfico horizontal
    tooltip: {
      x: {
        formatter: function (val) {
          return val;
        },
      },
      y: {
        title: {
          formatter: function () {
            return "Indicações:";
          },
        },
      },
    },
  };
  const series = [
    {
      name: "Clientes Indicados",
      data: data.map((item) => parseInt(item.referralCount, 10)),
    },
  ];

  return (
    <div>
      <h3
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          maxHeight: "400px",
        }}
      >
        Top 5 Parceiros por Indicação
      </h3>
      <Chart
        options={options}
        series={series}
        type="bar"
        width="100%"
        height="300"
      />
    </div>
  );
};

export default TopParceirosChart;
