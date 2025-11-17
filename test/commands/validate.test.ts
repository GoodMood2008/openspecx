import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { runCLI } from '../helpers/run-cli.js';

describe('validate command', () => {
  const testDir = path.join(process.cwd(), 'test-validate-command-tmp');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should validate a valid RULE file', async () => {
    const validRule = `# Module Rules: Valid Rule

## 范式概述

**适用场景**: 这是一个有效的规则文档，用于测试验证命令的功能。适用于需要验证规则文档格式的场景。
**目标**: 确保规则文档符合规范格式，包含所有必需章节和内容，并且内容长度满足要求。

## 核心约定

### 必需组件

- [ ] **接口/基类**: \`path/to/interface.ts\` - 定义统一接口，用于规范各语言压缩器的实现
- [ ] **实现类**: \`{Language}Compressor\` - 各语言的压缩器实现类，需要实现统一接口

### 命名规范

| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| 接口 | I + PascalCase | ILanguageCompressor |
| 实现类 | {Language}Compressor | JavaCompressor |

## 实现检查清单

### Phase 1: 核心实现

- [ ] 创建接口实现类，定义统一接口规范
- [ ] 实现核心功能，确保功能完整性

### Phase 2: 集成

- [ ] 注册到工厂类，实现统一管理
- [ ] 更新配置文件，添加必要配置项

### Phase 3: 测试

- [ ] 编写单元测试，确保功能正确性
- [ ] 编写集成测试，验证系统集成

## 参考示例

- **标准实现**: \`path/to/example.ts\`
- **测试参考**: \`path/to/example.test.ts\``;

    const ruleFile = path.join(testDir, 'valid-rule-RULE.md');
    await fs.writeFile(ruleFile, validRule, 'utf-8');

    const result = await runCLI(['validate', ruleFile]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Validation passed');
  });

  it('should report errors for invalid RULE file', async () => {
    const invalidRule = `# Module Rules: Invalid

## 范式概述
**适用场景**: Too short
**目标**: Short

## 核心约定
### 必需组件
- [ ] **接口**: \`path\` - desc

### 命名规范
| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| Type | Pattern | Example |

## 实现检查清单
### Phase 1: Test
- [ ] Task
### Phase 2: Test
- [ ] Task
### Phase 3: Test
- [ ] Task`;

    const ruleFile = path.join(testDir, 'invalid-rule-RULE.md');
    await fs.writeFile(ruleFile, invalidRule, 'utf-8');

    const result = await runCLI(['validate', ruleFile]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('Validation failed');
  });

  it('should output JSON format when --json flag is provided', async () => {
    const validRule = `# Module Rules: JSON Test

## 范式概述

**适用场景**: 这是一个用于测试 JSON 输出格式的规则文档。适用于需要验证 JSON 输出功能的场景。
**目标**: 确保验证命令能够正确输出 JSON 格式的验证结果，并且格式符合预期要求。

## 核心约定

### 必需组件

- [ ] **接口**: \`path/to/interface.ts\` - 接口描述，用于定义统一规范

### 命名规范

| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| 接口 | I + PascalCase | IExample |

## 实现检查清单

### Phase 1: 核心实现

- [ ] 创建接口实现类，定义统一接口规范

### Phase 2: 集成

- [ ] 注册到工厂，实现统一管理

### Phase 3: 测试

- [ ] 编写单元测试，确保功能正确性

## 参考示例

- **标准实现**: \`path/to/example.ts\``;

    const ruleFile = path.join(testDir, 'json-test-RULE.md');
    await fs.writeFile(ruleFile, validRule, 'utf-8');

    const result = await runCLI(['validate', ruleFile, '--json']);

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('valid');
    expect(output).toHaveProperty('issues');
    expect(output).toHaveProperty('summary');
    expect(output.summary).toHaveProperty('errors');
    expect(output.summary).toHaveProperty('warnings');
    expect(output.summary).toHaveProperty('info');
  });

  it('should handle file not found', async () => {
    const result = await runCLI(['validate', path.join(testDir, 'nonexistent-RULE.md')]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr || result.stdout).toContain('not found');
  });
});

