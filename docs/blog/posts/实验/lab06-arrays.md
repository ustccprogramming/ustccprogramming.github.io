---
date: 2026-11-24
categories:
  - 实验
---

# Lab 6：一维数组的排序、查找与插入

下面的三个 C 程序分别完成一道题，每段代码可单独编译运行。

<!-- more -->

## 1. 选择排序（课件中的“改进冒泡排序”）

每一趟先找出未排序部分最小元素的下标，再把该元素换到这一趟的起始位置。10 个整数共排 9 趟。

```c
#include <stdio.h>

int main(void) {
    int a[10];
    for (int i = 0; i < 10; i++) {
        scanf("%d", &a[i]);
    }

    for (int i = 0; i < 9; i++) {
        int min_index = i;
        for (int j = i + 1; j < 10; j++) {
            if (a[j] < a[min_index]) {
                min_index = j;
            }
        }
        if (min_index != i) {
            int temp = a[i];
            a[i] = a[min_index];
            a[min_index] = temp;
        }
    }

    printf("%d", a[0]);
    for (int i = 1; i < 10; i++) {
        printf(" %d", a[i]);
    }
    printf("\n");
    return 0;
}
```

## 2. 有序数组的折半查找

每次比较查找区间的中间元素。遇到相等值就输出当前下标，即使数组中有重复值也立即结束。区间为空时输出 `NotFound`。

```c
#include <stdio.h>

int main(void) {
    int a[10], x;
    int left = 0, right = 9;

    for (int i = 0; i < 10; i++) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &x);

    while (left <= right) {
        int mid = (left + right) / 2;
        if (a[mid] == x) {
            printf("%d\n", mid);
            return 0;
        }
        if (a[mid] < x) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    printf("NotFound\n");
    return 0;
}
```

## 3. 在有序数组中插入一个整数

数组第 11 个位置留给插入操作。从末尾向前，把比 `x` 大的元素逐个右移一位，最后将 `x` 写入空出的位置。

```c
#include <stdio.h>

int main(void) {
    int a[11], x;
    for (int i = 0; i < 10; i++) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &x);

    int pos = 10;
    while (pos > 0 && a[pos - 1] > x) {
        a[pos] = a[pos - 1];
        pos--;
    }
    a[pos] = x;

    printf("%d", a[0]);
    for (int i = 1; i < 11; i++) {
        printf(" %d", a[i]);
    }
    printf("\n");
    return 0;
}
```
