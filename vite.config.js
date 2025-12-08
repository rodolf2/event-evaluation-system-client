import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
const apiUrl = import.meta.env.VITE_BASE_API_URL;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    proxy: {
      "/api": {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      "/thumbnails": {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
