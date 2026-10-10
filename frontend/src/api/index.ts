import axios from "axios";
import { ChatResponse } from "@/types";

const api = axios.create({
  baseURL: "/api",
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
