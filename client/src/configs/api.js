import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL || "http://localhost:8081",
    withCredentials: true, // Include cookies for authentication
});

export default api;