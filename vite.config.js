import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), svgr()],
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    proxy: {
      "/api": {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      "/thumbnails": {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
}));
