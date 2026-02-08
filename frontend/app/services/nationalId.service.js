import api from "./api";

export const getNationalId = async () => {
  const res = await api.get("/api/id");
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
