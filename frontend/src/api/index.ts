import axios from "axios";
import { ChatResponse } from "@/types";

// 환경변수에서 API URL 가져오기
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
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
