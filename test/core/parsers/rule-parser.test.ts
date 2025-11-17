import { describe, it, expect } from 'vitest';
import { RuleParser } from '../../../src/core/parsers/rule-parser.js';

describe('RuleParser', () => {
  describe('parse', () => {
    it('should parse a valid RULE document', () => {
      const content = `# Module Rules: Multi Language

## 范式概述

**适用场景**: 当需要支持多种编程语言时使用此范式
**目标**: 提供可扩展的多语言支持架构

## 核心约定

### 必需组件

- [ ] **接口/基类**: \`path/to/interface.ts\` - 定义统一接口
- [ ] **实现类**: \`{Language}Compressor\` - 各语言的实现类

### 命名规范

| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| 接口 | I + PascalCase | ILanguageCompressor |
| 实现类 | {Language}Compressor | JavaCompressor |

## 实现检查清单

### Phase 1: 核心实现

- [ ] 创建接口实现类
- [ ] 实现核心功能

### Phase 2: 集成

- [ ] 注册到工厂
- [ ] 更新配置

### Phase 3: 测试

- [ ] 编写单元测试
- [ ] 编写集成测试

## 参考示例

- **标准实现**: \`path/to/example.ts\`
- **测试参考**: \`path/to/example.test.ts\``;

      const parser = new RuleParser(content);
      const rule = parser.parse();

      expect(rule.name).toBe('Multi Language');
      expect(rule.overview.scenario).toContain('多种编程语言');
      expect(rule.overview.goal).toContain('多语言支持架构');
      expect(rule.conventions.requiredComponents).toHaveLength(2);
      expect(rule.conventions.namingRules).toHaveLength(2);
      expect(rule.checklist).toHaveLength(3);
      expect(rule.references).toHaveLength(2);
    });

    it('should extract rule name from title', () => {
      const content = `# Module Rules: Test Rule Name

## 范式概述
**适用场景**: Test
**目标**: Test

## 核心约定
### 必需组件
- [ ] **接口**: \`path\` - desc

### 命名规范
| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| Type | Pattern | Example |

## 实现检查清单
### Phase 1: Test
- [ ] Task 1
### Phase 2: Test
- [ ] Task 2
### Phase 3: Test
- [ ] Task 3`;

      const parser = new RuleParser(content);
      const rule = parser.parse();

      expect(rule.name).toBe('Test Rule Name');
    });

    it('should support English section titles', () => {
      const content = `# Module Rules: English Rule

## Paradigm Overview

**Applicable Scenarios**: When you need multi-language support
**Goals**: Provide extensible architecture

## Core Conventions

### Required Components
- [ ] **Interface**: \`path\` - description

### Naming Conventions
| Component Type | Pattern | Example |
|---------------|---------|---------|
| Interface | I + PascalCase | IExample |

## Implementation Checklist

### Phase 1: Core
- [ ] Task 1
### Phase 2: Integration
- [ ] Task 2
### Phase 3: Testing
- [ ] Task 3

## Reference Examples
- **Standard**: \`path/example.ts\``;

      const parser = new RuleParser(content);
      const rule = parser.parse();

      expect(rule.overview.scenario).toContain('multi-language support');
      expect(rule.overview.goal).toContain('extensible architecture');
      expect(rule.conventions.requiredComponents).toHaveLength(1);
      expect(rule.conventions.namingRules).toHaveLength(1);
      expect(rule.checklist).toHaveLength(3);
    });

    it('should parse required components from checkbox format', () => {
      const content = `# Module Rules: Test

## 范式概述
**适用场景**: Test
**目标**: Test

## 核心约定
### 必需组件
- [ ] **接口**: \`path/to/interface.ts\` - Interface description
- [x] **可选组件**: \`path/to/optional.ts\` - Optional description

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

      const parser = new RuleParser(content);
      const rule = parser.parse();

      expect(rule.conventions.requiredComponents).toHaveLength(2);
      expect(rule.conventions.requiredComponents[0].required).toBe(true);
      expect(rule.conventions.requiredComponents[1].required).toBe(false);
    });

    it('should parse naming rules from table format', () => {
      const content = `# Module Rules: Test

## 范式概述
**适用场景**: Test
**目标**: Test

## 核心约定
### 必需组件
- [ ] **接口**: \`path\` - desc

### 命名规范
| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| 接口 | I + PascalCase | IExample |
| 实现类 | PascalCase | ExampleImpl |
| 测试类 | PascalCase + Test | ExampleTest |

## 实现检查清单
### Phase 1: Test
- [ ] Task
### Phase 2: Test
- [ ] Task
### Phase 3: Test
- [ ] Task`;

      const parser = new RuleParser(content);
      const rule = parser.parse();

      expect(rule.conventions.namingRules).toHaveLength(3);
      expect(rule.conventions.namingRules[0].componentType).toBe('接口');
      expect(rule.conventions.namingRules[0].pattern).toBe('I + PascalCase');
      expect(rule.conventions.namingRules[0].example).toBe('IExample');
    });

    it('should parse checklist phases and tasks', () => {
      const content = `# Module Rules: Test

## 范式概述
**适用场景**: Test
**目标**: Test

## 核心约定
### 必需组件
- [ ] **接口**: \`path\` - desc

### 命名规范
| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| Type | Pattern | Example |

## 实现检查清单

### Phase 1: 核心实现
- [ ] 创建接口实现类
- [x] 实现核心功能（已完成）

### Phase 2: 集成
- [ ] 注册到工厂
- [ ] 更新配置

### Phase 3: 测试
- [ ] 编写单元测试`;

      const parser = new RuleParser(content);
      const rule = parser.parse();

      expect(rule.checklist).toHaveLength(3);
      expect(rule.checklist[0].name).toBe('核心实现');
      expect(rule.checklist[0].tasks).toHaveLength(2);
      expect(rule.checklist[0].tasks[0].completed).toBe(false);
      expect(rule.checklist[0].tasks[1].completed).toBe(true);
    });

    it('should parse references section', () => {
      const content = `# Module Rules: Test

## 范式概述
**适用场景**: Test
**目标**: Test

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
- [ ] Task

## 参考示例
- **标准实现**: \`path/to/example.ts\`
- **测试参考**: \`path/to/test.ts\` - Test file reference`;

      const parser = new RuleParser(content);
      const rule = parser.parse();

      expect(rule.references).toHaveLength(2);
      expect(rule.references[0].type).toBe('标准实现');
      expect(rule.references[0].path).toBe('path/to/example.ts');
      expect(rule.references[1].description).toBe('Test file reference');
    });

    it('should throw error for missing overview section', () => {
      const content = `# Module Rules: Test

## 核心约定
### 必需组件
- [ ] **接口**: \`path\` - desc`;

      const parser = new RuleParser(content);
      expect(() => parser.parse()).toThrow('Missing "## 范式概述" section');
    });

    it('should throw error for missing conventions section', () => {
      const content = `# Module Rules: Test

## 范式概述
**适用场景**: Test
**目标**: Test`;

      const parser = new RuleParser(content);
      expect(() => parser.parse()).toThrow('Missing "## 核心约定" section');
    });

    it('should throw error for missing checklist section', () => {
      const content = `# Module Rules: Test

## 范式概述
**适用场景**: Test
**目标**: Test

## 核心约定
### 必需组件
- [ ] **接口**: \`path\` - desc`;

      const parser = new RuleParser(content);
      expect(() => parser.parse()).toThrow('Missing "## 实现检查清单" section');
    });

    it('should handle CRLF line endings', () => {
      const crlfContent = [
        '# Module Rules: CRLF Test',
        '',
        '## 范式概述',
        '**适用场景**: Test scenario',
        '**目标**: Test goal',
        '',
        '## 核心约定',
        '### 必需组件',
        '- [ ] **接口**: `path` - desc',
        '',
        '### 命名规范',
        '| 组件类型 | 命名模式 | 示例 |',
        '|---------|---------|------|',
        '| Type | Pattern | Example |',
        '',
        '## 实现检查清单',
        '### Phase 1: Test',
        '- [ ] Task',
        '### Phase 2: Test',
        '- [ ] Task',
        '### Phase 3: Test',
        '- [ ] Task',
      ].join('\r\n');

      const parser = new RuleParser(crlfContent);
      const rule = parser.parse();

      expect(rule.name).toBe('CRLF Test');
      expect(rule.overview.scenario).toContain('Test scenario');
    });
  });
});

