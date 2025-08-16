import axios from "axios";
import { ChatResponse } from "@/types";

// Vite 프록시를 사용하므로 상대 경로 사용
const api = axios.create({
  baseURL: "/api", // Vite 프록시를 통해 백엔드로 요청
  timeout: 10000,
});

export const chatApi = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>("/chat", { message });
    return response.data;
  },

  search: async (query: string) => {
    const response = await api.get("/search", { params: { q: query } });
    return response.data;
  },
};

export default api;
