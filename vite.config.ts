import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        outDir: 'dist', // Set the output directory for build
      },
      server: {
        port: 4000, // Set the development server port
        hmr: {
          overlay: true, // set to true to view the overlay debug in the browser
        },
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
      },
    };
});
