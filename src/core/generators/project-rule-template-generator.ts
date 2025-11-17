/**
 * Generate project-level RULE.md template
 * This is the template for openspec/RULE.md that defines the standard format
 * for all module RULE documents in the project.
 */
export class ProjectRuleTemplateGenerator {
  /**
   * Generate project-level RULE.md template content
   * This template is based on openspecx/specs/RULE_SPEC/spec.md
   */
  generate(): string {
    return `# Module RULE Document Format

本文档定义了项目中模块 RULE 文档的标准格式。所有模块的 RULE 文档都应遵循此格式。

## 文档结构

RULE 文档必须包含以下必需章节：

1. **标题**: \`# Module Rules: [Name]\`
2. **范式概述** (## 范式概述)
3. **核心约定** (## 核心约定)
4. **实现检查清单** (## 实现检查清单)
5. **参考示例** (## 参考示例)

## 范式概述

每个 RULE 文档必须包含范式概述，说明：

- **适用场景**: 描述这类需求的适用场景，何时使用这个范式
- **目标**: 描述这个范式的目标，要解决什么问题

**要求**:
- 适用场景描述至少 50 字
- 目标描述至少 50 字

## 核心约定

### 必需组件

列出所有必需的文件/类/接口，格式：

\`\`\`markdown
- [ ] **组件类型**: \`路径/文件\` - 用途说明
\`\`\`

**要求**:
- 至少包含 3 个必需组件
- 每个组件必须有清晰的说明

### 命名规范

使用表格列出命名模式：

\`\`\`markdown
| 组件类型 | 命名模式 | 示例 |
|---------|---------|------|
| 接口 | I + PascalCase | IExampleService |
| 实现类 | PascalCase | ExampleServiceImpl |
| 测试类 | PascalCase + Test | ExampleServiceTest |
\`\`\`

**要求**:
- 至少包含 3 种组件类型的命名规范
- 每个命名模式必须有示例

## 实现检查清单

实现检查清单必须包含至少 3 个阶段（Phase），每个阶段至少包含 1 个任务。

格式：

\`\`\`markdown
### Phase 1: [阶段名称]
- [ ] 任务描述
- [ ] 任务描述

### Phase 2: [阶段名称]
- [ ] 任务描述

### Phase 3: [阶段名称]
- [ ] 任务描述
\`\`\`

**要求**:
- 至少 3 个阶段
- 每个阶段至少 1 个任务
- 任务描述清晰具体

## 参考示例

列出参考示例，格式：

\`\`\`markdown
- **标准实现**: \`路径/文件\`
- **测试参考**: \`路径/test_文件\`
\`\`\`

**要求**:
- 至少包含 1 个参考示例
- 指向模块内的实际文件

## 使用说明

1. 创建新的模块规则时，参考此文档的格式
2. 根据模块的具体情况，填充各个章节的内容
3. 确保所有必需章节都已包含
4. 使用 \`openspecx validate\` 验证 RULE 文档是否符合规范（通常由 AI 自动调用）

## 自定义

你可以根据项目需求自定义此规范。修改后，所有新生成的模块 RULE 文档都会遵循更新后的规范。
`;
  }
}


