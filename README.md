# 贪吃蛇 · Snake Arcade

一个可在电脑和手机浏览器中游玩的静态贪吃蛇游戏。

点击「开始游戏」，用键盘方向键、屏幕上的箭头或在棋盘上滑动来转向。每吃到一份食物，蛇会长一格并获得 1 分。撞到墙壁或自己的身体就结束，点击「重新开始」可立刻开新局。最高分保存在当前浏览器中。

## 本地运行

在浏览器中打开 [dist/index.html](dist/index.html) 即可游玩。游戏由 HTML、CSS 和 JavaScript 组成，无需安装依赖或构建。棋盘、蛇和食物由 Canvas 绘制，页面不需要额外的图片或音频文件。

## 部署到 GitHub Pages

1. 在 GitHub 创建一个空的公开仓库，将项目的 `dist/`、`.github/workflows/pages.yml` 和本 README 提交到 `main`。仓库根目录应同时包含 `.github/` 和 `dist/`。
2. 在仓库的 **Settings → Pages → Build and deployment** 中，将 **Source** 设为 **GitHub Actions**。
3. 在 **Actions → Deploy to GitHub Pages** 中，选择 **Run workflow** 并使用 `main`。也可以在启用 Pages 后推送一次 `main` 来触发部署。
4. 工作流成功后，在 **Settings → Pages** 查看并打开上线地址。普通项目仓库的网址通常为 `https://<用户名>.github.io/<仓库名>/`。

工作流只上传 `dist/`，其中的 `index.html` 成为站点入口。CSS 和 JavaScript 使用同级相对路径，可在仓库子路径下加载。以后推送到 `main` 会自动更新网站。

参见 [GitHub Pages 发布来源配置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
