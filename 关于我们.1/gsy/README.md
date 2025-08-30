# Alexy 个人网站

一个现代化、响应式的个人网站，专为北京理工大学2024级人工智能专业本科生设计。

## ✨ 特性

### 🎨 现代化设计
- 采用现代化的UI设计风格
- 渐变色彩搭配和精美的视觉效果
- 响应式设计，支持各种设备
- 流畅的动画和过渡效果

### 🚀 功能完整
- **个人主页**: 展示个人信息和专业技能
- **博客系统**: 按时间顺序展示技术文章，支持分类筛选
- **学习笔记**: 五大分类（数据结构与算法、深度学习、机器人、人工智能、读书分享）
- **兴趣爱好**: 展示个人生活爱好和特长
- **朋友页面**: 展示朋友信息，支持跳转到朋友主页
- **联系表单**: 提供留言功能，方便交流

### 🎭 丰富的动画效果
- 页面切换动画
- 滚动触发动画
- 悬停交互效果
- 粒子背景效果
- 3D变换效果
- 打字机效果

### 📱 移动端优化
- 完全响应式设计
- 移动端友好的导航菜单
- 触摸优化的交互体验

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: CSS Grid, Flexbox, CSS Variables
- **动画**: CSS Animations, CSS Transitions
- **图标**: Font Awesome 6.0
- **字体**: Google Fonts (Inter)

## 📁 项目结构

```
personal-website/
├── index.html              # 主页面
├── styles/                 # 样式文件
│   ├── main.css           # 主要样式
│   └── animations.css     # 动画样式
├── scripts/               # JavaScript文件
│   ├── main.js           # 主要功能
│   └── animations.js     # 动画管理
├── assets/               # 资源文件
│   └── images/          # 图片资源
│       ├── blog/        # 博客图片
│       └── friends/     # 朋友头像
└── README.md            # 项目说明
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd personal-website
```

### 2. 本地运行
由于这是一个纯前端项目，你可以：

**方法1: 使用Python内置服务器**
```bash
python -m http.server 8000
```

**方法2: 使用Node.js的http-server**
```bash
npx http-server
```

**方法3: 使用Live Server (VS Code插件)**
在VS Code中安装Live Server插件，右键index.html选择"Open with Live Server"

### 3. 访问网站
打开浏览器访问 `http://localhost:8000`

## 🎯 自定义配置

### 修改个人信息
编辑 `index.html` 文件中的相关内容：
- 姓名和学校信息
- 个人描述
- 技能标签
- 联系方式

### 添加博客文章
在 `scripts/main.js` 中的 `loadBlogPosts()` 方法中添加新的博客文章数据。

### 添加朋友信息
在 `scripts/main.js` 中的 `loadFriends()` 方法中添加新的朋友数据。

### 修改样式
编辑 `styles/main.css` 文件来自定义颜色、字体、布局等样式。

### 添加动画
使用 `styles/animations.css` 中预定义的动画类，或在 `scripts/animations.js` 中创建新的动画效果。

## 🎨 设计特色

### 色彩方案
- **主色调**: 蓝紫色渐变 (#6366f1 → #764ba2)
- **辅助色**: 粉紫色渐变 (#f093fb → #f5576c)
- **强调色**: 蓝色渐变 (#4facfe → #00f2fe)

### 布局设计
- 使用CSS Grid和Flexbox实现灵活的布局
- 卡片式设计，信息层次清晰
- 响应式网格系统，自动适应不同屏幕尺寸

### 交互体验
- 平滑的页面切换
- 悬停效果和微动画
- 滚动触发的元素进入动画
- 直观的导航反馈

## 📱 响应式断点

- **桌面端**: 1200px+
- **平板端**: 768px - 1199px
- **手机端**: 480px - 767px
- **小屏手机**: < 480px

## 🔧 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🚀 部署建议

### GitHub Pages
1. 将项目推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择主分支作为源

### Netlify
1. 将项目推送到GitHub
2. 在Netlify中连接GitHub仓库
3. 自动部署和更新

### Vercel
1. 将项目推送到GitHub
2. 在Vercel中导入项目
3. 自动部署和CDN加速

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 开发流程
1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 邮箱: alexy@example.com
- GitHub: [alexy-dot](https://github.com/alexy-dot)

## 🙏 致谢

- Font Awesome 提供的图标
- Google Fonts 提供的字体
- 所有为这个项目做出贡献的朋友

---

**享受你的个人网站之旅！** 🎉
