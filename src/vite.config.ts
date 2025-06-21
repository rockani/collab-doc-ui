import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    global: 'window', // ✅ Define `global` for browser
  }
});

