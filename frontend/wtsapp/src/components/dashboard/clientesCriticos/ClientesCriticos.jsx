// frontend/src/components/dashboard/clientesCriticos/ClientesCriticos.jsx

import React from "react";
import styles from "./ClientesCriticos.module.css";
import { useMensagemEnviadaMutation } from "../../../hooks/useMensagemMutation";

const ClientesCriticos = ({
  clients,
  isLoading,
  period,
  setPeriod,
  onFeedback,
}) => {
  // Instancia o hook de mutação, passando a função de feedback
  const { mutate: enviarMensagens, isLoading: isSending } =
    useMensagemEnviadaMutation({
      onFeedback,
    });

  const handleSendMessage = () => {
    if (!clients || clients.length === 0) {
      onFeedback("error", "Não há clientes na lista para notificar.");
      return;
    }

    const clientesParaEnviar = clients.map((item) => ({
      // Dados que o backend precisa, extraídos da estrutura aninhada
      id: item.cliente.id,
      representante: item.cliente.representante,
      contato: item.cliente.telefone,
      nome_empresa: item.cliente.nome,
      registro: item.cliente.cpf_cnpj || "",
      vencimento_certificado: item.data_vencimento,
      diasRestantes:
        typeof item.dias_restantes === "number" ? item.dias_restantes : 0,
    }));

    // Envia o array já formatado para o backend
    enviarMensagens(clientesParaEnviar);
  };
  //formatar badge
  const formatDaysText = (days) => {
    if (typeof days === "number") {
      return `${days} ${days === 1 ? "dia" : "dias"}`;
    }
    return days;
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.header}>
        <h3>Clientes Críticos</h3>
        <div className={styles.filters}>
          <label htmlFor="periodo">Período:</label>
          <select
            id="periodo"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={styles.select}
            disabled={isLoading || isSending}
          >
            <option value="10">10 dias</option>
            <option value="30">30 dias</option>
            <option value="60">60 dias</option>
            <option value="90">90 dias</option>
          </select>
          <button
            onClick={handleSendMessage}
            className={styles.button}
            disabled={isLoading || isSending || clients.length === 0}
          >
            {isSending ? "Enviando..." : "Enviar Mensagem"}
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
                  {/* Usa a função para formatar o texto do badge corretamente */}
                  {formatDaysText(item.dias_restantes)}
                </span>
              </div>
              <div className={styles.cardBody}>
                <p>
                  <strong>Representante:</strong>{" "}
                  {item.cliente.representante || "N/A"}
                </p>
                <p>
                  <strong>Vencimento:</strong>{" "}
                  {new Date(item.data_vencimento).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}
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
