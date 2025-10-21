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
  const { mutateAsync: enviarMensagens, isLoading: isSending } =
    useMensagemEnviadaMutation();

  const handleSendMessage = async () => {
    if (!clients || clients.length === 0) {
      onFeedback("error", "Não há clientes na lista para notificar.");
      return;
    }

    const clientesParaEnviar = clients.map((item) => ({
      id: item.cliente.id,
      representante: item.cliente.representante,
      contato: item.cliente.telefone,
      nome_empresa: item.cliente.nome,
      registro: item.cliente.cpf_cnpj || "",
      vencimento_certificado: item.data_vencimento,
      diasRestantes: item.dias_restantes_raw,
    }));

    try {
      const data = await enviarMensagens(clientesParaEnviar);

      onFeedback(
        "success",
        `Processo concluído! ${data.enviadosComSucesso} mensagens enviadas com sucesso.`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "Ocorreu um erro ao enviar as mensagens.";
      onFeedback("error", errorMessage);
      console.error("Erro ao enviar mensagens:", error);
    }
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
            <option value="15">15 dias</option>
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
