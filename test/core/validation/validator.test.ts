import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { RuleValidator } from '../../../src/core/validation/validator.js';
import { RuleSchema } from '../../../src/core/schemas/rule.schema.js';

describe('RuleValidator', () => {
  const testDir = path.join(process.cwd(), 'test-validator-tmp');

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

  describe('validateRule', () => {
    it('should validate a valid RULE file', async () => {
      const validRule = `# Module Rules: Valid Rule

## 范式概述

**适用场景**: 这是一个有效的规则文档，用于测试验证器的功能。适用于需要验证规则文档格式的场景，确保所有必需章节和内容都正确。
**目标**: 确保规则文档符合规范格式，包含所有必需章节和内容，并且内容长度满足要求。

## 核心约定

### 必需组件

- [ ] **接口/基类**: \`path/to/interface.ts\` - 定义统一接口，用于规范各语言压缩器的实现
- [ ] **实现类**: \`{Language}Compressor\` - 各语言的压缩器实现类，需要实现统一接口
- [ ] **测试类**: \`{Language}Compressor.test.ts\` - 对应语言的测试文件，确保功能正确

### 命名规范

| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| 接口 | I + PascalCase | ILanguageCompressor |
| 实现类 | {Language}Compressor | JavaCompressor |
| 测试类 | PascalCase + Test | ExampleTest |

## 实现检查清单

### Phase 1: 核心实现

- [ ] 创建接口实现类，定义统一接口规范
- [ ] 实现核心功能方法，确保功能完整性
- [ ] 添加基础错误处理，提高代码健壮性

### Phase 2: 集成

- [ ] 注册到工厂类，实现统一管理
- [ ] 更新配置文件，添加必要配置项
- [ ] 添加依赖注入，提高代码可测试性

### Phase 3: 测试

- [ ] 编写单元测试，确保功能正确性
- [ ] 编写集成测试，验证系统集成
- [ ] 确保测试覆盖率，达到质量要求

## 参考示例

- **标准实现**: \`path/to/example.ts\`
- **测试参考**: \`path/to/example.test.ts\``;

      const ruleFile = path.join(testDir, 'valid-rule-RULE.md');
      await fs.writeFile(ruleFile, validRule, 'utf-8');

      const validator = new RuleValidator();
      const report = await validator.validateRule(ruleFile);

      expect(report.valid).toBe(true);
      expect(report.issues).toHaveLength(0);
      expect(report.summary.errors).toBe(0);
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

      const validator = new RuleValidator();
      const report = await validator.validateRule(ruleFile);

      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
    });

    it('should report warnings for brief content', async () => {
      const briefRule = `# Module Rules: Brief Rule

## 范式概述

**适用场景**: Short
**目标**: Short

## 核心约定

### 必需组件

- [ ] **接口**: \`path/to/interface.ts\` - Short description

### 命名规范

| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| 接口 | I + PascalCase | IExample |

## 实现检查清单

### Phase 1: 核心实现

- [ ] Task description

### Phase 2: 集成

- [ ] Task description

### Phase 3: 测试

- [ ] Task description`;

      const ruleFile = path.join(testDir, 'brief-rule-RULE.md');
      await fs.writeFile(ruleFile, briefRule, 'utf-8');

      const validator = new RuleValidator();
      const report = await validator.validateRule(ruleFile);

      expect(report.summary.warnings).toBeGreaterThan(0);
    });

    it('should report info for missing references', async () => {
      const noRefRule = `# Module Rules: No References

## 范式概述

**适用场景**: 这是一个没有参考示例的规则文档，用于测试验证器对缺失参考示例的提示功能。
**目标**: 确保验证器能够识别并提示缺失的参考示例部分。

## 核心约定

### 必需组件

- [ ] **接口**: \`path/to/interface.ts\` - 接口描述
- [ ] **实现类**: \`ExampleImpl\` - 实现类描述

### 命名规范

| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| 接口 | I + PascalCase | IExample |
| 实现类 | PascalCase | ExampleImpl |

## 实现检查清单

### Phase 1: 核心实现

- [ ] 创建接口实现类
- [ ] 实现核心功能

### Phase 2: 集成

- [ ] 注册到工厂
- [ ] 更新配置

### Phase 3: 测试

- [ ] 编写单元测试
- [ ] 编写集成测试`;

      const ruleFile = path.join(testDir, 'no-ref-rule-RULE.md');
      await fs.writeFile(ruleFile, noRefRule, 'utf-8');

      const validator = new RuleValidator();
      const report = await validator.validateRule(ruleFile);

      expect(report.summary.info).toBeGreaterThan(0);
      const infoIssues = report.issues.filter(i => i.level === 'INFO');
      expect(infoIssues.some(i => i.path === 'references')).toBe(true);
    });

    it('should handle file not found', async () => {
      const validator = new RuleValidator();
      const report = await validator.validateRule(path.join(testDir, 'nonexistent-RULE.md'));

      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.issues.some(i => i.level === 'ERROR')).toBe(true);
    });

    it('should validate with strict mode', async () => {
      const ruleWithWarnings = `# Module Rules: Warnings

## 范式概述

**适用场景**: Short
**目标**: Short

## 核心约定

### 必需组件

- [ ] **接口**: \`path/to/interface.ts\` - Short

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

      const ruleFile = path.join(testDir, 'warnings-rule-RULE.md');
      await fs.writeFile(ruleFile, ruleWithWarnings, 'utf-8');

      const strictValidator = new RuleValidator(true);
      const report = await strictValidator.validateRule(ruleFile);

      // In strict mode, warnings should make it invalid
      expect(report.valid).toBe(false);
    });

  it('should include guidance when required sections are missing', async () => {
    const missingSectionRule = `# Module Rules: Missing Sections

## 范式概述
**适用场景**: This file intentionally omits sections.
**目标**: Trigger guidance message.
`;

    const ruleFile = path.join(testDir, 'missing-section-RULE.md');
    await fs.writeFile(ruleFile, missingSectionRule, 'utf-8');

    const validator = new RuleValidator();
    const report = await validator.validateRule(ruleFile);

    expect(report.valid).toBe(false);
    const fileIssue = report.issues.find((issue) => issue.path === 'file');
    expect(fileIssue?.message).toContain('Missing "## 核心约定" section');
    expect(fileIssue?.message).toContain('Expected structure');
  });
  });

  describe('validateRuleContent', () => {
    it('should validate rule content from string', async () => {
      const content = `# Module Rules: Content Test

## 范式概述

**适用场景**: 这是一个用于测试从字符串内容验证规则的测试用例。适用于需要验证规则文档格式的场景。
**目标**: 确保验证器能够正确处理字符串格式的规则内容，并且验证逻辑正确工作。

## 核心约定

### 必需组件

- [ ] **接口**: \`path/to/interface.ts\` - 接口描述

### 命名规范

| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| 接口 | I + PascalCase | IExample |

## 实现检查清单

### Phase 1: 核心实现

- [ ] 创建接口实现类
- [ ] 实现核心功能

### Phase 2: 集成

- [ ] 注册到工厂

### Phase 3: 测试

- [ ] 编写单元测试`;

      const validator = new RuleValidator();
      const report = await validator.validateRuleContent('content-test', content);

      expect(report.valid).toBe(true);
    });
  });
});

describe('RuleSchema', () => {
  describe('validation', () => {
    it('should validate a complete rule object', () => {
      const rule = {
        name: 'test-rule',
        overview: {
          scenario: 'This is a test scenario that is long enough to pass validation',
          goal: 'This is a test goal that is also long enough to pass validation',
        },
        conventions: {
          requiredComponents: [
            {
              type: '接口',
              path: 'path/to/interface.ts',
              description: 'Interface description',
              required: true,
            },
          ],
          namingRules: [
            {
              componentType: '接口',
              pattern: 'I + PascalCase',
              example: 'IExample',
            },
          ],
        },
        checklist: [
          {
            name: 'Phase 1',
            tasks: [
              { description: 'Task 1', completed: false },
              { description: 'Task 2', completed: false },
            ],
          },
          {
            name: 'Phase 2',
            tasks: [{ description: 'Task 1', completed: false }],
          },
          {
            name: 'Phase 3',
            tasks: [{ description: 'Task 1', completed: false }],
          },
        ],
        references: [
          {
            type: '标准实现',
            path: 'path/to/example.ts',
            description: 'Example implementation',
          },
        ],
      };

      const result = RuleSchema.safeParse(rule);
      expect(result.success).toBe(true);
    });

    it('should reject rule with short overview', () => {
      const rule = {
        name: 'test',
        overview: {
          scenario: 'Short',
          goal: 'Short',
        },
        conventions: {
          requiredComponents: [
            {
              type: '接口',
              path: 'path',
              description: 'desc',
              required: true,
            },
          ],
          namingRules: [
            {
              componentType: 'Type',
              pattern: 'Pattern',
              example: 'Example',
            },
          ],
        },
        checklist: [
          {
            name: 'Phase 1',
            tasks: [{ description: 'Task', completed: false }],
          },
          {
            name: 'Phase 2',
            tasks: [{ description: 'Task', completed: false }],
          },
          {
            name: 'Phase 3',
            tasks: [{ description: 'Task', completed: false }],
          },
        ],
      };

      const result = RuleSchema.safeParse(rule);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('适用场景'))).toBe(true);
      }
    });

    it('should reject rule with insufficient phases', () => {
      const rule = {
        name: 'test',
        overview: {
          scenario: 'This is a test scenario that is long enough to pass validation',
          goal: 'This is a test goal that is also long enough to pass validation',
        },
        conventions: {
          requiredComponents: [
            {
              type: '接口',
              path: 'path',
              description: 'desc',
              required: true,
            },
          ],
          namingRules: [
            {
              componentType: 'Type',
              pattern: 'Pattern',
              example: 'Example',
            },
          ],
        },
        checklist: [
          {
            name: 'Phase 1',
            tasks: [{ description: 'Task', completed: false }],
          },
        ],
      };

      const result = RuleSchema.safeParse(rule);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('至少') || i.message.includes('at least'))).toBe(true);
      }
    });
  });
});

