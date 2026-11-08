import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Site multipágina: página principal, política de privacidade, 404 e painel administrativo.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        privacidade: resolve(import.meta.dirname, "privacidade.html"),
        notFound: resolve(import.meta.dirname, "404.html"),
        admin: resolve(import.meta.dirname, "admin.html"),
      },
    },
  },
  server: {
    // Em desenvolvimento, as chamadas /api vão para o servidor Express (npm run server)
    proxy: { "/api": "http://localhost:3000" },
  },
});
