import React, { useState, useEffect } from "react";
import styles from "./financeiroModal.module.css";

const DetalhesParceiro = ({ certificadosData, isLoading }) => {
  // --- ESTADOS ---
  const [certificadoAbertoId, setCertificadoAbertoId] = useState(null);

  // Estado para controlar o item selecionado no <select>
  const [certificadoSelecionadoId, setCertificadoSelecionadoId] = useState("");

  // Estados para os inputs do formulário
  const [quantidade, setQuantidade] = useState(0);
  const [valorUnitario, setValorUnitario] = useState(0);
  const [percentual, setPercentual] = useState(0);

  // Estados para os valores calculados
  const [comissaoUnitaria, setComissaoUnitaria] = useState("0.00");
  const [comissaoTotal, setComissaoTotal] = useState("0.00");

  // --- EFEITOS ---

  // EFEITO 1: Popula o formulário quando um certificado é selecionado
  useEffect(() => {
    if (certificadoSelecionadoId && certificadosData?.resumoCertificados) {
      const certSelecionado = certificadosData.resumoCertificados.find(
        (c) => c.tipo_certificado_id.toString() === certificadoSelecionadoId
      );

      if (certSelecionado) {
        // Assume-se que a API retorna 'valor_unitario' e 'percentual_comissao'
        // Se os nomes forem diferentes, ajuste aqui.
        setQuantidade(certSelecionado.quantidade || 0);
        setValorUnitario(certSelecionado.valor_unitario || 0);
        setPercentual(certSelecionado.percentual_comissao || 0);
      }
    } else {
      // Reseta o formulário se nada for selecionado
      setQuantidade(0);
      setValorUnitario(0);
      setPercentual(0);
    }
  }, [certificadoSelecionadoId, certificadosData]);

  // EFEITO 2: Recalcula tudo de forma reativa quando qualquer input de valor muda
  useEffect(() => {
    const vUnitario = parseFloat(valorUnitario) || 0;
    const perc = parseFloat(percentual) || 0;
    const qtd = parseInt(quantidade, 10) || 0;

    // Calcula comissão para uma unidade
    const comissaoUn = vUnitario * (perc / 100);
    setComissaoUnitaria(comissaoUn.toFixed(2));

    // Calcula comissão total (unidade * quantidade)
    const comissaoTot = comissaoUn * qtd;
    setComissaoTotal(comissaoTot.toFixed(2));
  }, [quantidade, valorUnitario, percentual]); // Roda sempre que um desses valores mudar

  // --- FUNÇÕES DE CONTROLE ---

  const handleToggleClientes = (certId) => {
    setCertificadoAbertoId(certificadoAbertoId === certId ? null : certId);
  };

  // --- RENDERIZAÇÃO ---

  if (isLoading)
    return <p className={styles.centeredMessage}>Carregando detalhes...</p>;
  if (!certificadosData)
    return <p className={styles.centeredMessage}>Nenhum dado encontrado.</p>;

  const { resumoCertificados, detalheClientes } = certificadosData;

  return (
    <div className={styles.detalhesGrid}>
      {/* Coluna da Esquerda: Lista de Certificados (sem alteração) */}
      <div className={styles.certificadosResumo}>
        <h4>Certificados Renovados</h4>
        <ul>
          {resumoCertificados.map((cert) => (
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
              {certificadoAbertoId === cert.tipo_certificado_id && (
                <ul className={styles.clientesLista}>
                  {detalheClientes
                    .filter((cliente) => cliente.certificado_nome === cert.nome)
                    .map((cliente, index) => (
                      <li key={index}>{cliente.cliente_nome}</li>
                    ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Coluna da Direita: Formulário de Comissão (MODIFICADO) */}
      <div className={styles.comissaoForm}>
        <h4>Calcular Comissão</h4>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label>Tipo certificado:</label>
            <select
              value={certificadoSelecionadoId}
              onChange={(e) => setCertificadoSelecionadoId(e.target.value)}
              className={styles.select}
            >
              <option value="">Selecione um tipo...</option>
              {resumoCertificados.map((cert) => (
                <option
                  key={cert.tipo_certificado_id}
                  value={cert.tipo_certificado_id}
                >
                  {cert.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Quantidade</label>
            <input type="number" value={quantidade} readOnly disabled />
          </div>

          <div className={styles.inputGroup}>
            <label>Valor Unitário (R$)</label>
            <input
              type="number"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Percentual (%)</label>
            <input
              type="number"
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* NOVO LAYOUT PARA OS TOTAIS */}
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Comissão Unitária (R$)</label>
              <input type="text" value={comissaoUnitaria} readOnly disabled />
            </div>
            <div className={styles.inputGroup}>
              <label>Comissão Total (R$)</label>
              <input type="text" value={comissaoTotal} readOnly disabled />
            </div>
          </div>

          <button className={styles.submitButton}>Confirmar Operação</button>
        </form>
      </div>
    </div>
  );
};

export default DetalhesParceiro;
