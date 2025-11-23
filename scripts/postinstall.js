#!/usr/bin/env node
/**
 * Post-install script to set executable permissions on bin/openspecx.js
 * Cross-platform: Only runs chmod on Unix-like systems (Linux, macOS)
 * On Windows, npm/pnpm automatically handles executable files
 */

import { chmod } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const binPath = join(__dirname, '..', 'bin', 'openspecx.js');

// Only run chmod on Unix-like systems (not Windows)
if (process.platform !== 'win32') {
  try {
    await chmod(binPath, 0o755);
    console.log('✅ Set executable permissions on bin/openspecx.js');
  } catch (error) {
    // Ignore errors (file might not exist during development)
    if (error.code !== 'ENOENT') {
      console.warn('⚠️  Warning: Could not set executable permissions:', error.message);
    }
  }
} else {
  // On Windows, npm/pnpm handles this automatically
  // No action needed
}

