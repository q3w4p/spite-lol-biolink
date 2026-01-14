import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    strictPort: false,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      ".manus.computer",
      ".us1.manus.computer",
      "85ee8674-97e1-4513-a040-0c33a93e3c77-00-1q4up9e89fww1.worf.replit.dev",
    ],
    // Proxy API requests to the backend server
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
    host: "0.0.0.0",
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
