# 本地安装脚本 - Windows PowerShell 版本
# 用于快速安装和测试

Write-Host "🔨 构建 OpenSpecX..." -ForegroundColor Cyan
pnpm build

Write-Host ""
Write-Host "📦 创建本地打包文件..." -ForegroundColor Cyan
npm pack

$packageFile = Get-ChildItem -Filter "@goodmood2008-openspecx-*.tgz" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($packageFile) {
    Write-Host ""
    Write-Host "✅ 打包完成: $($packageFile.Name)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📥 安装到全局..." -ForegroundColor Cyan
    npm install -g "./$($packageFile.Name)"
    
    Write-Host ""
    Write-Host "✅ 安装完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "验证安装:" -ForegroundColor Yellow
    openspecx --version
    
    Write-Host ""
    Write-Host "使用帮助:" -ForegroundColor Yellow
    openspecx --help
} else {
    Write-Host "❌ 未找到打包文件" -ForegroundColor Red
    exit 1
}

