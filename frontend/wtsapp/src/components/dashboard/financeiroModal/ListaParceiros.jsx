import React from "react";
import styles from "./FinanceiroModal.module.css";

const ListaParceiros = ({
  parceiros,
  isLoading,
  mes,
  onMesChange,
  onParceiroSelect,
}) => {
  const mesesAno = [
    { id: 1, nome: "Janeiro" },
    { id: 2, nome: "Fevereiro" },
    { id: 3, nome: "Março" },
    { id: 4, nome: "Abril" },
    { id: 5, nome: "Maio" },
    { id: 6, nome: "Junho" },
    { id: 7, nome: "Julho" },
    { id: 8, nome: "Agosto" },
    { id: 9, nome: "Setembro" },
    { id: 10, nome: "Outubro" },
    { id: 11, nome: "Novembro" },
    { id: 12, nome: "Dezembro" },
  ];

  return (
    <>
      <div className={styles.filtroContainer}>
        <label htmlFor="mes-select">Mês de Referência:</label>
        <select
          id="mes-select"
          value={mes}
          onChange={onMesChange}
          className={styles.select}
        >
          {mesesAno.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.resultadoContainer}>
        {isLoading && <p>Carregando parceiros...</p>}
        {parceiros && (
          <ul>
            {parceiros.length === 0 ? (
              <p>Nenhum parceiro com renovações neste período.</p>
            ) : (
              parceiros.map((parceiro) => (
                <li
                  key={parceiro.id}
                  onClick={() => onParceiroSelect(parceiro)}
                >
                  {parceiro.nome_escritorio}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </>
  );
};

export default ListaParceiros;
