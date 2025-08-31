@echo off
chcp 65001 >nul
title Alexy 个人网站启动器

echo 🚀 启动 Alexy 个人网站...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 检测到 Python，使用 Python 内置服务器启动...
    echo 🌐 网站将在 http://localhost:8000 启动
    echo 📱 支持移动端访问
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto :end
)

REM 检查Python3是否安装
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 检测到 Python3，使用 Python 内置服务器启动...
    echo 🌐 网站将在 http://localhost:8000 启动
    echo 📱 支持移动端访问
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    python3 -m http.server 8000
    goto :end
)

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 检测到 Node.js，使用 http-server 启动...
    echo 🌐 网站将在 http://localhost:8080 启动
    echo 📱 支持移动端访问
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    npx http-server -p 8080
    goto :end
)

echo ❌ 未检测到 Python 或 Node.js
echo.
echo 请安装以下任一环境：
echo 1. Python 3.x: https://www.python.org/downloads/
echo 2. Node.js: https://nodejs.org/
echo.
echo 或者手动打开 index.html 文件
echo.
pause
exit /b 1

:end
pause
