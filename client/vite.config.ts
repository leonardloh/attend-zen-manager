import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: ["189fa936-d191-4647-9779-2ae4f86e3b91-00-13v178exba987.riker.replit.dev"],
  },
});
