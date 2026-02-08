import api from "./api";

export const login = async (data) => {
  const res = await api.post("/api/auth/login", data);
  return res.data;
};

export const signup = async (data) => {
  const res = await api.post("/api/auth/signup", data);
  return res.data;
};

export const getPrifile = async (data) => {
  const res = await api.get("/api/auth/profile", data);
  return res.data;
};
