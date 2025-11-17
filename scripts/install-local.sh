#!/bin/bash
# 本地安装脚本 - 用于快速安装和测试

set -e

echo "🔨 构建 OpenSpecX..."
pnpm build

echo ""
echo "📦 创建本地打包文件..."
npm pack

PACKAGE_FILE=$(ls -t fission-ai-openspecx-*.tgz | head -1)
echo ""
echo "✅ 打包完成: $PACKAGE_FILE"
echo ""
echo "📥 安装到全局..."
npm install -g "./$PACKAGE_FILE"

echo ""
echo "✅ 安装完成！"
echo ""
echo "验证安装:"
openspecx --version

echo ""
echo "使用帮助:"
openspecx --help


