import React, { useState, useEffect } from "react";
import styles from "./financeiroModal.module.css";

const DetalhesParceiro = ({ certificadosData, isLoading }) => {
  // Estado para controlar qual lista de clientes (por tipo de certificado) está aberta
  const [certificadoAbertoId, setCertificadoAbertoId] = useState(null);

  // Estados para o formulário de cálculo
  const [valorTotal, setValorTotal] = useState(0);
  const [percentual, setPercentual] = useState(15); // Ex: 15% como padrão
  const [valorComissao, setValorComissao] = useState(0);

  // Efeito para recalcular a comissão sempre que o valor total ou o percentual mudar
  useEffect(() => {
    const comissao =
      parseFloat(valorTotal) * (parseFloat(percentual) / 100) || 0;
    setValorComissao(comissao.toFixed(2));
  }, [valorTotal, percentual]);

  const handleToggleClientes = (certId) => {
    // Se o ID clicado já estiver aberto, fecha (seta para null). Se não, abre.
    setCertificadoAbertoId(certificadoAbertoId === certId ? null : certId);
  };

  if (isLoading)
    return <p className={styles.centeredMessage}>Carregando detalhes...</p>;
  if (!certificadosData)
    return <p className={styles.centeredMessage}>Nenhum dado encontrado.</p>;

  const { resumoCertificados, detalheClientes } = certificadosData;

  return (
    <div className={styles.detalhesGrid}>
      {/* Coluna da Esquerda: Lista de Certificados */}
      <div className={styles.certificadosResumo}>
        <h4>Certificados Renovados</h4>
        <ul>
          {resumoCertificados.map((cert) => {
            const isAberto = certificadoAbertoId === cert.tipo_certificado_id;
            // Filtra os clientes que pertencem a este tipo de certificado
            const clientesDoCertificado = detalheClientes.filter(
              (cliente) => cliente.certificado_nome === cert.nome
            );

            return (
              <li
                key={cert.tipo_certificado_id}
                className={styles.certificadoItem}
              >
                <div
                  className={styles.certificadoHeader}
                  onClick={() => handleToggleClientes(cert.tipo_certificado_id)}
                >
                  <span>{cert.nome}</span>
                  <span className={styles.badge}>{cert.quantidade}</span>
                </div>
                {/* Lógica do Toggle: mostra a lista de clientes se 'isAberto' for true */}
                {isAberto && (
                  <ul className={styles.clientesLista}>
                    {clientesDoCertificado.map((cliente, index) => (
                      <li key={index}>{cliente.cliente_nome}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Coluna da Direita: Formulário de Comissão */}
      <div className={styles.comissaoForm}>
        <h4>Calcular Comissão</h4>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label>Valor Total (R$)</label>
            <input
              type="number"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Percentual (%)</label>
            <input
              type="number"
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
              placeholder="15"
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Valor da Comissão (R$)</label>
            <input type="text" value={valorComissao} readOnly disabled />
          </div>
          <button className={styles.submitButton}>Confirmar Operação</button>
        </form>
      </div>
    </div>
  );
};

export default DetalhesParceiro;
