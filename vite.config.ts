import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLovableHosted = process.env.NODE_ENV === 'production' || 
    process.env.VITE_LOVABLE_HOSTED === 'true';
  
  return {
    server: {
      host: isLovableHosted ? "0.0.0.0" : "localhost",
      port: 8080,
      strictPort: true,
      allowedHosts: ['6934b053-3c39-4028-8f6f-e993e862faa7.lovableproject.com'],
      hmr: isLovableHosted ? false : {
        protocol: 'wss',
        host: 'localhost',
        clientPort: 8080,
        overlay: false
      }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
