import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { resolve } from 'path' // 제거: node path 모듈은 브라우저 빌드에 불필요

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 3000,
    proxy: { "/api": "http://localhost:8787" },
  },
});
