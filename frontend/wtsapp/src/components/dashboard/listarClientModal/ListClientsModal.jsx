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
import { useQuery } from "@tanstack/react-query";
import { useDeleteClientMutation } from "../../../hooks/useMutation";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

import {
  formatarCpfCnpj,
  formatarTelefone,
} from "../../../hooks/util/Mascaras";

const fetchClients = async () => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get("/api/clientes", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const ListClientsModal = ({
  isOpen,
  onClose,
  onShowDetails,
  onOpenUpdateModal,
  onFeedback,
}) => {
  // --- HOOKS E ESTADOS ---
  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    enabled: isOpen,
  });

  const deleteMutation = useDeleteClientMutation();

  // Estados para o modal de confirmação
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Estados para a busca
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const min_searchLength = 3;

  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
    }
  }, [isOpen]);
  // --- EFEITOS ---
  useEffect(() => {
    if (searchTerm.trim().length < min_searchLength) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        //console.log("Buscando por:", searchTerm);
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `/api/clientes/search?searchTerm=${searchTerm}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchResults(response.data);
        // console.log("Resultados da busca:", response.data);
      } catch (error) {
        console.error("Erro na busca:", error);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- HANDLERS DE EVENTOS ---
  const handleSelectClient = (client) => {
    setSearchResults([]);
    onClose();
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
        const response = await axios.get(`/api/clientes/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onClose();
        setTimeout(() => onOpenUpdateModal(response.data), 300);
      } catch (error) {
        console.error("Erro ao buscar cliente para edição:", error);
        onFeedback("error", "Não foi possível carregar dados para edição.");
      }
      return;
    }

    if (action === "delete") {
      // -> Encontre o nome do cliente para uma mensagem mais amigável
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        setClientToDelete({ id: client.id, nome: client.nome });
        setIsConfirmModalOpen(true);
      }
    }
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete.id, {
        onSuccess: () => {
          onFeedback("success", "Cliente excluído com sucesso!");
        },
        onError: (error) => {
          console.error("Erro ao excluir cliente:", error);
          onFeedback("error", "Não foi possível excluir o cliente.");
        },
        onSettled: () => {
          setIsConfirmModalOpen(false);
          setClientToDelete(null);
        },
      });
    }
  };

  // handler para o cancelamento, para limpar o estado
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setClientToDelete(null);
  };

  // --- RENDERIZAÇÃO ---
  if (!isOpen) return null;

  return (
    // ->React.Fragment para renderizar múltiplos modais
    <>
      <div className={styles.backdrop} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
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
                  <li
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                  >
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
            ) : isError ? (
              <p style={{ textAlign: "center", padding: "2rem", color: "red" }}>
                Erro ao carregar clientes.
              </p>
            ) : (
              <table className={styles.clientsTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>CPF/CNPJ</th>
                    {/*  <th>Contato</th> */}
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>{client.id}</td>
                      <td>{client.nome}</td>
                      <td>{formatarCpfCnpj(client.cpf_cnpj)}</td>
                      {/* <td>{formatarTelefone(client.telefone)}</td> */}
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
                          disabled={deleteMutation.isLoading}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleActionClick("delete", client.id)}
                          className={`${styles.actionButton} ${styles.delete}`}
                          title="Remover Cliente"
                          disabled={deleteMutation.isLoading}
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

      {/* -> Renderização do modal de confirmação com as props corretas */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Você tem certeza que deseja excluir o cliente "${clientToDelete?.nome}"? Esta ação é irreversível.`}
      />
    </>
  );
};

export default ListClientsModal;
