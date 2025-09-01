import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./listClientsModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEye,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const ListClientsModal = ({
  isOpen,
  onClose,
  onShowDetails,
  onOpenUpdateModal,
  onFeedback,
}) => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Efeito para buscar os clientes iniciais quando o modal abre
  useEffect(() => {
    if (isOpen) {
      const fetchClients = async () => {
        setIsLoading(true);
        try {
          const token = sessionStorage.getItem("token");
          const response = await axios.get("http://localhost:3001/clientes", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setClients(response.data);
        } catch (error) {
          console.error("Erro ao buscar clientes:", error);
        }
        setIsLoading(false);
      };
      fetchClients();
    }
  }, [isOpen]);

  // Efeito com DEBOUNCE para a busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const search = async () => {
        try {
          const token = sessionStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:3001/clientes/search?q=${searchTerm}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSearchResults(response.data);
        } catch (error) {
          console.error("Erro na busca:", error);
        }
      };
      search();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectClient = (client) => {
    setSearchTerm("");
    onClose(); // Fecha o modal de lista
    setTimeout(() => {
      onShowDetails(client.id);
    }, 300);
  };

  const handleActionClick = async (action, clientId) => {
    if (action === "show") {
      onClose();
      setTimeout(() => onShowDetails(clientId), 300);
      return;
    }

    if (action === "update") {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/clientes/${clientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        onClose();
        setTimeout(() => onOpenUpdateModal(response.data), 300);
      } catch (error) {
        console.error("Erro ao buscar cliente para edição:", error);
        onFeedback("error", "Não foi possível carregar dados para edição.");
      }
      return;
    }

    if (action === "delete") {
      if (
        //criar um modal de confirmação futuramente
        window.confirm(
          "Você tem certeza que deseja excluir este cliente? Esta ação é irreversível."
        )
      ) {
        try {
          const token = sessionStorage.getItem("token");
          await axios.delete(`http://localhost:3001/clientes/${clientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Atualiza a lista de clientes no estado, removendo o que foi deletado
          setClients((prevClients) =>
            prevClients.filter((client) => client.id !== clientId)
          );
          onFeedback("success", "Cliente excluído com sucesso!");
        } catch (error) {
          console.error("Erro ao excluir cliente:", error);
          // 4. Chama o modal de feedback de erro
          onFeedback("error", "Não foi possível excluir o cliente.");
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Listar Clientes</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar cliente por nome ou CPF/CNPJ..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchResults.length > 0 && (
            <ul className={styles.searchResults}>
              {searchResults.map((client) => (
                <li key={client.id} onClick={() => handleSelectClient(client)}>
                  {client.nome}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.tableContainer}>
          {isLoading ? (
            <p style={{ textAlign: "center", padding: "2rem" }}>
              Carregando...
            </p>
          ) : (
            <table className={styles.clientsTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>CPF/CNPJ</th>
                  <th>Contato</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td>{client.nome}</td>
                    <td>{client.cpf_cnpj}</td>
                    <td>{client.telefone}</td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => handleActionClick("show", client.id)}
                        className={`${styles.actionButton} ${styles.show}`}
                        title="Ver Detalhes"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() => handleActionClick("update", client.id)}
                        className={`${styles.actionButton} ${styles.update}`}
                        title="Editar Cliente"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleActionClick("delete", client.id)}
                        className={`${styles.actionButton} ${styles.delete}`}
                        title="Remover Cliente"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListClientsModal;
