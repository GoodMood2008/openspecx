import { ModuleAnalysis } from '../analyzers/types.js';

/**
 * Generate AI prompt for RULE content generation
 */
export class PromptGenerator {
  /**
   * Generate AI prompt based on module analysis
   * @param analysis - Module code analysis results
   * @param ruleName - Name of the rule
   * @param modulePath - Path to the module
   * @param projectRulePath - Path to the project RULE.md specification (e.g., openspec/RULE.md)
   */
  generate(analysis: ModuleAnalysis, ruleName: string, modulePath: string, projectRulePath: string): string {
    const sections = [
      this.generateHeader(modulePath, ruleName),
      this.generateRequirements(projectRulePath),
      this.generateCodeStructure(analysis),
      this.generateContentRequirements(),
      this.generateOutputFormat(ruleName),
      this.generateExtraTips(analysis),
    ];

    return sections.join('\n\n');
  }

  /**
   * Generate header section
   */
  private generateHeader(modulePath: string, ruleName: string): string {
    return `请为模块 \`${modulePath}\` 生成 RULE.md 文件。

规则名称: ${ruleName}`;
  }

  /**
   * Generate requirements section
   */
  private generateRequirements(projectRulePath: string): string {
    return `## 要求

1. **严格遵循项目规范格式**
   - 参考: \`${projectRulePath}\`
   - 必须包含所有必需章节
   - 使用中文撰写
   - 遵循项目定义的 RULE 文档格式

2. **基于实际代码结构**
   - 分析模块的现有代码结构
   - 识别设计模式和约定
   - 提取命名规范

3. **内容要求**
   - 范式概述: 明确说明这类需求的适用场景和目标
   - 核心约定: 列出必需组件（接口、实现类、测试类、工厂等）
   - 实现检查清单: 至少3个Phase（核心实现、集成、测试、文档）
   - 参考示例: 指向模块内的标准实现文件
   - 命名规范: 使用表格描述命名模式`;
  }

  /**
   * Generate code structure section
   */
  private generateCodeStructure(analysis: ModuleAnalysis): string {
    const parts: string[] = [
      '## 代码结构分析',
      '',
      `- 模块路径: \`${analysis.modulePath}\``,
      `- 文件总数: ${analysis.totalFiles}`,
    ];

    if (Object.keys(analysis.filesByType).length > 0) {
      const fileTypes = Object.entries(analysis.filesByType)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');
      parts.push(`- 文件类型: ${fileTypes}`);
    }

    if (analysis.interfaces.length > 0) {
      parts.push(`- 接口/基类: ${analysis.interfaces.map(i => i.name).join(', ')}`);
    }

    if (analysis.classes.length > 0) {
      const sample = analysis.classes.slice(0, 5).map(c => c.name).join(', ');
      const more = analysis.classes.length > 5 ? ` (共${analysis.classes.length}个)` : '';
      parts.push(`- 实现类: ${sample}${more}`);
    }

    if (analysis.functions.length > 0) {
      parts.push(`- 函数: ${analysis.functions.length} 个`);
    }

    if (analysis.testFiles.length > 0) {
      parts.push(`- 测试文件: ${analysis.testFiles.length} 个`);
    }

    if (analysis.patterns.length > 0) {
      const patternInfo = analysis.patterns.map(p => 
        `${p.type} (${p.files.length} 个文件)`
      ).join(', ');
      parts.push(`- 设计模式: ${patternInfo}`);
    }

    return parts.join('\n');
  }

  /**
   * Generate content requirements section
   */
  private generateContentRequirements(): string {
    return `## 内容要求

请确保 RULE.md 包含以下内容：

### 范式概述
- **适用场景**: 描述何时使用这个范式
- **目标**: 描述要解决什么问题

### 核心约定
- **必需组件**: 列出所有必需的文件/类/接口
  - 格式: \`- [ ] **组件类型**: \`路径\` - 说明\`
- **命名规范**: 使用表格列出命名模式
  - 格式: \`| 组件类型 | 命名模式 | 示例 |\`

### 实现检查清单
- 至少包含 3 个阶段
- 每个阶段至少包含 1 个任务
- 格式: \`### Phase N: [名称]\` 后跟任务列表

### 参考示例
- 指向模块内的标准实现
- 指向测试文件作为参考`;
  }

  /**
   * Generate output format section
   */
  private generateOutputFormat(ruleName: string): string {
    const displayName = ruleName
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return `## 输出格式

请直接输出完整的 RULE.md 内容，可以直接保存到文件。

确保格式符合以下结构：

\`\`\`markdown
# Module Rules: ${displayName}

## 范式概述
**适用场景**: [描述]
**目标**: [描述]

## 核心约定

### 必需组件
- [ ] **接口/基类**: \`文件路径\` - 用途说明
- [ ] **实现类**: \`命名规范\` - 职责说明
- [ ] **测试类**: \`命名规范\` - 测试要求

### 命名规范
| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| ... | ... | ... |

## 实现检查清单

### Phase 1: 核心实现
- [ ] 任务描述

### Phase 2: 集成
- [ ] 任务描述

### Phase 3: 测试
- [ ] 任务描述

## 参考示例
- **标准实现**: \`路径/文件\`
- **测试参考**: \`路径/test_文件\`
\`\`\``;
  }

  /**
   * Generate extra tips based on analysis
   */
  private generateExtraTips(analysis: ModuleAnalysis): string {
    const tips: string[] = [];

    if (analysis.interfaces.length > 0) {
      tips.push(
        '',
        '## 额外提示',
        '',
        '该模块已有接口定义，请在核心约定中说明：',
        '- 新实现类必须继承/实现哪些接口',
        '- 接口的核心方法有哪些',
        `- 参考接口: ${analysis.interfaces.map(i => i.name).join(', ')}`
      );
    }

    const factoryPattern = analysis.patterns.find(p => p.type === 'Factory');
    if (factoryPattern) {
      tips.push(
        '',
        '该模块使用工厂模式，请在实现检查清单中包含：',
        '- 如何在工厂中注册新实现',
        '- 注册的具体步骤和代码位置',
        `- 工厂文件: ${factoryPattern.files.join(', ')}`
      );
    }

    if (analysis.testFiles.length > 0) {
      tips.push(
        '',
        '该模块有测试文件，请在参考示例中：',
        '- 指向现有的测试文件作为参考',
        '- 说明测试的覆盖范围和模式'
      );
    }

    return tips.join('\n');
  }
}

