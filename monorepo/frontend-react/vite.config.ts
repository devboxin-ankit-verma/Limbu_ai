import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function nextAppNotice(): Plugin {
  return {
    name: 'next-app-notice',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        // eslint-disable-next-line no-console
        console.log(
          '\n\x1b[33m⚠  This Vite server is legacy-only. All pages redirect to Next.js:\x1b[0m',
        );
        // eslint-disable-next-line no-console
        console.log('   \x1b[1mhttp://localhost:3000\x1b[0m  ← run: cd apps/web && npm run dev\n');
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), nextAppNotice()],
  server: {
    port: 5173,
    open: false,
    strictPort: false,
  },
});
