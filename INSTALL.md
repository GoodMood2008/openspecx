# OpenSpecX 安装和打包指南

本文档包含 OpenSpecX 的安装和打包说明，分为**用户安装指南**和**开发者打包指南**两部分。

---

## 📦 用户安装指南

如果您只是想使用 OpenSpecX，请按照以下方式安装。

### 方式 1: 从 npm 安装（推荐，生产环境）

如果包已发布到 npm registry：

```bash
# 全局安装
npm install -g @fission-ai/openspecx
# 或使用 pnpm
pnpm add -g @fission-ai/openspecx

# 验证安装
openspecx --version
```

### 方式 2: 从本地打包文件安装

如果您有本地的 `.tgz` 打包文件：

```bash
npm install -g ./fission-ai-openspecx-0.1.0.tgz
# 或
pnpm add -g ./fission-ai-openspecx-0.1.0.tgz

# 验证安装
openspecx --version
```

### 使用

安装完成后，可以使用以下命令：

```bash
# 查看帮助
openspecx --help

# 初始化模块规则
openspecx init <modulePath> <ruleName>

# 验证规则文件
openspecx validate <ruleFilePath>
```

更多使用说明请参考 [README.md](./README.md)。

### 卸载

```bash
# 如果使用 npm install -g 安装
npm uninstall -g @fission-ai/openspecx
# 或
pnpm remove -g @fission-ai/openspecx
```

### 用户常见问题

#### 问题：命令未找到

1. **检查 PATH**
   ```bash
   echo $PATH
   # 确保包含 npm 全局 bin 目录
   # 通常为: ~/.npm-global/bin 或 /usr/local/bin
   ```

2. **检查安装位置**
   ```bash
   npm list -g @fission-ai/openspecx
   # 或
   pnpm list -g @fission-ai/openspecx
   ```

3. **检查执行权限**
   ```bash
   ls -la $(npm bin -g)/openspecx
   # 或
   ls -la $(pnpm bin -g)/openspecx
   ```

#### 问题：权限错误

如果遇到权限问题，可以配置 npm 使用其他目录：

```bash
# 配置 npm 全局目录（推荐）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

## 🔧 开发者打包指南

如果您是开发者，需要从源码构建、打包或发布 OpenSpecX，请参考以下内容。

### 前置要求

- **Node.js 版本**: >= 20.19.0
- **包管理器**: pnpm（推荐）或 npm
- **ESM 模块**: 项目使用 ES 模块（`"type": "module"`）

### 快速开始（开发环境）

#### 方法 1: 使用 npm link（推荐用于开发）

```bash
cd openspecx
pnpm install
pnpm build
pnpm link --global
```

安装后即可使用 `openspecx` 命令。

#### 方法 2: 使用安装脚本

```bash
cd openspecx
./scripts/install-local.sh
```

该脚本会自动完成构建、打包和安装的整个过程。

#### 方法 3: 手动打包安装

```bash
cd openspecx
pnpm build
npm pack
npm install -g ./fission-ai-openspecx-0.1.0.tgz
```

### 打包配置说明

#### package.json 关键配置

1. **bin 字段**: 定义可执行命令
   ```json
   "bin": {
     "openspecx": "./bin/openspecx.js"
   }
   ```

2. **files 字段**: 指定打包时包含的文件
   ```json
   "files": [
     "dist",
     "bin",
     "openspecx"
   ]
   ```

3. **scripts 字段**: 构建和发布脚本
   - `build`: 编译 TypeScript
   - `prepublishOnly`: 发布前自动构建
   - `postinstall`: 安装后设置执行权限

#### bin/openspecx.js

这是 CLI 入口文件，包含：
- Shebang: `#!/usr/bin/env node`
- 动态导入编译后的 CLI 代码
- 错误处理

**注意**: `bin/openspecx.js` 必须有执行权限。`postinstall` 脚本会自动设置。

#### 构建流程

1. **开发时**: `pnpm build` 编译 TypeScript 到 `dist/`
2. **发布时**: `prepublishOnly` 自动运行构建
3. **安装时**: `postinstall` 设置执行权限

### 项目目录结构

```
openspecx/
├── bin/
│   └── openspecx.js          # CLI 入口（可执行）
├── dist/                      # 编译后的代码
│   ├── cli/
│   ├── commands/
│   └── core/
├── src/                       # 源代码
├── package.json               # 包配置
├── tsconfig.json              # TypeScript 配置
└── build.js                   # 构建脚本
```

### 发布到 npm

#### 准备工作

1. **登录 npm**
   ```bash
   npm login
   ```

2. **检查当前用户**
   ```bash
   npm whoami
   ```

3. **检查版本**
   ```bash
   npm version
   ```

4. **更新版本（如需要）**
   ```bash
   npm version patch  # 0.1.0 -> 0.1.1
   npm version minor  # 0.1.0 -> 0.2.0
   npm version major  # 0.1.0 -> 1.0.0
   ```

#### 发布步骤

1. **测试打包**
   ```bash
   npm pack --dry-run
   ```
   这会显示将要打包的文件列表，不会实际创建文件。

2. **发布**
   ```bash
   npm publish
   ```
   
   **注意**：
   - 会自动运行 `prepublishOnly` 构建
   - 需要确保已登录且有发布权限
   - 包名必须是唯一的（`@fission-ai/openspecx`）

#### 发布后安装

```bash
npm install -g @fission-ai/openspecx
```

### 验证安装

```bash
# 检查版本
openspecx --version

# 查看帮助
openspecx --help

# 测试命令
openspecx init test/module test_rule
openspecx validate test/module/test_rule-RULE.md
```

### 开发者常见问题

#### 问题：命令未找到

1. 检查 PATH 环境变量
2. 检查 npm 全局 bin 目录
3. 确认安装成功: `npm list -g @fission-ai/openspecx`

#### 问题：权限问题

1. 检查 `bin/openspecx.js` 是否有执行权限
2. 运行 `chmod +x bin/openspecx.js`
3. 或使用 `postinstall` 脚本自动设置

#### 问题：构建错误

1. 确保 TypeScript 已安装: `pnpm install`
2. 检查 `tsconfig.json` 配置
3. 清理后重新构建: `rm -rf dist && pnpm build`

#### 问题：npm link 后命令未找到

如果使用 `npm link` 安装后命令未找到：

```bash
# 检查链接
npm list -g --link

# 如果使用 npm link 安装
npm unlink -g @fission-ai/openspecx

# 重新链接
pnpm link --global
```

### 注意事项

1. **Node.js 版本**: 要求 Node.js >= 20.19.0
2. **ESM 模块**: 使用 ES 模块（`"type": "module"`）
3. **执行权限**: `bin/openspecx.js` 必须有执行权限
4. **构建产物**: 确保 `dist/` 目录包含所有编译后的文件
5. **版本管理**: 发布前记得更新版本号
