import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { resolve } from 'path' // 제거: node path 모듈은 브라우저 빌드에 불필요

// https://vitejs.dev/config/
export default defineConfig({
  base: "/", // GitHub Pages용 base 경로
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 3000,
    // 프록시 제거 - 환경변수를 통해 직접 API URL 사용
  },
});
