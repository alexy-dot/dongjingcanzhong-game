# Git提交规范

为了保持项目历史的清晰和一致性，我们采用以下Git提交规范。

## 📝 提交信息格式

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的页脚]
```

### 类型（必需）

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码运行的变动）
- `refactor`: 代码重构（既不是新增功能，也不是修改bug的代码变动）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI/CD相关
- `build`: 构建系统或外部依赖的变动
- `revert`: 回滚到上一个版本

### 作用域（可选）

作用域用于说明提交影响的范围，例如：

- `feat(auth): 添加用户登录功能`
- `fix(ui): 修复按钮点击无响应问题`
- `docs(readme): 更新安装说明`

### 描述（必需）

- 使用祈使句，以动词开头
- 第一个字母小写
- 结尾不加句号
- 长度不超过50个字符

### 正文（可选）

- 用于详细描述提交的原因和影响
- 使用祈使句
- 可以包含多个段落

### 页脚（可选）

- 用于引用相关的Issue
- 格式：`Closes #123` 或 `Fixes #123`

## ✅ 好的提交信息示例

```
feat: 添加用户登录功能

- 实现用户名密码登录
- 添加登录状态管理
- 集成JWT认证

Closes #123
```

```
fix(ui): 修复按钮悬停效果

修复按钮在移动端悬停时显示异常的问题

Fixes #456
```

```
docs: 更新README安装说明

添加详细的开发环境搭建步骤
```

```
style: 统一代码缩进为2个空格

- HTML文件使用2个空格缩进
- CSS文件使用2个空格缩进
- JavaScript文件使用2个空格缩进
```

## ❌ 不好的提交信息示例

```
update
修复bug
添加功能
```

## 🔧 配置Git提交模板

### 1. 创建提交模板文件

创建文件 `.gitmessage`：

```
# <类型>[可选的作用域]: <描述>
# 
# [可选的正文]
# 
# [可选的页脚]
# 
# 类型说明:
#   feat: 新功能
#   fix: 修复bug
#   docs: 文档更新
#   style: 代码格式调整
#   refactor: 代码重构
#   perf: 性能优化
#   test: 测试相关
#   chore: 构建过程或辅助工具的变动
#   ci: CI/CD相关
#   build: 构建系统或外部依赖的变动
#   revert: 回滚到上一个版本
```

### 2. 配置Git使用模板

```bash
git config --global commit.template .gitmessage
```

### 3. 使用模板提交

```bash
git commit
```

Git会自动打开编辑器，显示模板内容，您只需要填写相应的信息。

## 🚀 自动化工具

### 1. Commitizen

安装Commitizen来规范化提交：

```bash
npm install -g commitizen
npm install -g cz-conventional-changelog
```

配置项目：

```bash
commitizen init cz-conventional-changelog --save-dev --save-exact
```

使用：

```bash
git cz
```

### 2. Husky + lint-staged

安装依赖：

```bash
npm install --save-dev husky lint-staged
```

配置package.json：

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "prettier --write"
    ]
  }
}
```

### 3. Conventional Changelog

自动生成CHANGELOG：

```bash
npm install --save-dev conventional-changelog-cli
```

生成CHANGELOG：

```bash
conventional-changelog -p angular -i CHANGELOG.md -s
```

## 📋 提交检查清单

在提交代码之前，请确保：

- [ ] 代码已经过测试
- [ ] 没有引入新的警告或错误
- [ ] 遵循项目的编码规范
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 提交信息符合规范

## 🔍 提交历史查看

### 查看提交历史

```bash
git log --oneline
```

### 查看特定类型的提交

```bash
git log --grep="^feat"
git log --grep="^fix"
```

### 查看提交统计

```bash
git shortlog -sn
```

## 📚 参考资料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format)
- [Commitizen](http://commitizen.github.io/cz-cli/)

---

遵循这些规范将帮助团队更好地协作，并保持项目历史的清晰性。
