import api from "./api";

export const getNationalId = async (params = {}) => {
  const res = await api.get("/api/id", {
    params: params,
  });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/api/id/${id}`);
  return res.data;
};

export const updateUser = async (id, formData) => {
  const res = await api.put(`/api/id/${id}`, formData);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/api/id/${id}`);
  return res.data;
};
