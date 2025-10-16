import React from "react";
import styles from "./NotificacoesCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const mesesDoAno = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const NotificacoesMensais = ({
  data,
  isLoading,
  selectedMonth,
  setSelectedMonth,
}) => {
  // Desestruturação segura dos dados recebidos da API
  const { totalNotificados, notificacoes } = data || {
    totalNotificados: 0,
    notificacoes: [],
  };

  // Função para abrir o WhatsApp Web
  const handleWhatsAppClick = (telefone) => {
    if (!telefone) return;
    const telefoneLimpo = telefone.replace(/\D/g, "");
    window.open(
      `https://wa.me/${telefoneLimpo}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className={styles.widgetContainer}>
      {/* Header com Ícone, Contagem e Título */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </div>
        <div className={styles.titleWrapper}>
          <span className={styles.count}>
            {isLoading ? "..." : totalNotificados}
          </span>
          <h3 className={styles.title}>Notificações no Período</h3>
        </div>
      </div>

      {/* Filtro de Mês */}
      <div className={styles.filterWrapper}>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className={styles.select}
          disabled={isLoading}
          aria-label="Selecionar mês"
        >
          {mesesDoAno.map((mes) => (
            <option key={mes.value} value={mes.value}>
              {mes.label}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Clientes Notificados */}
      <div className={styles.clientList}>
        {isLoading ? (
          <p className={styles.loadingText}>Carregando...</p>
        ) : notificacoes.length > 0 ? (
          notificacoes.map(
            ({ id, cliente_notificado }) =>
              cliente_notificado && (
                <div key={id} className={styles.clientItem}>
                  <div className={styles.clientInfo}>
                    <h4>{cliente_notificado.nome}</h4>
                    <p>{cliente_notificado.cpf_cnpj}</p>
                  </div>
                  <button
                    className={styles.whatsappButton}
                    onClick={() =>
                      handleWhatsAppClick(cliente_notificado.telefone)
                    }
                    title={`Conversar com ${cliente_notificado.nome}`}
                  >
                    <FontAwesomeIcon icon={faWhatsapp} />
                  </button>
                </div>
              )
          )
        ) : (
          <p className={styles.noNotifications}>
            Nenhuma notificação encontrada para este mês.
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificacoesMensais;
