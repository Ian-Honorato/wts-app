import React from "react";
import styles from "./NotificacoesCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const NotificacoesCard = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className={styles.widgetContainer}>
        <p>Carregando notificações...</p>
      </div>
    );
  }

  const { totalNotificadosHoje, notificacoesHoje } = data || {
    totalNotificadosHoje: 0,
    notificacoesHoje: [],
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faPaperPlane} className={styles.headerIcon} />
        <h3>Notificações Enviadas Hoje</h3>
      </div>
      <div className={styles.totalCount}>
        <span>{totalNotificadosHoje}</span>
        <p>Clientes notificados</p>
      </div>
      <div className={styles.clientList}>
        {notificacoesHoje.length > 0 ? (
          <ul>
            {notificacoesHoje.map((notificacao) => (
              <li key={notificacao.id}>
                {notificacao.cliente_notificado?.nome ||
                  "Cliente não encontrado"}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noNotifications}>
            Nenhuma notificação enviada hoje.
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificacoesCard;
