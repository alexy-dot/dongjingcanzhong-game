#!/bin/bash

# Alexy 个人网站启动脚本

echo "🚀 启动 Alexy 个人网站..."
echo ""

# 检查Python是否安装
if command -v python3 &> /dev/null; then
    echo "✅ 检测到 Python3，使用 Python 内置服务器启动..."
    echo "🌐 网站将在 http://localhost:8000 启动"
    echo "📱 支持移动端访问"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 检测到 Python，使用 Python 内置服务器启动..."
    echo "🌐 网站将在 http://localhost:8000 启动"
    echo "📱 支持移动端访问"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python -m http.server 8000
elif command -v node &> /dev/null; then
    echo "✅ 检测到 Node.js，使用 http-server 启动..."
    echo "🌐 网站将在 http://localhost:8080 启动"
    echo "📱 支持移动端访问"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    npx http-server -p 8080
else
    echo "❌ 未检测到 Python 或 Node.js"
    echo ""
    echo "请安装以下任一环境："
    echo "1. Python 3.x: https://www.python.org/downloads/"
    echo "2. Node.js: https://nodejs.org/"
    echo ""
    echo "或者手动打开 index.html 文件"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi
