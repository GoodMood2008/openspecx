import path from 'path';
import { ModuleAnalysis } from '../analyzers/types.js';

/**
 * Generate Cursor command file content for OpenSpecX paradigm-enhanced proposals
 * This enhances the standard openspec-proposal workflow with paradigm-specific rules
 */
export class CursorCommandGenerator {
  /**
   * Generate Cursor command file content
   * This command enhances openspec-proposal with paradigm-specific constraints from RULE.md
   */
  generate(ruleName: string, modulePath: string, analysis?: ModuleAnalysis): string {
    const ruleFilePath = `${modulePath}/${ruleName}-RULE.md`;
    const ruleSpecPath = 'openspec/RULE.md';
    const displayName = ruleName
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return `---
name: /openspecx-${ruleName}
id: openspecx-${ruleName}-proposal
category: OpenSpec
description: Create OpenSpec change proposal with ${displayName} paradigm constraints
---

# OpenSpecX: ${displayName} Paradigm Proposal

## 核心理念

这是 **openspec-proposal 的范式增强版本**。它在标准 OpenSpec change 流程基础上，增加了 **${displayName}** 范式的约束和指导。

**重要**：
- 生成的仍然是标准的 OpenSpec change 结构（\`proposal.md\`, \`tasks.md\`, \`design.md\`）
- 可以与 \`/openspec-apply\` 和 \`/openspec-archive\` 命令串接
- 增加了范式约束检查清单和命名规范验证

## Context Files

在开始之前，按顺序读取以下文件：

1. **OpenSpec 工作流程**: \`openspec/AGENTS.md\`
   - 了解标准 OpenSpec 的三阶段工作流
   
2. **项目上下文**: \`openspec/project.md\`
   - 了解项目的技术栈和约定
   
3. **项目 RULE 规范**: \`${ruleSpecPath}\`
   - 了解项目对 RULE 文档的标准格式要求
   
4. **本范式规范**: \`${ruleFilePath}\`
   - 了解 ${displayName} 范式的具体约定、必需组件、命名规范和实施检查清单

${analysis ? this.generateAnalysisContext(analysis, modulePath) : ''}

**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- **范式约束**: 确保所有实现符合 \`${ruleFilePath}\` 定义的约定
- **命名规范**: 严格遵循 RULE 中定义的命名模式
- **必需组件**: 确保所有 RULE 要求的组件都已规划
- Identify any vague or ambiguous details and ask the necessary follow-up questions before editing files.

**Steps**

1. **验证需求适用性**
   - 确认用户需求是否符合 \`${ruleFilePath}\` 中定义的"适用场景"
   - 如果不适合此范式，建议使用标准 \`/openspec-proposal\` 命令

2. **Review 项目上下文**（标准 OpenSpec 流程）
   - Review \`openspec/project.md\`, run \`openspec list\` and \`openspec list --specs\`
   - Inspect related code in \`${modulePath}\` to ground the proposal in current behaviour
   - Note any gaps that require clarification

3. **Choose Change ID**（标准 OpenSpec 流程）
   - Choose a unique verb-led \`change-id\` (kebab-case: add-, update-, remove-, refactor-)
   - Example: \`add-${ruleName.replace(/_/g, '-')}-[feature-name]\`

4. **Scaffold OpenSpec Change**（标准结构）
   - Create \`openspec/changes/<id>/proposal.md\`
   - Create \`openspec/changes/<id>/tasks.md\`
   - Create \`openspec/changes/<id>/design.md\` (when architectural reasoning needed)

5. **增强 proposal.md with 范式约束**
   
   在标准 OpenSpec proposal.md 基础上，增加以下部分：
   
   \`\`\`markdown
   # Proposal: [Feature Name]
   
   > **Paradigm**: ${displayName} (\`${ruleFilePath}\`)
   
   ## Overview
   [标准 OpenSpec 概述]
   
   ## Paradigm Compliance (${displayName})
   
   ### Required Components Checklist
   
   根据 \`${ruleFilePath}\` 的"必需组件"部分：
   
   - [ ] **接口/基类**: \`[路径]\` - [用途说明]
   - [ ] **实现类**: \`[路径]\` - [职责说明]
   - [ ] **测试类**: \`[路径]\` - [测试要求]
   - [ ] [其他 RULE 要求的组件...]
   
   ### Naming Conventions
   
   遵循 \`${ruleFilePath}\` 的命名规范表：
   
   | 组件类型 | 命名模式 | 本次实现示例 |
   |---------|---------|-------------|
   | [类型1] | [模式1] | [示例1] |
   | [类型2] | [模式2] | [示例2] |
   
   ## Specification Deltas
   [标准 OpenSpec delta 部分 - 如需要]
   
   ## Implementation Details
   [详细实现说明]
   
   ## Validation
   - [ ] 遵循 ${displayName} 范式所有约定
   - [ ] \`openspec validate <change-id> --strict\` 通过
   - [ ] \`openspecx validate ${ruleFilePath}\` 通过
   \`\`\`

6. **增强 tasks.md 按 RULE Phase 组织**
   
   按照 \`${ruleFilePath}\` 定义的 Phase 组织任务：
   
   \`\`\`markdown
   # Tasks: [Feature Name]
   
   > **Paradigm**: ${displayName}
   
   [从 ${ruleFilePath} 的"实现检查清单"提取 Phase]
   
   ## Phase 1: [Phase Name from RULE]
   - [ ] [Task from RULE]
   - [ ] [具体实现任务]
   
   ## Phase 2: [Phase Name from RULE]
   - [ ] [Task from RULE]
   - [ ] [具体实现任务]
   
   ## Phase 3: [Phase Name from RULE]
   - [ ] [Task from RULE]
   - [ ] [具体实现任务]
   
   ## Paradigm Validation
   - [ ] 所有必需组件已实现
   - [ ] 命名规范已遵循
   - [ ] 所有 Phase 任务已完成
   \`\`\`

7. **Draft spec deltas**（如需要，标准 OpenSpec 流程）
   - Use \`## ADDED|MODIFIED|REMOVED Requirements\` with at least one \`#### Scenario:\` per requirement

8. **Validate**
   - Run \`openspec validate <change-id> --strict\` and resolve every issue
   - Verify paradigm compliance:
     - ✅ 所有 RULE 必需组件都已列出
     - ✅ 命名遵循 RULE 规范
     - ✅ 任务按 RULE Phase 组织
     - ✅ 有参考 RULE 的示例

**Reference**
- Use \`openspec show <id> --json --deltas-only\` to inspect details when validation fails
- Use \`openspecx validate ${ruleFilePath}\` to validate the RULE document itself
- Search existing requirements with \`rg -n "Requirement:|Scenario:" openspec/specs\`
- Reference examples from \`${ruleFilePath}\` "参考示例" section

**后续流程**

Proposal 批准后：
- 使用 \`/openspec-apply\` 实施（标准流程，但参考 RULE 约束）
- 使用 \`/openspec-archive\` 归档（标准流程）

**重要提示**

1. **标准 OpenSpec 结构**：始终生成标准的 OpenSpec change 结构
2. **范式增强**：在标准结构中增加范式约束和检查清单
3. **工作流兼容**：确保可以与 openspec-apply、openspec-archive 串接
4. **验证双重**：既要通过 OpenSpec 验证，也要符合 RULE 约束

---

Ready to start? Ask the user to describe their feature request, then follow the workflow above.
`;
  }

  /**
   * Generate analysis context section
   */
  private generateAnalysisContext(analysis: ModuleAnalysis, modulePath: string): string {
    const parts: string[] = [
      '',
      '## Module Context',
      '',
      `This module (\`${modulePath}\`) has the following structure:`,
      '',
      `- Total Files: ${analysis.totalFiles}`,
    ];

    if (analysis.classes.length > 0) {
      const sample = analysis.classes.slice(0, 5).map(c => c.name).join(', ');
      const more = analysis.classes.length > 5 ? ` (共${analysis.classes.length}个)` : '';
      parts.push(`- Classes: ${sample}${more}`);
    }

    if (analysis.interfaces.length > 0) {
      parts.push(`- Interfaces: ${analysis.interfaces.map(i => i.name).join(', ')}`);
    }

    if (analysis.testFiles.length > 0) {
      parts.push(`- Test Files: ${analysis.testFiles.length} 个`);
    }

    if (analysis.patterns.length > 0) {
      parts.push(`- Design Patterns: ${analysis.patterns.map(p => p.type).join(', ')}`);
    }

    parts.push('');
    parts.push('Use this context to understand existing patterns and conventions in the module.');

    return parts.join('\n');
  }
}
