import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./ListClientsModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEye,
  faEdit,
  faTrash,
  faFilter, // NOVO: Ícone de filtro
} from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import {
  useDeleteClientMutation,
  useDownloadMutation,
} from "../../../hooks/useMutation";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { formatarCpfCnpj } from "../../../hooks/util/Mascaras";

// Array com os status para os filtros
const statusValidos = [
  "Todos",
  "Agendado",
  "Em contato",
  "Renovado",
  "Não identificado",
  "Não vai renovar",
  "Cancelado",
  "Ativo",
];

// NOVO: Objeto de filtros padrão
const defaultFilters = {
  status: "Todos",
  startDate: "",
  endDate: "",
};

// ALTERADO: fetchClients agora aceita um objeto de filtros
const fetchClients = async ({ queryKey }) => {
  const [_key, filters] = queryKey;
  const token = sessionStorage.getItem("token");

  // Constrói os parâmetros da URL
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "Todos") {
    params.append("status", filters.status);
  }
  if (filters.startDate) {
    params.append("startDate", filters.startDate);
  }
  if (filters.endDate) {
    params.append("endDate", filters.endDate);
  }

  const queryString = params.toString();
  let url = `/api/clientes${queryString ? `?${queryString}` : ""}`;

  const { data } = await axios.get(url, {
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

  const [isFilterAreaVisible, setIsFilterAreaVisible] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const {
    data: clients = [],
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    // ALTERADO: queryKey agora usa appliedFilters
    queryKey: ["clients", appliedFilters],
    queryFn: fetchClients,
    enabled: isOpen,
  });

  const deleteMutation = useDeleteClientMutation();
  const downloadMutation = useDownloadMutation();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const min_search_length = 3;

  // --- EFEITOS ---
  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
      // NOVO: Reseta os filtros ao fechar o modal
      setFilters(defaultFilters);
      setAppliedFilters(defaultFilters);
      setIsFilterAreaVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim().length < min_search_length) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `/api/clientes/search?searchTerm=${searchTerm}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchResults(response.data);
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
    setTimeout(() => {
      onShowDetails(client.id);
    }, 300);
  };

  const handleActionClick = async (action, clientId) => {
    if (action === "show") {
      setTimeout(() => onShowDetails(clientId), 300);
      return;
    }

    if (action === "update") {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`/api/clientes/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimeout(() => onOpenUpdateModal(response.data), 300);
      } catch (error) {
        console.error("Erro ao buscar cliente para edição:", error);
        onFeedback("error", "Não foi possível carregar dados para edição.");
      }
      return;
    }

    if (action === "delete") {
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

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setClientToDelete(null);
  };
  const handleExport = () => {
    const exportParams = {
      ...appliedFilters,
      periodo_inicial: appliedFilters.startDate,
      periodo_final: appliedFilters.endDate,
      status:
        appliedFilters.status === "Todos" ? undefined : appliedFilters.status,
    };

    downloadMutation.mutate(exportParams, {
      onSuccess: () => {
        onFeedback("success", "O download foi iniciado!");
      },
      onError: () => {
        onFeedback("error", "Não foi possível gerar o arquivo para download.");
      },
    });
  };

  // --- NOVO: Handlers de Filtro ---

  const toggleFilterArea = () => {
    setIsFilterAreaVisible((prev) => !prev);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setIsFilterAreaVisible(false);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const removeStatusFilter = () => {
    const newFilters = { ...appliedFilters, status: "Todos" };
    setAppliedFilters(newFilters);
    setFilters(newFilters); // Sincroniza o form
  };

  const removeDateFilter = () => {
    const newFilters = { ...appliedFilters, startDate: "", endDate: "" };
    setAppliedFilters(newFilters);
    setFilters(newFilters); // Sincroniza o form
  };

  // --- NOVO: Helpers de Renderização de Pílulas ---
  const isStatusFiltered = appliedFilters.status !== "Todos";
  const isDateFiltered = appliedFilters.startDate || appliedFilters.endDate;
  const hasActiveFilters = isStatusFiltered || isDateFiltered;

  // --- RENDERIZAÇÃO ---
  if (!isOpen) return null;

  return (
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

          {/* NOVO: BOTÃO DE TOGGLE DOS FILTROS */}
          <div className={styles.filterToggleContainer}>
            <button
              onClick={toggleFilterArea}
              className={styles.toggleFilterButton}
            >
              <FontAwesomeIcon icon={faFilter} />
              {isFilterAreaVisible ? "Ocultar Filtros" : "Mostrar Filtros"}
              {hasActiveFilters && !isFilterAreaVisible && (
                <span className={styles.filterCount}>!</span>
              )}
            </button>
          </div>

          {/* NOVO: ÁREA DE PÍLULAS DE FILTROS ATIVOS */}
          {hasActiveFilters && (
            <div className={styles.filterPills}>
              {isStatusFiltered && (
                <span className={styles.pill}>
                  {appliedFilters.status}
                  <button onClick={removeStatusFilter}>&times;</button>
                </span>
              )}
              {isDateFiltered && (
                <span className={styles.pill}>
                  {`Venc: ${appliedFilters.startDate || "..."} a ${
                    appliedFilters.endDate || "..."
                  }`}
                  <button onClick={removeDateFilter}>&times;</button>
                </span>
              )}
            </div>
          )}

          {/* NOVO: ÁREA DE FILTROS RETRÁTIL */}
          {isFilterAreaVisible && (
            <div className={styles.filterArea}>
              <div className={styles.filterGroup}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className={styles.filterSelect}
                >
                  {statusValidos.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label htmlFor="startDate">Vencimento de:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label htmlFor="endDate">Vencimento até:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterActions}>
                <button
                  onClick={handleApplyFilters}
                  className={styles.applyButton}
                >
                  Aplicar
                </button>
                <button
                  onClick={handleClearFilters}
                  className={styles.clearButton}
                >
                  Limpar
                </button>
              </div>
            </div>
          )}

          {/* CONTAINER DA TABELA COM SCROLL */}
          <div className={styles.tableContainer}>
            {isLoading ? (
              <p style={{ textAlign: "center", padding: "2rem" }}>
                Carregando...
              </p>
            ) : isError ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "red",
                }}
              >
                Erro ao carregar clientes.
              </p>
            ) : (
              <table
                className={`${styles.clientsTable} ${
                  isFetching ? styles.isFetching : ""
                }`}
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>CPF/CNPJ</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>{client.id}</td>
                      <td>{client.nome}</td>
                      <td className={styles.cpfCnpjCell}>
                        {formatarCpfCnpj(client.cpf_cnpj)}
                      </td>
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

          {/* FOOTER */}
          <div className={styles.footer}>
            <button
              className={styles.exportButton}
              onClick={handleExport}
              disabled={downloadMutation.isLoading}
            >
              {downloadMutation.isLoading
                ? "Exportando..."
                : "Exportar Clientes (XLS)"}
            </button>
          </div>
        </div>
      </div>

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
