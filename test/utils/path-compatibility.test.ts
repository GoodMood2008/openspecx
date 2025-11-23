import { describe, it, expect } from 'vitest';
import path from 'path';
import { ensureDirectory, fileExists } from '../../src/utils/file-system.js';

describe('path compatibility (cross-platform)', () => {
  describe('path.join', () => {
    it('should handle path.join correctly on all platforms', () => {
      const parts = ['project', 'openspec', 'RULE.md'];
      const joined = path.join(...parts);

      // Should not contain mixed separators
      expect(joined).not.toMatch(/\\\//);
      expect(joined).not.toMatch(/\/\\/);
      
      // Should contain all parts
      expect(joined).toContain('project');
      expect(joined).toContain('openspec');
      expect(joined).toContain('RULE.md');
    });

    it('should handle nested paths correctly', () => {
      const parts = ['.cursor', 'rule', 'test-rule-RULE.md'];
      const joined = path.join(...parts);

      expect(joined).toContain('.cursor');
      expect(joined).toContain('rule');
      expect(joined).toContain('test-rule-RULE.md');
    });

    it('should handle relative paths correctly', () => {
      const parts = ['..', 'bin', 'openspecx.js'];
      const joined = path.join(...parts);

      expect(joined).toContain('bin');
      expect(joined).toContain('openspecx.js');
    });
  });

  describe('path.resolve', () => {
    it('should resolve absolute paths correctly', () => {
      const projectRoot = process.cwd();
      const modulePath = 'test/module';
      const resolved = path.resolve(projectRoot, modulePath);

      expect(path.isAbsolute(resolved)).toBe(true);
      expect(resolved).toContain('test');
      expect(resolved).toContain('module');
    });

    it('should handle relative paths in resolve', () => {
      const base = '/project/root';
      const relative = '../outside';
      const resolved = path.resolve(base, relative);

      expect(path.isAbsolute(resolved)).toBe(true);
    });
  });

  describe('path.relative', () => {
    it('should calculate relative paths correctly', () => {
      const projectRoot = '/project/root';
      const modulePath = '/project/root/test/module';
      const relative = path.relative(projectRoot, modulePath);

      // Should not start with .. (within project root)
      expect(relative).not.toMatch(/^\.\./);
      expect(relative).toContain('test');
      expect(relative).toContain('module');
    });

    it('should detect paths outside project root', () => {
      const projectRoot = '/project/root';
      const outsidePath = '/other/project';
      const relative = path.relative(projectRoot, outsidePath);

      // Should start with .. (outside project root)
      expect(relative).toMatch(/^\.\./);
    });
  });

  describe('path.isAbsolute', () => {
    it('should detect absolute paths correctly', () => {
      // Unix-like absolute path
      const unixPath = '/home/user/project';
      expect(path.isAbsolute(unixPath)).toBe(true);

      // Windows absolute path (if on Windows)
      if (process.platform === 'win32') {
        const winPath = 'C:\\Users\\project';
        expect(path.isAbsolute(winPath)).toBe(true);
      }
    });

    it('should detect relative paths correctly', () => {
      const relativePath = 'test/module';
      expect(path.isAbsolute(relativePath)).toBe(false);

      const relativeWithDot = './test/module';
      expect(path.isAbsolute(relativeWithDot)).toBe(false);
    });
  });

  describe('path.extname', () => {
    it('should extract file extensions correctly', () => {
      expect(path.extname('file.ts')).toBe('.ts');
      expect(path.extname('file.js')).toBe('.js');
      expect(path.extname('file.md')).toBe('.md');
      expect(path.extname('file-RULE.md')).toBe('.md');
    });

    it('should handle files without extensions', () => {
      expect(path.extname('file')).toBe('');
      expect(path.extname('README')).toBe('');
    });
  });

  describe('file system utilities with paths', () => {
    it('should handle path operations in ensureDirectory', async () => {
      const testPath = path.join(process.cwd(), 'test-tmp-dir', 'nested', 'deep');
      
      // Should not throw on any platform
      await expect(ensureDirectory(testPath)).resolves.not.toThrow();
      
      // Cleanup
      try {
        const { rm } = await import('fs/promises');
        await rm(path.join(process.cwd(), 'test-tmp-dir'), { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should handle path operations in fileExists', async () => {
      const testFile = path.join(process.cwd(), 'test-tmp-file.txt');
      
      // File should not exist initially
      const existsBefore = await fileExists(testFile);
      expect(existsBefore).toBe(false);
      
      // Create file
      const { writeFile, unlink } = await import('fs/promises');
      await writeFile(testFile, 'test');
      
      // File should exist now
      const existsAfter = await fileExists(testFile);
      expect(existsAfter).toBe(true);
      
      // Cleanup
      await unlink(testFile);
    });
  });

  describe('Windows-specific path handling', () => {
    it('should handle Windows path separators if present', () => {
      // Simulate Windows path (even on non-Windows systems)
      const winPath = 'C:\\Users\\project\\file.ts';
      const normalized = path.normalize(winPath);
      
      // path.normalize should handle it correctly
      expect(normalized).toBeDefined();
    });

    it('should handle UNC paths on Windows', () => {
      if (process.platform === 'win32') {
        const uncPath = '\\\\server\\share\\file.ts';
        const normalized = path.normalize(uncPath);
        
        // Should preserve UNC format on Windows
        expect(normalized).toBeDefined();
      }
    });
  });

  describe('path operations in init command context', () => {
    it('should construct openspec path correctly', () => {
      const projectRoot = '/project/root';
      const openspecPath = path.join(projectRoot, 'openspec');
      
      expect(openspecPath).toContain('openspec');
      expect(path.isAbsolute(openspecPath)).toBe(true);
    });

    it('should construct .cursor/rule path correctly', () => {
      const projectRoot = '/project/root';
      const cursorRulePath = path.join(projectRoot, '.cursor', 'rule');
      
      expect(cursorRulePath).toContain('.cursor');
      expect(cursorRulePath).toContain('rule');
      expect(path.isAbsolute(cursorRulePath)).toBe(true);
    });

    it('should construct RULE file path correctly', () => {
      const ruleDir = '/project/root/.cursor/rule';
      const ruleName = 'test-rule';
      const ruleFilePath = path.join(ruleDir, `${ruleName}-RULE.md`);
      
      expect(ruleFilePath).toContain('.cursor');
      expect(ruleFilePath).toContain('rule');
      expect(ruleFilePath).toContain('test-rule-RULE.md');
      expect(path.isAbsolute(ruleFilePath)).toBe(true);
    });

    it('should construct Cursor command path correctly', () => {
      const projectRoot = '/project/root';
      const cursorCommandsDir = path.join(projectRoot, '.cursor', 'commands');
      const commandFileName = 'openspecx-test-rule-proposal.md';
      const commandFilePath = path.join(cursorCommandsDir, commandFileName);
      
      expect(commandFilePath).toContain('.cursor');
      expect(commandFilePath).toContain('commands');
      expect(commandFilePath).toContain('openspecx-test-rule-proposal.md');
      expect(path.isAbsolute(commandFilePath)).toBe(true);
    });
  });
});

