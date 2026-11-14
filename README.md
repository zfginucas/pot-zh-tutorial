# 看见最优传输

基于 [POT](https://pythonot.github.io/) 的原创中文交互教程：17 章、64 张原创图示、6 个交互实验、17 份可下载的 Python 脚本与 Notebook。

在线阅读：**https://zfginucas.github.io/pot-zh-tutorial/**

从质量搬运的直觉，到 Kantorovich、Wasserstein、对偶、Sinkhorn、重心、非平衡、GW、切片与研究复现。公式、代码和图示相互对照，不是官方文档的逐字翻译。

新增 [应用专题](https://zfginucas.github.io/pot-zh-tutorial/#topics)：2025–2026 正式顶会论文解读、空间转录组（PASTE、PASTE2、SpaOTsc、moscot、COMMOT），以及申请号 202310708881.1 的核验记录与空间基因教学模型。尚未取得该专利的原始说明书，不把教学算法冒充专利实现。

各章节在概念对应段落插图；下载合集包含 `figures/`，Markdown 手册和 Notebook 均引用同一组 SVG。完整解压后保持目录结构，即可离线查看。

## 本地运行

需要 Node.js 22+ 与 Python 3.13（代码基线环境）。

```sh
npm ci
npm run build
npm run preview
```

打开 http://localhost:4173 。公式字体与脚本随站点打包，页面运行不依赖外部 CDN。

## 运行 Python 示例

```sh
python -m venv .venv
# Windows PowerShell
.venv/Scripts/Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/validate_examples.py
```

验证器需要 `.work/` 目录（本地 `mkdir .work`，CI 会自动建立）。

## 修改与验证

章节数据位于 `content/`；交互算法在 `assets/math.js`；页面与实验在 `assets/app.js`、`assets/labs.js`。`scripts/build.py` 生成 `dist/`、Notebook 与整本 Markdown，不会上传开发环境。

```sh
npm test
python scripts/validate_examples.py
npm run build
```

推送 `main` 后由 GitHub Actions 验证并部署 GitHub Pages。

规划见 [PLAN.md](docs/PLAN.md)，验证记录见 [AUDIT.md](docs/AUDIT.md)。

## 许可与来源

原创代码：MIT。原创教程内容（`content/` 及生成的手册正文）：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)，署名“看见最优传输贡献者”。POT、KaTeX 与论文等第三方作品保留其各自许可。每章引用官方 API 或论文。未复制官方图片。

内容初稿借助用户本地 Claude Code 生成；交互实现、数学审计与代码验证由 Codex 协作完成。AI 辅助内容仍可能有疏漏，欢迎通过 Issues 提供可复现实例。
