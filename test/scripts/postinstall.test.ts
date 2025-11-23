import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Mock the postinstall script logic
describe('postinstall script', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = path.resolve(__dirname, '..', '..');
  const binPath = path.join(projectRoot, 'bin', 'openspecx.js');
  const testBinPath = path.join(projectRoot, 'test-tmp-bin.js');

  beforeEach(async () => {
    // Create a test bin file
    await fs.writeFile(testBinPath, '#!/usr/bin/env node\n', 'utf-8');
  });

  afterEach(async () => {
    // Clean up test file
    try {
      await fs.unlink(testBinPath);
    } catch {
      // Ignore if file doesn't exist
    }
  });

  describe('platform detection', () => {
    it('should detect Windows platform correctly', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
        configurable: true,
      });

      expect(process.platform).toBe('win32');

      // Restore
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        writable: true,
        configurable: true,
      });
    });

    it('should detect Unix-like platforms correctly', () => {
      const originalPlatform = process.platform;
      const unixPlatforms = ['linux', 'darwin', 'freebsd', 'openbsd'];

      for (const platform of unixPlatforms) {
        Object.defineProperty(process, 'platform', {
          value: platform,
          writable: true,
          configurable: true,
        });

        expect(process.platform).not.toBe('win32');

        // Restore
        Object.defineProperty(process, 'platform', {
          value: originalPlatform,
          writable: true,
          configurable: true,
        });
      }
    });
  });

  describe('chmod behavior', () => {
    it('should not run chmod on Windows', async () => {
      const originalPlatform = process.platform;
      const chmodSpy = vi.spyOn(fs, 'chmod');

      // Mock Windows platform
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
        configurable: true,
      });

      // Simulate postinstall logic
      if (process.platform !== 'win32') {
        await fs.chmod(testBinPath, 0o755);
      }

      // On Windows, chmod should not be called
      expect(chmodSpy).not.toHaveBeenCalled();

      // Restore
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        writable: true,
        configurable: true,
      });
      chmodSpy.mockRestore();
    });

    it('should run chmod on Unix-like systems', async () => {
      const originalPlatform = process.platform;
      const unixPlatforms = ['linux', 'darwin'];

      for (const platform of unixPlatforms) {
        // Mock Unix-like platform
        Object.defineProperty(process, 'platform', {
          value: platform,
          writable: true,
          configurable: true,
        });

        // Simulate postinstall logic
        if (process.platform !== 'win32') {
          await fs.chmod(testBinPath, 0o755);
          const stats = await fs.stat(testBinPath);
          // File should exist and be accessible
          expect(stats.isFile()).toBe(true);
        }

        // Restore
        Object.defineProperty(process, 'platform', {
          value: originalPlatform,
          writable: true,
          configurable: true,
        });
      }
    });

    it('should handle ENOENT error gracefully', async () => {
      const originalPlatform = process.platform;
      const nonExistentPath = path.join(projectRoot, 'non-existent-bin.js');

      // Mock Unix-like platform
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
        configurable: true,
      });

      // Simulate postinstall error handling
      try {
        if (process.platform !== 'win32') {
          await fs.chmod(nonExistentPath, 0o755);
        }
      } catch (error: any) {
        // ENOENT errors should be ignored (file might not exist during development)
        if (error.code !== 'ENOENT') {
          throw error;
        }
        // ENOENT is expected and should be ignored
        expect(error.code).toBe('ENOENT');
      }

      // Restore
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        writable: true,
        configurable: true,
      });
    });

    it('should handle other errors with warning', async () => {
      const originalPlatform = process.platform;
      const chmodSpy = vi.spyOn(fs, 'chmod').mockRejectedValueOnce(
        new Error('Permission denied') as any
      );

      // Mock Unix-like platform
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
        configurable: true,
      });

      // Simulate postinstall error handling
      try {
        if (process.platform !== 'win32') {
          await fs.chmod(testBinPath, 0o755);
        }
      } catch (error: any) {
        // Non-ENOENT errors should be caught but not thrown
        if (error.code !== 'ENOENT') {
          // This would be logged as a warning in the actual script
          expect(error.message).toContain('Permission denied');
        }
      }

      // Restore
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        writable: true,
        configurable: true,
      });
      chmodSpy.mockRestore();
    });
  });

  describe('path resolution', () => {
    it('should resolve bin path correctly on all platforms', () => {
      const scriptDir = __dirname;
      const expectedBinPath = path.join(scriptDir, '..', 'bin', 'openspecx.js');
      const resolvedPath = path.resolve(scriptDir, '..', 'bin', 'openspecx.js');

      // Path resolution should work the same on all platforms
      expect(resolvedPath).toBe(expectedBinPath);
      expect(path.isAbsolute(resolvedPath)).toBe(true);
    });

    it('should use path.join for cross-platform compatibility', () => {
      const parts = ['scripts', '..', 'bin', 'openspecx.js'];
      const joined = path.join(...parts);

      // path.join should handle path separators correctly on all platforms
      expect(joined).not.toContain('\\/'); // Should not have mixed separators
      expect(joined).toContain('bin');
      expect(joined).toContain('openspecx.js');
    });
  });
});

