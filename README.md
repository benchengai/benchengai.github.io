# Ben Cheng · 个人网站

纯静态网站（HTML + CSS + 少量 JS），没有任何构建步骤或依赖。

```
index.html              全部内容
assets/css/style.css    样式（深色/浅色主题的颜色都在文件顶部的变量里）
assets/js/main.js       动画与交互
assets/demos/           放 demo 截图或视频
assets/img/favicon.svg  网站图标
```

## 本地预览

```bash
cd personal-website && python3 -m http.server 8765
```

然后打开 http://localhost:8765

## 填充 5 个 demo

在 `index.html` 里搜索 `DEMO 1` … `DEMO 5`，每个 demo 改三处：

1. **画面**：把 `<div class="demo-placeholder">…</div>` 整块换成截图或短视频（建议 16:9，视频不超过 10 MB）：
   ```html
   <img src="assets/demos/elicitsense.png" alt="ElicitSense requirements register">
   <!-- 或 -->
   <video src="assets/demos/elicitsense.mp4" poster="assets/demos/elicitsense.jpg" autoplay muted loop playsinline></video>
   ```
2. **链接**：把 `href=""` 填上网址。`href` 为空的按钮会自动显示成灰色的 “Soon”，填了就自动变成可点击（外链会在新标签页打开）。
3. **状态**：把 `In development` 改成 `Live`，并把 `badge-dev` 改成 `badge-live`（绿色）。

## JSS 论文上线后

在 Publications 部分找到 `DOI` 按钮，把 `href=""` 填成 `https://doi.org/...`。如果最终作者列表确定了，也可以把 `Ben Cheng et al.` 换成完整作者。

## 加 LinkedIn / GitHub / Google Scholar

在 Contact 部分有一段注释好的模板，取消注释并填上你的链接即可。

## 发布到 GitHub Pages（免费）

1. 在 GitHub 新建仓库，名字用 `你的用户名.github.io`。
2. 把这个文件夹的内容推上去：
   ```bash
   cd personal-website
   git init && git add . && git commit -m "Personal website"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
   git push -u origin main
   ```
3. 仓库 Settings → Pages → Source 选 `main` 分支，几分钟后网址就是 `https://你的用户名.github.io`。

改了 CSS/JS 之后，把 `index.html` 里 `style.css?v=6`、`main.js?v=6` 的数字加 1，避免访客浏览器用旧缓存。

## 加回 CV 下载

网站目前不提供 CV 下载（原版 CV 含电话号码，仓库是公开的），联系区写的是 “CV available on request”。
想加回来时：

1. 准备一份**去掉电话号码**的 CV，存为 `files/Ben_Cheng_CV.pdf`。
2. 在 `index.html` 的 Contact 部分，取消注释那行 `CV (PDF)` 链接，删掉 “CV available on request” 那行。
3. 提交并推送。

注意：任何推送到公开仓库的文件都会留在 git 历史里，删掉也能被找回，所以只推送你愿意公开的版本。
