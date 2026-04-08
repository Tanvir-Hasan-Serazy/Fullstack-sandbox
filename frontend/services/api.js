import { baseURL } from "@/lib/secrets";
import axios from "axios";

const api = axios.create({
  baseURL: baseURL || "http://localhost:5000/api",
  withCredentials: true,
});

export default api;
