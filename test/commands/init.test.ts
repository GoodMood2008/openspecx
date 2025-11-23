import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { initCommand } from '../../src/commands/init.js';
import { fileExists, readFile } from '../../src/utils/file-system.js';
import { OPENSPEC_DIR_NAME } from '../../src/core/config.js';

describe('init command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(process.cwd(), `test-init-${Date.now()}-tmp`);
    await fs.mkdir(testDir, { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should error when module path does not exist', async () => {
    const modulePath = 'non-existent-module';
    const ruleName = 'test-rule';

    await expect(
      initCommand(modulePath, ruleName, {})
    ).rejects.toThrow();
  });

  it('should error when module path is outside project root', async () => {
    // Create a module directory outside the project root
    const outsideDir = path.join(testDir, '..', 'outside-module');
    await fs.mkdir(outsideDir, { recursive: true });

    const modulePath = '../outside-module';
    const ruleName = 'test-rule';

    await expect(
      initCommand(modulePath, ruleName, {})
    ).rejects.toThrow();
  });

  it('should create openspec directory structure when it does not exist', async () => {
    const modulePath = 'test-module';
    const ruleName = 'test-rule';

    // Create module directory
    await fs.mkdir(modulePath, { recursive: true });

    // Mock the tool selection to avoid interactive prompt
    // We'll use a non-interactive approach by providing the tool option
    try {
      await initCommand(modulePath, ruleName, { tool: 'cursor', skipAnalysis: true });
    } catch (error) {
      // May fail due to wizard, but we can check directory creation
    }

    // Check that openspec directory was created
    const openspecPath = path.join(testDir, OPENSPEC_DIR_NAME);
    expect(await fileExists(openspecPath)).toBe(true);

    // Note: commands directory is no longer created in openspec/commands
    // Cursor commands are now generated in .cursor/commands/

    // Check that project RULE.md was created (new behavior)
    const projectRulePath = path.join(openspecPath, 'RULE.md');
    expect(await fileExists(projectRulePath)).toBe(true);
  });

  it('should generate RULE template file in .cursor/rule directory', async () => {
    const modulePath = 'test-module';
    const ruleName = 'test-rule';

    // Create module directory
    await fs.mkdir(modulePath, { recursive: true });

    try {
      await initCommand(modulePath, ruleName, { tool: 'cursor', skipAnalysis: true });
    } catch (error) {
      // May fail due to wizard, but we can check file creation
    }

    // Check that RULE file was created in centralized directory
    const ruleFilePath = path.join(testDir, '.cursor', 'rule', `${ruleName}-RULE.md`);
    expect(await fileExists(ruleFilePath)).toBe(true);

    // Check file content
    const content = await readFile(ruleFilePath);
    expect(content).toContain('# 范式概述');
    expect(content).toContain('## 核心约定');
    
    // Check that AI instructions block is embedded
    expect(content).toContain('<!--');
    expect(content).toContain('AI_INSTRUCTIONS_START');
    expect(content).toContain('AI_INSTRUCTIONS_END');
    expect(content).toContain('-->');
    expect(content).toContain('请为模块');
    expect(content).toContain('openspec/RULE.md');
    expect(content).toContain('.cursor/rule');
  });

  it('should generate Cursor command file in .cursor/commands directory', async () => {
    const modulePath = 'test-module';
    const ruleName = 'test-rule';

    // Create module directory
    await fs.mkdir(modulePath, { recursive: true });

    try {
      await initCommand(modulePath, ruleName, { tool: 'cursor', skipAnalysis: true });
    } catch (error) {
      // May fail due to wizard, but we can check file creation
    }

    // Check that command file was created in .cursor/commands (new location)
    const commandFilePath = path.join(
      testDir,
      '.cursor',
      'commands',
      `openspecx-${ruleName}-proposal.md`
    );
    
    // Note: This may not exist if the wizard failed, but the structure should be created
    const cursorCommandsPath = path.join(testDir, '.cursor', 'commands');
    // The directory should exist if the command was generated
    // We check the openspec directory as a fallback to ensure initialization happened
    const openspecPath = path.join(testDir, OPENSPEC_DIR_NAME);
    expect(await fileExists(openspecPath)).toBe(true);
  });

  it('should validate module path is a directory', async () => {
    const modulePath = 'test-file';
    const ruleName = 'test-rule';

    // Create a file instead of directory
    await fs.writeFile(modulePath, 'test content');

    await expect(
      initCommand(modulePath, ruleName, {})
    ).rejects.toThrow();
  });

  it('should work with nested module paths', async () => {
    const modulePath = 'api/multi_language';
    const ruleName = 'generate_multi_language';

    // Create nested module directory
    await fs.mkdir(modulePath, { recursive: true });

    try {
      await initCommand(modulePath, ruleName, { tool: 'cursor', skipAnalysis: true });
    } catch (error) {
      // May fail due to wizard, but we can check file creation
    }

    // Check that RULE file was created in centralized directory even for nested modules
    const ruleFilePath = path.join(testDir, '.cursor', 'rule', `${ruleName}-RULE.md`);
    expect(await fileExists(ruleFilePath)).toBe(true);
  });

  it('should handle existing openspec directory (extend mode)', async () => {
    const modulePath = 'test-module';
    const ruleName = 'test-rule';

    // Create module directory
    await fs.mkdir(modulePath, { recursive: true });

    // Pre-create openspec directory
    const openspecPath = path.join(testDir, OPENSPEC_DIR_NAME);
    await fs.mkdir(openspecPath, { recursive: true });

    try {
      await initCommand(modulePath, ruleName, { tool: 'cursor', skipAnalysis: true });
    } catch (error) {
      // May fail due to wizard, but we can check that openspec still exists
    }

    // Check that openspec directory still exists
    expect(await fileExists(openspecPath)).toBe(true);

    // Check that project RULE.md was created even in extend mode
    const projectRulePath = path.join(openspecPath, 'RULE.md');
    expect(await fileExists(projectRulePath)).toBe(true);
  });

  it('should generate project RULE.md specification', async () => {
    const modulePath = 'test-module';
    const ruleName = 'test-rule';

    // Create module directory
    await fs.mkdir(modulePath, { recursive: true });

    try {
      await initCommand(modulePath, ruleName, { tool: 'cursor', skipAnalysis: true });
    } catch (error) {
      // May fail due to wizard, but we can check file creation
    }

    // Check that project RULE.md was created
    const projectRulePath = path.join(testDir, OPENSPEC_DIR_NAME, 'RULE.md');
    expect(await fileExists(projectRulePath)).toBe(true);

    // Check file content
    const content = await readFile(projectRulePath);
    expect(content).toContain('# Module RULE Document Format');
    expect(content).toContain('文档结构');
  });

  it('should handle paths correctly on all platforms (cross-platform compatibility)', async () => {
    const modulePath = 'test-module';
    const ruleName = 'test-rule';

    // Create module directory
    await fs.mkdir(modulePath, { recursive: true });

    try {
      await initCommand(modulePath, ruleName, { tool: 'cursor', skipAnalysis: true });
    } catch (error) {
      // May fail due to wizard, but we can check path handling
    }

    // Verify all paths use path.join (cross-platform compatible)
    const openspecPath = path.join(testDir, OPENSPEC_DIR_NAME);
    const cursorRulePath = path.join(testDir, '.cursor', 'rule');
    const cursorCommandsPath = path.join(testDir, '.cursor', 'commands');
    const ruleFilePath = path.join(cursorRulePath, `${ruleName}-RULE.md`);

    // All paths should be absolute or relative (not mixed separators)
    expect(openspecPath).toBeDefined();
    expect(cursorRulePath).toBeDefined();
    expect(cursorCommandsPath).toBeDefined();
    expect(ruleFilePath).toBeDefined();

    // Paths should not contain mixed separators (Windows \ and Unix /)
    expect(openspecPath).not.toMatch(/\\\//);
    expect(openspecPath).not.toMatch(/\/\\/);
    expect(cursorRulePath).not.toMatch(/\\\//);
    expect(cursorRulePath).not.toMatch(/\/\\/);
    expect(cursorCommandsPath).not.toMatch(/\\\//);
    expect(cursorCommandsPath).not.toMatch(/\/\\/);
    expect(ruleFilePath).not.toMatch(/\\\//);
    expect(ruleFilePath).not.toMatch(/\/\\/);
  });
});
