import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '../backend');

const backendCmd = `bash -c "cd '${BACKEND_DIR}' && uv run uvicorn main:app --port 8000"`;
const frontendCmd = process.env.CI
  ? 'VITE_API_URL=http://localhost:8000 npm run dev -- --port 5180'
  : 'bash -c "source ~/.nvm/nvm.sh && VITE_API_URL=http://localhost:8000 npm run dev -- --port 5180"';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/integration.spec.ts',
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5180',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: backendCmd,
      url: 'http://localhost:8000/api/profile',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: frontendCmd,
      url: 'http://localhost:5180',
      reuseExistingServer: false,
    },
  ],
});
