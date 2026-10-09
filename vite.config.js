import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const kpToken = env.VITE_KP_TOKEN;

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      proxy: {
        '/api/kp': {
          target: 'https://api.kinopoisk.dev',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/kp/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (kpToken) {
                proxyReq.setHeader('X-API-KEY', kpToken);
              }
            });
          },
        },
        '/api/test': {
          target: 'https://api.github.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/test/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
