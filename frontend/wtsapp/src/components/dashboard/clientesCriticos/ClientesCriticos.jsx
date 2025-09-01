import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./clientesCriticos.module.css";

const ClientesCriticos = () => {
  const [clients, setClients] = useState([]);
  const [dias, seDias] = useState("10");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCriticals = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:3001/clientes/contratos",

          { days: dias },

          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setClients(response.data.Contratos_criticos);
      } catch (error) {
        console.error("Erro ao buscar clientes críticos:", error);
      }
      setIsLoading(false);
    };
    fetchCriticals();
  }, [dias]);

  const handleSendMessage = () => {
    // Lógica futura para Z-API
    alert("Funcionalidade de enviar mensagem em massa ainda não implementada.");
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.header}>
        <h3>Clientes Críticos</h3>
        <div className={styles.filters}>
          <label htmlFor="periodo">Período:</label>
          {/* 2. O <select> controla o estado 'period' */}
          <select
            id="periodo"
            value={dias}
            onChange={(e) => seDias(e.target.value)}
            className={styles.select}
          >
            <option value="10">10 dias</option>
            <option value="30">30 dias</option>
            <option value="60">60 dias</option>
            <option value="90">90 dias</option>
          </select>
          <button onClick={handleSendMessage} className={styles.button}>
            Enviar Mensagem
          </button>
        </div>
      </div>

      <div className={styles.cardsList}>
        {isLoading ? (
          <p>Carregando...</p>
        ) : clients.length > 0 ? (
          clients.map((item) => (
            <div key={item.contrato_id} className={styles.clientCard}>
              <div className={styles.cardHeader}>
                <h4>{item.cliente.nome}</h4>
                <span className={styles.daysBadge}>
                  {item.dias_restantes} dias
                </span>
              </div>
              <div className={styles.cardBody}>
                <p>
                  <strong>Representante:</strong>{" "}
                  {item.cliente.representante || "N/A"}
                </p>
                <p>
                  <strong>Vencimento:</strong>{" "}
                  {new Date(item.data_vencimento).toLocaleDateString("pt-BR")}
                </p>
                <p>
                  <strong>Contato:</strong> {item.cliente.telefone}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhum cliente com vencimento neste período.</p>
        )}
      </div>
    </div>
  );
};

export default ClientesCriticos;
