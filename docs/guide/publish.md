# 发布一篇答案

一篇答案就是 `docs/blog/posts/` 里的一个 Markdown 文件。推送到 `main` 分支后，GitHub Actions 会构建站点并发布到 <https://ustccprogramming.github.io/>。

!!! warning "不要提前把答案推进公开仓库"

    这个仓库是公开的。`draft: true` 只会让正式构建跳过该页，GitHub 上仍然能直接读到源文件。评阅结束、确定可以公开之前，不要提交那篇答案。

## 1. 新建文章

文件名会成为网址。例如 `docs/blog/posts/lab03-piecewise.md` 发布后位于：

`https://ustccprogramming.github.io/blog/lab03-piecewise/`

分类建议只用这三个：`实验`、`作业`、`公告`。

````markdown
---
date: 2026-10-30
categories:
  - 实验
---

# 实验 3：分段函数求值

用一两句话说明这题在考什么。这段文字会出现在答案列表里。

<!-- more -->

## 题意

写清输入、输出和边界。

## 思路

说明分支或循环为什么这样写。

## 参考代码

```c
#include <stdio.h>

int main(void) {
    return 0;
}
```

## 易错点

- 越界和格式各自怎么处理。
````

`<!-- more -->` 之前是摘要，之后才是完整解答。需要本地预览、但还不能出现在正式网站时，在前言里加上 `draft: true`，预览完再删掉。置顶一篇公告可以用 `pin: true`。

## 2. 本地预览

在仓库根目录执行：

```sh
pip install -r requirements.txt
zensical serve
```

浏览器打开 <http://127.0.0.1:8000/>。保存 Markdown 后页面会自动刷新。

## 3. 推送发布

确认答案可以公开后，提交并推送到 `main`。Actions 里的 Documentation 工作流会安装 Zensical、构建 `site/`，再部署到 GitHub Pages。`site/` 不要提交。

仓库名必须是 `ustccprogramming.github.io`，页面才会出现在组织主页而不是项目子路径下。
