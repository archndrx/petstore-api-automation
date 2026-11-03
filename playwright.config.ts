import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  workers: 4,
  // Sandbox publik kadang lambat, retry 1x untuk gangguan jaringan.
  retries: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    // Wajib diakhiri "/" karena path request relatif ("pet", bukan "/pet").
    baseURL: process.env.PETSTORE_BASE_URL ?? 'https://petstore.swagger.io/v2/',
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});
