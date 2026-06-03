import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    server: {
      deps: {
        inline: [
          '@asamuzakjp/css-color',
          '@csstools/css-calc',
          '@csstools/css-parser-algorithms',
          '@csstools/css-tokenizer',
        ],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
