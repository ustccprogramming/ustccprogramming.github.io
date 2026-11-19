---
date: 2026-11-19
categories:
  - 作业
---

# Lab 6 书面作业参考答案

单词统计与冒泡排序法的 C 参考程序和流程图。

<!-- more -->

## 1. 单词统计

从标准输入逐字符读取，直到遇到 `EOF`，输出单词总数。空格、制表符和换行符是分隔符，每一段连续的非分隔字符算一个单词。

### 参考代码

```c
#include <stdio.h>

int main(void) {
    int nw = 0;
    int state = 0;
    int c;

    c = getchar();
    while (c != EOF) {
        if (c == ' ' || c == '\t' || c == '\n') {
            state = 0;
        } else if (state == 0) {
            state = 1;
            nw++;
        }
        c = getchar();
    }

    printf("%d\n", nw);
    return 0;
}
```

### 流程图

```mermaid
flowchart TD
    Begin([开始]) --> Init["nw ← 0<br/>state ← 0"]
    Init --> Read[/"读入一个字符 c（getchar）"/]
    Read --> AtEnd{"c 等于 EOF？"}
    AtEnd -->|是| Print[/"输出单词数 nw"/]
    Print --> Finish([结束])
    AtEnd -->|否| Separator{"c 是空格、制表符<br/>或换行符？"}
    Separator -->|是| Outside["state ← 0"]
    Outside --> Read
    Separator -->|否| NewWord{"state 等于 0？"}
    NewWord -->|是| Count["state ← 1<br/>nw ← nw + 1"]
    Count --> Read
    NewWord -->|否| Read
```

`state` 为 `0` 表示在单词外，为 `1` 表示在单词内。读到新单词的第一个字符时计数一次，所以连续的分隔符不会多计，末尾没有分隔符的单词也不会漏计。

## 2. 冒泡排序法

先输入整数个数 `n`（`1 ≤ n ≤ 100`），再输入 `n` 个整数，依次存入 `a[0]` 到 `a[n - 1]`，最后按从小到大的顺序输出。课件中的 10 个整数取 `n = 10`。

### 参考代码

```c
#include <stdio.h>

int main(void) {
    int a[100];
    int n;
    int i, j, t;

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    for (i = 0; i < n - 1; i++) {
        for (j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                t = a[j];
                a[j] = a[j + 1];
                a[j + 1] = t;
            }
        }
    }

    printf("%d", a[0]);
    for (i = 1; i < n; i++) {
        printf(" %d", a[i]);
    }
    printf("\n");
    return 0;
}
```

### 流程图

```mermaid
flowchart TD
    Begin([开始]) --> Input[/"输入个数 n，再读入 n 个整数存入数组 a"/]
    Input --> InitPass["i ← 0"]
    InitPass --> MorePasses{"i ≤ n − 2？"}
    MorePasses -->|否| Print[/"依次输出 a[0] 到 a[n − 1]"/]
    Print --> Finish([结束])
    MorePasses -->|是| InitPair["j ← 0"]
    InitPair --> MorePairs{"j ≤ n − 2 − i？"}
    MorePairs -->|否| NextPass["i ← i + 1"]
    NextPass --> MorePasses
    MorePairs -->|是| Compare{"a[j] > a[j + 1]？"}
    Compare -->|是| Swap["t ← a[j]<br/>a[j] ← a[j + 1]<br/>a[j + 1] ← t"]
    Swap --> NextPair["j ← j + 1"]
    Compare -->|否| NextPair
    NextPair --> MorePairs
```

第 `i + 1` 趟从左向右比较相邻元素，共比较 `n - 1 - i` 次，把当前未排序部分的最大值移到 `a[n - 1 - i]`。共进行 `n - 1` 趟。
