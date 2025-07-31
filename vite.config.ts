import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Detect if running in hosted environment
  const isHosted = process.env.NODE_ENV === 'production' || 
    process.env.VITE_LOVABLE_HOSTED === 'true' ||
    process.env.HOSTNAME?.includes('lovableproject.com') ||
    process.env.VERCEL === '1';
  
  return {
    // Optimize dependency pre-bundling to fix 504 timeout issues
    optimizeDeps: {
      include: [
        'framer-motion',
        '@radix-ui/react-icons',
        '@tiptap/react',
        '@tiptap/core',
        '@tiptap/starter-kit',
        '@tiptap/extension-mention',
        '@tiptap/extension-placeholder',
        'use-debounce'
      ],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    server: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: true,
      allowedHosts: ['6934b053-3c39-4028-8f6f-e993e862faa7.lovableproject.com'],
      hmr: {
        timeout: 60000,
        overlay: false
      },
      // Increase timeouts to prevent 504 errors
      timeout: 120000
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
