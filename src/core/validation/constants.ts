/**
 * Validation threshold constants for RULE documents
 */

// Minimum character lengths
export const MIN_OVERVIEW_SCENARIO_LENGTH = 30;
export const MIN_OVERVIEW_GOAL_LENGTH = 30;
export const MIN_COMPONENT_DESCRIPTION_LENGTH = 10;
export const MIN_PHASE_NAME_LENGTH = 5;
export const MIN_TASK_DESCRIPTION_LENGTH = 10;

// Maximum character/item limits
export const MAX_OVERVIEW_SCENARIO_LENGTH = 500;
export const MAX_OVERVIEW_GOAL_LENGTH = 500;
export const MAX_COMPONENT_DESCRIPTION_LENGTH = 200;

// Minimum counts
export const MIN_REQUIRED_COMPONENTS = 1;
export const MIN_PHASES = 3;
export const MIN_TASKS_PER_PHASE = 1;
export const MIN_NAMING_RULES = 1;

// Validation messages
export const VALIDATION_MESSAGES = {
  // Required content
  RULE_NAME_EMPTY: 'Rule name cannot be empty',
  OVERVIEW_SCENARIO_EMPTY: '适用场景 (Applicable Scenarios) cannot be empty',
  OVERVIEW_GOAL_EMPTY: '目标 (Goals) cannot be empty',
  OVERVIEW_SCENARIO_TOO_SHORT: `适用场景 must be at least ${MIN_OVERVIEW_SCENARIO_LENGTH} characters`,
  OVERVIEW_GOAL_TOO_SHORT: `目标 must be at least ${MIN_OVERVIEW_GOAL_LENGTH} characters`,
  NO_REQUIRED_COMPONENTS: `Must have at least ${MIN_REQUIRED_COMPONENTS} required component`,
  NO_NAMING_RULES: `Must have at least ${MIN_NAMING_RULES} naming rule`,
  NO_PHASES: `Must have at least ${MIN_PHASES} phases in checklist`,
  PHASE_NO_TASKS: 'Each phase must have at least one task',
  PHASE_NAME_TOO_SHORT: `Phase name must be at least ${MIN_PHASE_NAME_LENGTH} characters`,
  TASK_DESCRIPTION_TOO_SHORT: `Task description must be at least ${MIN_TASK_DESCRIPTION_LENGTH} characters`,
  
  // Warnings
  OVERVIEW_SCENARIO_TOO_BRIEF: `适用场景 is too brief (less than ${MIN_OVERVIEW_SCENARIO_LENGTH} characters)`,
  OVERVIEW_GOAL_TOO_BRIEF: `目标 is too brief (less than ${MIN_OVERVIEW_GOAL_LENGTH} characters)`,
  COMPONENT_DESCRIPTION_TOO_BRIEF: 'Component description is too brief',
  NO_REFERENCES: '建议添加参考示例以帮助理解 (Consider adding reference examples)',
  FEW_PHASES: `建议至少包含 ${MIN_PHASES} 个阶段 (Consider having at least ${MIN_PHASES} phases)`,
  
  // Section missing
  MISSING_OVERVIEW_SECTION: 'Missing "## 范式概述" (Paradigm Overview) section',
  MISSING_CONVENTIONS_SECTION: 'Missing "## 核心约定" (Core Conventions) section',
  MISSING_CHECKLIST_SECTION: 'Missing "## 实现检查清单" (Implementation Checklist) section',
  MISSING_REQUIRED_COMPONENTS: 'Missing "### 必需组件" (Required Components) subsection',
  MISSING_NAMING_RULES: 'Missing "### 命名规范" (Naming Conventions) subsection',
  
  // Guidance snippets (appended to primary messages for remediation)
  GUIDE_MISSING_SECTIONS:
    'Missing required sections. Expected structure:\n' +
    '## 范式概述\n' +
    '**适用场景**: [description]\n' +
    '**目标**: [description]\n\n' +
    '## 核心约定\n' +
    '### 必需组件\n' +
    '- [ ] **组件类型**: `路径` - 说明\n\n' +
    '### 命名规范\n' +
    '| 组件类型 | 命名模式 | 示例 |\n' +
    '|---------|---------|------|\n\n' +
    '## 实现检查清单\n' +
    '### Phase 1: [名称]\n' +
    '- [ ] 任务描述\n\n' +
    '## 参考示例\n' +
    '- **标准实现**: `路径/文件`',
  GUIDE_PHASE_FORMAT:
    'Phases must follow this format:\n' +
    '### Phase 1: [Phase Name]\n' +
    '- [ ] Task description 1\n' +
    '- [ ] Task description 2',
  GUIDE_COMPONENT_FORMAT:
    'Required components must follow this format:\n' +
    '- [ ] **组件类型**: `文件路径或命名模式` - 用途说明',
} as const;

