import { defineConfig } from 'vitest/config';
// eslint-disable-next-line
// @ts-ignore
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['**/*.spec.ts?(x)'],
    environment: 'jsdom',
    globals: true,
    //setupFiles: ['./vitest.setup.tsx'],
  },
});
