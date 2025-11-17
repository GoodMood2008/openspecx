import { ModuleAnalysis } from '../analyzers/types.js';

/**
 * Generate RULE template file content
 */
export class RuleTemplateGenerator {
  /**
   * Generate RULE template with embedded AI instructions
   * @param ruleName - Name of the rule
   * @param modulePath - Path to the module
   * @param projectRulePath - Path to project RULE.md specification
   * @param analysis - Optional module analysis results
   */
  generate(
    ruleName: string,
    modulePath: string,
    projectRulePath: string,
    analysis?: ModuleAnalysis
  ): string {
    const displayName = ruleName
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Generate AI instructions block (HTML comment, won't affect Markdown rendering)
    const aiInstructions = this.generateAIInstructions(
      ruleName,
      modulePath,
      projectRulePath,
      analysis
    );

    return `${aiInstructions}

# Module Rules: ${displayName}

## 范式概述

**适用场景**: [描述这类需求的适用场景，何时使用这个范式]

**目标**: [描述这个范式的目标，要解决什么问题]

## 核心约定

### 必需组件

- [ ] **接口/基类**: \`路径/文件\` - 用途说明
- [ ] **实现类**: \`命名规范\` - 职责说明
- [ ] **测试类**: \`命名规范\` - 测试要求

### 命名规范

| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| 接口 | I + PascalCase | IExampleService |
| 实现类 | PascalCase | ExampleServiceImpl |
| 测试类 | PascalCase + Test | ExampleServiceTest |

## 实现检查清单

### Phase 1: 核心实现

- [ ] 创建接口/基类定义
- [ ] 实现核心功能类
- [ ] 添加基础错误处理

### Phase 2: 集成

- [ ] 注册到工厂/容器
- [ ] 配置依赖注入
- [ ] 更新相关文档

### Phase 3: 测试

- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 确保测试覆盖率达标

## 参考示例

- **标准实现**: \`路径/文件\`
- **测试参考**: \`路径/test_文件\`
`;
  }

  /**
   * Generate AI instructions as HTML comment block
   * This block contains detailed instructions for AI to fill out the RULE file
   */
  private generateAIInstructions(
    ruleName: string,
    modulePath: string,
    projectRulePath: string,
    analysis?: ModuleAnalysis
  ): string {
    const parts: string[] = [
      '<!--',
      'AI_INSTRUCTIONS_START',
      '',
      `请为模块 \`${modulePath}\` 生成完整的 RULE.md 内容。`,
      '',
      `规则名称: ${ruleName}`,
      '',
      '## 要求',
      '',
      '1. **严格遵循项目规范格式**',
      `   - 参考: \`${projectRulePath}\``,
      '   - 必须包含所有必需章节',
      '   - 使用中文撰写',
      '   - 遵循项目定义的 RULE 文档格式',
      '',
      '2. **基于实际代码结构**',
      '   - 分析模块的现有代码结构',
      '   - 识别设计模式和约定',
      '   - 提取命名规范',
      '',
      '3. **内容要求**',
      '   - 范式概述: 明确说明这类需求的适用场景和目标',
      '   - 核心约定: 列出必需组件（接口、实现类、测试类、工厂等）',
      '   - 实现检查清单: 至少3个Phase（核心实现、集成、测试、文档）',
      '   - 参考示例: 指向模块内的标准实现文件',
      '   - 命名规范: 使用表格描述命名模式',
    ];

    // Add code structure analysis if available
    if (analysis) {
      parts.push('', '## 代码结构分析', '');
      parts.push(`- 模块路径: \`${analysis.modulePath}\``);
      parts.push(`- 文件总数: ${analysis.totalFiles}`);

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

      // Add extra tips based on analysis
      if (analysis.interfaces.length > 0) {
        parts.push(
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
        parts.push(
          '',
          '该模块使用工厂模式，请在实现检查清单中包含：',
          '- 如何在工厂中注册新实现',
          '- 注册的具体步骤和代码位置',
          `- 工厂文件: ${factoryPattern.files.join(', ')}`
        );
      }

      if (analysis.testFiles.length > 0) {
        parts.push(
          '',
          '该模块有测试文件，请在参考示例中：',
          '- 指向现有的测试文件作为参考',
          '- 说明测试的覆盖范围和模式'
        );
      }
    }

    parts.push(
      '',
      '## 输出格式',
      '',
      '请直接填充此文件的内容，替换所有 [描述] 和占位符。',
      '确保格式符合项目规范，所有必需章节都已包含。',
      '',
      '## 验证和自我修正',
      '',
      '**重要**：生成内容后，必须自动进行验证和自我修正：',
      '',
      '1. **自动验证**',
      `   - 调用工具：\`openspecx validate ${modulePath}/${ruleName}-RULE.md\``,
      '   - 如果工具不可用，运行命令：`openspecx validate <RULE文件路径> --json`',
      '   - 获取验证结果（JSON 格式）',
      '',
      '2. **分析验证结果**',
      '   - 检查是否有 ERROR 级别的问题',
      '   - 检查是否有 WARNING 级别的问题',
      '   - 查看每个问题的路径、消息和行号',
      '',
      '3. **自我修正**',
      '   - 根据验证结果修正所有 ERROR 问题',
      '   - 尽可能修正 WARNING 问题（提升内容质量）',
      '   - 修正后重新验证，直到所有 ERROR 都解决',
      '',
      '4. **验证通过标准**',
      '   - 所有 ERROR 级别问题已解决',
      '   - 验证报告显示 "valid": true',
      '   - 或者验证命令退出码为 0',
      '',
      '**示例验证-修正循环**：',
      '```',
      '1. 生成初始 RULE 内容',
      '2. 运行: openspecx validate <path> --json',
      '3. 分析 JSON 输出，找出问题',
      '4. 修正问题（如：补充缺失章节、增加描述长度、修正格式）',
      '5. 重新运行验证',
      '6. 重复步骤 3-5 直到验证通过',
      '```',
      '',
      '**常见验证问题及修正方法**：',
      '- "缺少必需章节" → 补充缺失的章节',
      '- "适用场景描述过短" → 扩展描述至至少 50 字',
      '- "目标描述过短" → 扩展描述至至少 50 字',
      '- "必需组件数量不足" → 至少列出 3 个必需组件',
      '- "命名规范数量不足" → 至少列出 3 种命名规范',
      '- "实现检查清单阶段不足" → 至少包含 3 个 Phase',
      '- "任务描述过短" → 扩展任务描述',
      '',
      'AI_INSTRUCTIONS_END',
      '-->'
    );

    return parts.join('\n');
  }
}

