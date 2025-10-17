import React from "react";
import styles from "./NotificacoesCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const NotificacoesCard = ({
  data,
  isLoading,
  selectedMonth,
  setSelectedMonth,
}) => {
  // PONTO DE DEBUG 1: Vamos verificar o que estamos recebendo.
  console.log("--- NotificacoesCard RENDERIZOU ---");
  console.log("Está carregando? (isLoading):", isLoading);
  console.log("Mês selecionado (selectedMonth):", selectedMonth);
  console.log("Mês setado (setSelectedMonth):", setSelectedMonth);

  console.log("Dados da API (data):", data);

  // Se 'data' for undefined ou null, criamos um objeto vazio para evitar erros.
  const { totalNotificados, notificacoes } = data || {
    totalNotificados: 0,
    notificacoes: [],
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </div>
        <div className={styles.titleWrapper}>
          {/* Mostra '...' se estiver carregando, senão o total. */}
          <span className={styles.count}>
            {isLoading ? "..." : totalNotificados}
          </span>
          <h3 className={styles.title}>Notificações no Período</h3>
        </div>
      </div>

      {/* Por enquanto, vamos deixar a lista e o filtro de fora */}
      <div style={{ padding: "10px" }}>
        <p>Depuração em andamento...</p>
      </div>
    </div>
  );
};

export default NotificacoesCard;
