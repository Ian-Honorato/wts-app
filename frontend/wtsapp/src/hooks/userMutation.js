import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "/api/usuarios";

// --- Funções de API ---

const createUser = async (userData) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.post(`${API_URL}/cadastrar`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const fetchUsers = async () => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const updateUser = async (userData) => {
  const token = sessionStorage.getItem("token");
  const { id, ...updateData } = userData;
  const { data } = await axios.put(`${API_URL}/${id}`, updateData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// FUNÇÃO ADICIONADA PARA CONSISTÊNCIA E CORREÇÃO
const deleteUser = async (userId) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.delete(`${API_URL}/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }, // HEADER DE AUTORIZAÇÃO ADICIONADO
  });
  return data;
};

// --- Hooks do React Query ---

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUsersQuery = (isOpen) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: isOpen,
  });
};
