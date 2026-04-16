import axios from "axios";

const api = axios.create({
  baseURL: "/api/d365",
  headers: { "Content-Type": "application/json" },
});

export default api;
