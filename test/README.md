# OpenSpecX 测试文档

## 测试结构

```
test/
├── helpers/
│   └── run-cli.ts              # CLI 测试辅助函数
├── fixtures/
│   └── sample-rules/           # 测试用的 RULE 文件示例
│       ├── valid-rule.md
│       └── invalid-rule-missing-sections.md
├── scripts/
│   └── postinstall.test.ts         # postinstall 脚本测试（跨平台）
├── utils/
│   └── path-compatibility.test.ts  # 路径处理跨平台兼容性测试
├── core/
│   ├── parsers/
│   │   └── rule-parser.test.ts      # RULE 解析器测试
│   ├── validation/
│   │   └── validator.test.ts        # RULE 验证器测试
│   └── generators/
│       ├── cursor-command-generator.test.ts
│       ├── rule-template-generator.test.ts
│       └── prompt-generator.test.ts
└── commands/
    ├── init.test.ts                 # init 命令测试
    └── validate.test.ts             # validate 命令测试
```

## 运行测试

```bash
# 运行所有测试
pnpm test

# 监视模式
pnpm test:watch

# 带 UI
pnpm test:ui

# 覆盖率
pnpm test:coverage
```

## 测试覆盖

### 已实现的测试

1. **RULE 解析器测试** (`test/core/parsers/rule-parser.test.ts`)
   - ✅ 解析有效的 RULE 文档
   - ✅ 从标题提取规则名称
   - ✅ 支持中英文章节标题
   - ✅ 解析必需组件（checkbox 格式）
   - ✅ 解析命名规范（表格格式）
   - ✅ 解析检查清单阶段和任务
   - ✅ 解析参考示例
   - ✅ 错误处理（缺失章节）
   - ✅ CRLF 行尾处理

2. **RULE 验证器测试** (`test/core/validation/validator.test.ts`)
   - ✅ 验证有效的 RULE 文件
   - ✅ 报告无效文件的错误
   - ✅ 报告简短内容的警告
   - ✅ 报告缺失参考示例的信息
   - ✅ 处理文件不存在的情况
   - ✅ 严格模式验证
   - ✅ 从字符串内容验证

3. **生成器测试**
   - ✅ Cursor 命令生成器测试
   - ✅ RULE 模板生成器测试
   - ✅ AI 提示词生成器测试

4. **命令测试**
   - ✅ validate 命令测试（有效/无效文件）
   - ✅ JSON 输出格式测试
   - ✅ init 命令测试（模块路径验证、目录创建、文件生成）
   - ✅ init 命令跨平台路径处理测试

5. **跨平台兼容性测试** (`test/scripts/postinstall.test.ts`)
   - ✅ 平台检测（Windows vs Unix-like）
   - ✅ chmod 行为（Windows 不执行，Unix-like 执行）
   - ✅ 错误处理（ENOENT 和其他错误）
   - ✅ 路径解析跨平台兼容性

6. **路径处理测试** (`test/utils/path-compatibility.test.ts`)
   - ✅ `path.join` 跨平台兼容性
   - ✅ `path.resolve` 跨平台兼容性
   - ✅ `path.relative` 跨平台兼容性
   - ✅ `path.isAbsolute` 跨平台兼容性
   - ✅ Windows 特定路径处理（UNC 路径等）
   - ✅ init 命令上下文中的路径构造
   - ✅ 文件系统工具与路径操作的集成

### 待实现的测试

- [ ] init 命令交互模式测试（模拟工具选择交互）
- [ ] 模块分析器在大型代码库中的性能测试
- [ ] 完整工作流 E2E（init -> AI -> validate）

## 测试风格

遵循 OpenSpec 的测试风格：

- 使用 Vitest 作为测试框架
- 使用 `describe` 和 `it` 组织测试
- 测试文件命名：`*.test.ts`
- 使用 `beforeEach` 和 `afterEach` 进行测试环境清理
- 使用 fixtures 存放测试数据

## 测试辅助函数

### `runCLI(args, options)`

运行 CLI 命令并返回结果：

```typescript
const result = await runCLI(['validate', 'path/to/rule.md']);
expect(result.exitCode).toBe(0);
expect(result.stdout).toContain('Validation passed');
```

## 测试 Fixtures

### `test/fixtures/sample-rules/`

包含示例 RULE 文件：
- `valid-rule.md` - 有效的完整 RULE 文档
- `invalid-rule-missing-sections.md` - 缺失章节的无效文档

## 编写新测试

1. 在对应的目录创建测试文件（与 `src/` 结构对应）
2. 使用 fixtures 或内联测试数据
3. 确保测试清理临时文件
4. 遵循 AAA 模式（Arrange, Act, Assert）

示例：

```typescript
import { describe, it, expect } from 'vitest';
import { YourClass } from '../../../src/core/your-module.js';

describe('YourClass', () => {
  it('should do something', () => {
    // Arrange
    const instance = new YourClass();
    
    // Act
    const result = instance.doSomething();
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

