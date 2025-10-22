import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import dotenv from "dotenv";
dotenv.config();


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // This makes the server accessible on your local network
    host: "0.0.0.0", 
    port: 5000,
    proxy: {
      // Proxy API requests to your backend
      '/api': {
        target: "https://ai-marketplace-admin-backend.vercel.app",
        // target: "http://localhost:4001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));