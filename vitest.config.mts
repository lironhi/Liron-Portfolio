import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('./', import.meta.url));

export default defineConfig({
  resolve: {
    // Same "@/..." alias as tsconfig.json.
    alias: [{ find: /^@\//, replacement: root }],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
