import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Allow large chunks for 3D/map libraries without warning spam
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Only manually split three.js — it's 700 KB, has zero React
        // dependency, and is safe to isolate. Everything else (including
        // all react-* packages) is left to Vite's automatic chunking to
        // avoid forwardRef/createContext initialization-order crashes.
        manualChunks: (id) => {
          if (id.includes("node_modules/three/")) {
            return "vendor-3d";
          }
        },
      },
    },
  },
}));
