@echo off
REM 本地安装脚本 - Windows 版本
REM 用于快速安装和测试

echo 🔨 构建 OpenSpecX...
call pnpm build

echo.
echo 📦 创建本地打包文件...
call npm pack

echo.
echo ✅ 打包完成
echo.
echo 📥 安装到全局...

REM 查找最新的 .tgz 文件
for /f "delims=" %%i in ('dir /b /o-d @goodmood2008-openspecx-*.tgz 2^>nul') do (
    set PACKAGE_FILE=%%i
    goto :found
)

:found
if defined PACKAGE_FILE (
    call npm install -g ".\%PACKAGE_FILE%"
    echo.
    echo ✅ 安装完成！
    echo.
    echo 验证安装:
    openspecx --version
    echo.
    echo 使用帮助:
    openspecx --help
) else (
    echo ❌ 未找到打包文件
    exit /b 1
)

