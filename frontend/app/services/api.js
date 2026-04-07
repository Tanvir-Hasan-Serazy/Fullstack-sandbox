import { baseURL } from "@/lib/secrets";
import axios from "axios";

const api = axios.create({
  baseURL: baseURL || "http://localhost:5000/api",
  // withCredentials: true,
});

// Request interceptors to add auth token
// api.interceptors.request.use((config) => {
//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
// });
export default api;
