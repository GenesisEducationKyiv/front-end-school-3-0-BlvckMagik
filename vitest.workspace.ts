import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'vitest.config.ts',
  // Component tests now run in jsdom environment via main config
]); 