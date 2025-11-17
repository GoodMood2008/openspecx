# OpenSpecX

OpenSpec Extensions - Module Rules Management

## Overview

OpenSpecX is an extension to OpenSpec that helps manage module-specific rules (RULE documents) and generate AI assistant commands for Cursor and other tools.

## Features

- **Init Command**: Initialize new module rules with code analysis and AI prompt generation
- **Validate Command**: Validate RULE.md files against specifications
- **Cursor Integration**: Generate Cursor command files that read RULE documents

## Installation

### 方式 1: 本地开发安装

```bash
# 从 openspecx 目录
cd openspecx
pnpm install
pnpm build

# 全局链接（使 openspecx 命令可用）
pnpm link --global
```

### 方式 2: 从 npm 安装（如果已发布）

```bash
npm install -g @goodmood2008/openspecx
# 或
pnpm add -g @goodmood2008/openspecx
```

### 方式 3: 从本地打包文件安装

```bash
# 在 openspecx 目录下
pnpm build
npm pack
# 这会生成一个 .tgz 文件

# 安装打包文件
npm install -g ./goodmood2008-openspecx-0.1.0.tgz
```

详细安装说明请参考 [INSTALL.md](./INSTALL.md)。

### 验证安装

```bash
openspecx --version
```

## Usage

### 查看帮助

```bash
# 查看主帮助
openspecx --help
# 或
openspecx help

# 查看特定命令的帮助
openspecx init --help
openspecx validate --help

# 查看版本
openspecx --version
```

### Initialize a Module Rule

**语法：**
```bash
openspecx init <modulePath> <ruleName> [options]
```

**参数：**
- `<modulePath>` - 模块路径（例如：`api/multi_language`）
- `<ruleName>` - 规则名称（例如：`generate_multi_language`）

**选项：**
- `--tool <tool>` - 目标工具（默认：`cursor`）
- `--skip-analysis` - 跳过模块代码分析

**示例：**
```bash
# 基本用法
openspecx init api/multi_language generate_multi_language

# 指定工具
openspecx init api/multi_language generate_multi_language --tool cursor

# 跳过代码分析
openspecx init api/multi_language generate_multi_language --skip-analysis
```

**功能说明：**
1. 提示选择 AI 工具（目前仅支持 Cursor）
2. 分析模块代码结构
3. 在 `.cursor/commands/` 目录生成 Cursor 命令文件
4. 生成 RULE 模板文件
5. 显示用于生成 RULE 内容的 AI 提示词

### Validate a RULE File

**重要说明**：`openspecx validate` 命令主要设计为**由 AI 助手自动调用**，而不是用户手动执行。当您让 AI 填充 RULE 文件时，AI 会自动调用此命令进行验证和自我修正。

**语法：**
```bash
openspecx validate <ruleFile> [options]
```

**参数：**
- `<ruleFile>` - RULE.md 文件路径

**选项：**
- `--strict` - 严格模式（警告视为错误）
- `--json` - 输出 JSON 格式（AI 使用此选项获取结构化验证结果）

**AI 自动调用示例：**
当您使用提示词让 AI 填充 RULE 文件时，AI 会自动执行：
```bash
# AI 自动调用（在 RULE 文件的 AI 指令中已包含）
openspecx validate api/multi_language/generate_multi_language-RULE.md --json
```

**手动调用（仅在需要时）：**
```bash
# 基本验证（查看验证结果）
openspecx validate api/multi_language/generate_multi_language-RULE.md

# 严格模式（CI/CD 场景）
openspecx validate api/multi_language/generate_multi_language-RULE.md --strict

# JSON 输出（用于脚本处理）
openspecx validate api/multi_language/generate_multi_language-RULE.md --json
```

### 全局选项

```bash
# 禁用彩色输出
openspecx --no-color init api/test test_rule
```

## Project Structure

```
openspecx/
├── bin/              # CLI entry point
├── src/              # Source code
│   ├── cli/          # CLI definitions
│   ├── commands/     # Command implementations
│   ├── core/         # Core functionality
│   │   ├── analyzers/    # Module code analyzers
│   │   ├── generators/   # File generators
│   │   ├── parsers/      # Markdown parsers
│   │   ├── schemas/      # Zod schemas
│   │   └── validation/  # Validators
│   └── utils/        # Utility functions
├── openspecx/        # Specification documents
│   └── specs/        # Spec definitions
└── test/             # Tests
```

## Development

### 开发命令

```bash
# 构建项目
pnpm build

# 监听模式（自动重新编译）
pnpm dev

# 运行测试
pnpm test
pnpm test:watch    # 监听模式
pnpm test:ui       # UI 模式
pnpm test:coverage # 覆盖率报告

# 开发模式运行 CLI（自动构建后运行）
pnpm dev:cli init api/multi_language test_rule
pnpm dev:cli validate path/to/rule-RULE.md
```

### 开发时使用 OpenSpecX 命令

开发过程中可以直接使用全局安装的命令，或通过 `pnpm dev:cli` 运行：

```bash
# 方式 1: 使用全局命令（如果已链接）
openspecx init api/test_module test_rule
# 注意：validate 命令通常由 AI 自动调用，无需手动执行

# 方式 2: 使用开发模式（自动构建）
pnpm dev:cli init api/test_module test_rule
# AI 会在填充 RULE 文件时自动调用 validate 命令
```

## Implementation Status

### ✅ Completed Features

- **Core Data Structures**: Type definitions, validation constants, RULE Zod Schema
- **Parsing & Validation**: RULE parser with bilingual support, comprehensive validator with error enhancement
- **Code Analysis**: Module analyzer supporting TypeScript, JavaScript, Python with design pattern detection
- **Generators**: Cursor command generator, RULE template generator, AI prompt generator
- **Commands**: Full implementation of `init` and `validate` commands
- **Testing**: 43 tests across 8 test files, all passing ✅

### 📋 Future Enhancements

- Support for more AI tools (currently only Cursor)
- Enhanced code analysis with AST parsing
- More design pattern detection
- Additional documentation and examples

## Integration with OpenSpec

OpenSpecX is designed to work alongside OpenSpec:
- Shares the same code style and structure
- Can be merged into OpenSpec as a sub-command
- Can be published as a separate package

## License

MIT

