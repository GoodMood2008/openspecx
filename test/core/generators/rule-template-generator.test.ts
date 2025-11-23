import { describe, it, expect } from 'vitest';
import { RuleTemplateGenerator } from '../../../src/core/generators/rule-template-generator.js';

describe('RuleTemplateGenerator', () => {
  describe('generate', () => {
    const modulePath = 'api/test_module';
    const projectRulePath = 'openspec/RULE.md';

    it('should generate RULE template with correct structure', () => {
      const generator = new RuleTemplateGenerator();
      const content = generator.generate('test_rule', modulePath, projectRulePath);

      expect(content).toContain('# Module Rules: Test Rule');
      expect(content).toContain('## 范式概述');
      expect(content).toContain('**适用场景**:');
      expect(content).toContain('**目标**:');
      expect(content).toContain('## 核心约定');
      expect(content).toContain('### 必需组件');
      expect(content).toContain('### 命名规范');
      expect(content).toContain('## 实现检查清单');
      expect(content).toContain('### Phase 1: 核心实现');
      expect(content).toContain('### Phase 2: 集成');
      expect(content).toContain('### Phase 3: 测试');
      expect(content).toContain('## 参考示例');
    });

    it('should include AI instructions block', () => {
      const generator = new RuleTemplateGenerator();
      const content = generator.generate('test_rule', modulePath, projectRulePath);

      expect(content).toContain('<!--');
      expect(content).toContain('AI_INSTRUCTIONS_START');
      expect(content).toContain('AI_INSTRUCTIONS_END');
      expect(content).toContain('-->');
      expect(content).toContain(`请为模块 \`${modulePath}\` 生成完整的 RULE.md 内容`);
      expect(content).toContain(`参考: \`${projectRulePath}\``);
      expect(content).toContain('.cursor/rule/test_rule-RULE.md');
    });

    it('should format rule name correctly', () => {
      const generator = new RuleTemplateGenerator();
      
      const content1 = generator.generate('test_rule', modulePath, projectRulePath);
      expect(content1).toContain('# Module Rules: Test Rule');

      const content2 = generator.generate('multi-language-support', modulePath, projectRulePath);
      expect(content2).toContain('# Module Rules: Multi Language Support');

      const content3 = generator.generate('generate_multi_language', modulePath, projectRulePath);
      expect(content3).toContain('# Module Rules: Generate Multi Language');
    });

    it('should include placeholder content', () => {
      const generator = new RuleTemplateGenerator();
      const content = generator.generate('example', modulePath, projectRulePath);

      expect(content).toContain('[描述这类需求的适用场景');
      expect(content).toContain('[描述这个范式的目标');
      expect(content).toContain('用途说明');
      expect(content).toContain('职责说明');
      expect(content).toContain('测试要求');
    });

    it('should include naming convention table template', () => {
      const generator = new RuleTemplateGenerator();
      const content = generator.generate('test', modulePath, projectRulePath);

      expect(content).toContain('| 组件类型 | 命名模式 | 示例 |');
      expect(content).toContain('| 接口 | I + PascalCase | IExampleService |');
      expect(content).toContain('| 实现类 | PascalCase | ExampleServiceImpl |');
      expect(content).toContain('| 测试类 | PascalCase + Test | ExampleServiceTest |');
    });

    it('should include code analysis in AI instructions when provided', () => {
      const generator = new RuleTemplateGenerator();
      const analysis = {
        modulePath: 'api/test_module',
        totalFiles: 10,
        filesByType: { '.ts': 8, '.test.ts': 2 },
        classes: [{ name: 'TestClass', file: 'test.ts', isExported: true }],
        interfaces: [{ name: 'ITest', file: 'interface.ts', methods: ['method1'] }],
        functions: [],
        testFiles: ['test.test.ts'],
        patterns: [],
      };

      const content = generator.generate('test_rule', modulePath, projectRulePath, analysis);

      expect(content).toContain('## 代码结构分析');
      expect(content).toContain('模块路径: `api/test_module`');
      expect(content).toContain('文件总数: 10');
      expect(content).toContain('接口/基类: ITest');
      expect(content).toContain('实现类: TestClass');
      expect(content).toContain('测试文件: 1 个');
    });
  });
});

