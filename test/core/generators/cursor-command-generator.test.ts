import { describe, it, expect } from 'vitest';
import { CursorCommandGenerator } from '../../../src/core/generators/cursor-command-generator.js';
import { ModuleAnalysis } from '../../../src/core/analyzers/types.js';

describe('CursorCommandGenerator', () => {
  describe('generate', () => {
    it('should generate Cursor command file content', () => {
      const generator = new CursorCommandGenerator();
      const content = generator.generate('test_rule', 'api/test_module');

      expect(content).toContain('name: /openspecx-test_rule');
      expect(content).toContain('id: openspecx-test_rule-proposal');
      expect(content).toContain('.cursor/rule/test_rule-RULE.md');
      expect(content).toContain('openspec/RULE.md');
      expect(content).toContain('openspec-proposal 的范式增强版本');
      expect(content).toContain('验证需求适用性');
      expect(content).toContain('增强 proposal.md with 范式约束');
    });

    it('should include module analysis context when provided', () => {
      const generator = new CursorCommandGenerator();
      const analysis: ModuleAnalysis = {
        modulePath: 'api/test_module',
        totalFiles: 10,
        filesByType: { '.ts': 8, '.test.ts': 2 },
        classes: [
          { name: 'TestClass', file: 'test.ts', isExported: true },
        ],
        interfaces: [
          { name: 'ITest', file: 'interface.ts', methods: ['method1'] },
        ],
        functions: [],
        testFiles: ['test.test.ts'],
        patterns: [
          { type: 'Factory', files: ['factory.ts'], confidence: 0.8 },
        ],
      };

      const content = generator.generate('test_rule', 'api/test_module', analysis);

      expect(content).toContain('## Module Context');
      expect(content).toContain('Total Files: 10');
      expect(content).toContain('Classes: TestClass');
      expect(content).toContain('Interfaces: ITest');
      expect(content).toContain('Test Files: 1 个');
      expect(content).toContain('Design Patterns: Factory');
    });

    it('should generate workflow steps', () => {
      const generator = new CursorCommandGenerator();
      const content = generator.generate('example_rule', 'api/example');

      expect(content).toContain('1. **验证需求适用性**');
      expect(content).toContain('2. **Review 项目上下文**');
      expect(content).toContain('3. **Choose Change ID**');
      expect(content).toContain('4. **Scaffold OpenSpec Change**');
      expect(content).toContain('5. **增强 proposal.md with 范式约束**');
      expect(content).toContain('6. **增强 tasks.md 按 RULE Phase 组织**');
    });

    it('should include proposal template', () => {
      const generator = new CursorCommandGenerator();
      const content = generator.generate('test_rule', 'api/test');

      // Check for proposal template structure in the enhanced workflow
      expect(content).toContain('# Proposal: [Feature Name]');
      expect(content).toContain('## Overview');
      expect(content).toContain('## Paradigm Compliance (Test Rule)');
      expect(content).toContain('### Required Components Checklist');
      expect(content).toContain('### Naming Conventions');
      expect(content).toContain('## Specification Deltas');
      expect(content).toContain('## Implementation Details');
      expect(content).toContain('## Validation');
      // Check for tasks.md template structure
      expect(content).toContain('# Tasks: [Feature Name]');
      expect(content).toContain('## Phase 1: [Phase Name from RULE]');
      expect(content).toContain('## Paradigm Validation');
    });
  });
});

