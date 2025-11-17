import { describe, it, expect } from 'vitest';
import { PromptGenerator } from '../../../src/core/generators/prompt-generator.js';
import { ModuleAnalysis } from '../../../src/core/analyzers/types.js';

describe('PromptGenerator', () => {
  describe('generate', () => {
    it('should generate AI prompt with basic structure', () => {
      const generator = new PromptGenerator();
      const analysis: ModuleAnalysis = {
        modulePath: 'api/test_module',
        totalFiles: 5,
        filesByType: {},
        classes: [],
        interfaces: [],
        functions: [],
        testFiles: [],
        patterns: [],
      };

      const prompt = generator.generate(analysis, 'test_rule', 'api/test_module', 'openspec/RULE.md');

      expect(prompt).toContain('请为模块');
      expect(prompt).toContain('api/test_module');
      expect(prompt).toContain('规则名称: test_rule');
      expect(prompt).toContain('## 要求');
      expect(prompt).toContain('## 代码结构分析');
      expect(prompt).toContain('## 内容要求');
      expect(prompt).toContain('## 输出格式');
    });

    it('should include code structure analysis', () => {
      const generator = new PromptGenerator();
      const analysis: ModuleAnalysis = {
        modulePath: 'api/test_module',
        totalFiles: 10,
        filesByType: { '.ts': 8, '.test.ts': 2 },
        classes: [
          { name: 'Class1', file: 'class1.ts', isExported: true },
          { name: 'Class2', file: 'class2.ts', isExported: true },
          { name: 'Class3', file: 'class3.ts', isExported: true },
        ],
        interfaces: [
          { name: 'IInterface1', file: 'interface.ts', methods: ['method1'] },
          { name: 'IInterface2', file: 'interface.ts', methods: ['method2'] },
        ],
        functions: [
          { name: 'function1', file: 'utils.ts', isExported: true, isAsync: false },
        ],
        testFiles: ['test1.test.ts', 'test2.test.ts'],
        patterns: [
          { type: 'Factory', files: ['factory.ts'], confidence: 0.8 },
          { type: 'Singleton', files: ['singleton.ts'], confidence: 0.7 },
        ],
      };

      const prompt = generator.generate(analysis, 'test_rule', 'api/test_module', 'openspec/RULE.md');

      expect(prompt).toContain('文件总数: 10');
      expect(prompt).toContain('接口/基类: IInterface1, IInterface2');
      expect(prompt).toContain('实现类: Class1, Class2, Class3');
      expect(prompt).toContain('函数: 1 个');
      expect(prompt).toContain('测试文件: 2 个');
      expect(prompt).toContain('设计模式: Factory (1 个文件), Singleton (1 个文件)');
    });

    it('should include extra tips for interfaces', () => {
      const generator = new PromptGenerator();
      const analysis: ModuleAnalysis = {
        modulePath: 'api/test_module',
        totalFiles: 5,
        filesByType: {},
        classes: [],
        interfaces: [
          { name: 'IExample', file: 'interface.ts', methods: ['method1', 'method2'] },
        ],
        functions: [],
        testFiles: [],
        patterns: [],
      };

      const prompt = generator.generate(analysis, 'test_rule', 'api/test_module', 'openspec/RULE.md');

      expect(prompt).toContain('## 额外提示');
      expect(prompt).toContain('该模块已有接口定义');
      expect(prompt).toContain('参考接口: IExample');
    });

    it('should include extra tips for factory pattern', () => {
      const generator = new PromptGenerator();
      const analysis: ModuleAnalysis = {
        modulePath: 'api/test_module',
        totalFiles: 5,
        filesByType: {},
        classes: [],
        interfaces: [],
        functions: [],
        testFiles: [],
        patterns: [
          { type: 'Factory', files: ['factory.ts', 'factory_helper.ts'], confidence: 0.8 },
        ],
      };

      const prompt = generator.generate(analysis, 'test_rule', 'api/test_module', 'openspec/RULE.md');

      expect(prompt).toContain('该模块使用工厂模式');
      expect(prompt).toContain('工厂文件: factory.ts, factory_helper.ts');
    });

    it('should include tips for test files', () => {
      const generator = new PromptGenerator();
      const analysis: ModuleAnalysis = {
        modulePath: 'api/test_module',
        totalFiles: 5,
        filesByType: {},
        classes: [],
        interfaces: [],
        functions: [],
        testFiles: ['test1.test.ts', 'test2.test.ts'],
        patterns: [],
      };

      const prompt = generator.generate(analysis, 'test_rule', 'api/test_module', 'openspec/RULE.md');

      expect(prompt).toContain('该模块有测试文件');
      expect(prompt).toContain('指向现有的测试文件作为参考');
    });

    it('should format rule name in output format section', () => {
      const generator = new PromptGenerator();
      const analysis: ModuleAnalysis = {
        modulePath: 'api/test',
        totalFiles: 1,
        filesByType: {},
        classes: [],
        interfaces: [],
        functions: [],
        testFiles: [],
        patterns: [],
      };

      const prompt = generator.generate(analysis, 'test_rule_name', 'api/test', 'openspec/RULE.md');

      expect(prompt).toContain('# Module Rules: Test Rule Name');
    });
  });
});

