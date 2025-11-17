#!/usr/bin/env node

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the built CLI entry point
const cliPath = resolve(__dirname, '../dist/cli/index.js');

// Import and run the CLI
import(cliPath).catch((error) => {
  console.error('Failed to start OpenSpecX CLI:', error);
  process.exit(1);
});

