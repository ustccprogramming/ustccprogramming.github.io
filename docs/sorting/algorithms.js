export const algorithms = {
  bubble: {
    name: "冒泡排序",
    principle: "一趟结束后，未排序部分的最大值到达最右端。下一趟就少比较一个位置。",
    sortedLabel: "已归位",
    markers: [["compare", "在比较"], ["operation", "互换位置"]],
    code: [
      "int i, j, t;",
      "",
      "for (i = 0; i < n - 1; i++) {",
      "    for (j = 0; j < n - 1 - i; j++) {",
      "        if (a[j] > a[j + 1]) {",
      "            t = a[j];",
      "            a[j] = a[j + 1];",
      "            a[j + 1] = t;",
      "        }",
      "    }",
      "}",
    ],
    lines: { compare: [5], swap: [6, 7, 8] },
    run: bubbleSort,
  },
  selection: {
    name: "选择排序",
    principle: "从未排序部分中找出最小值，与这部分的第一个元素交换。每趟最多交换一次。",
    sortedLabel: "已归位",
    markers: [["compare", "在比较"], ["key", "当前最小"], ["operation", "互换位置"]],
    code: [
      "int i, j, min, t;",
      "",
      "for (i = 0; i < n - 1; i++) {",
      "    min = i;",
      "    for (j = i + 1; j < n; j++) {",
      "        if (a[j] < a[min]) {",
      "            min = j;",
      "        }",
      "    }",
      "    if (min != i) {",
      "        t = a[i];",
      "        a[i] = a[min];",
      "        a[min] = t;",
      "    }",
      "}",
    ],
    lines: { check: [10], mark: [4], update: [7], compare: [6], swap: [11, 12, 13] },
    run: selectionSort,
  },
  insertion: {
    name: "插入排序",
    principle: "每趟从左边的有序部分给新元素找位置。只右移比它大的元素，最后把它填到空位。",
    sortedLabel: "有序元素",
    markers: [["compare", "在比较"], ["key", "暂存值"], ["operation", "右移或插入"]],
    code: [
      "int i, j, key;",
      "",
      "for (i = 1; i < n; i++) {",
      "    key = a[i];",
      "    j = i - 1;",
      "    while (j >= 0 && a[j] > key) {",
      "        a[j + 1] = a[j];",
      "        j--;",
      "    }",
      "    a[j + 1] = key;",
      "}",
    ],
    lines: { take: [4, 5], compare: [6], shift: [7, 8], insert: [10] },
    run: insertionSort,
  },
};

export const actions = {
  ready: "就绪",
  compare: "比较",
  swap: "交换",
  mark: "记录候选值",
  update: "更新最小值",
  check: "检查位置",
  take: "取出暂存",
  shift: "向右移动",
  insert: "填入空位",
  pass: "一趟结束",
  done: "排序完成",
};

export function buildSteps(algorithm, values) {
  // 用原始下标标识元素，相同数值的柱子也能各自移动。
  const items = values.map((value, id) => ({ value, id }));
  const state = {
    items,
    comparisons: 0,
    writes: 0,
    sortedStart: 0,
    sortedEnd: algorithm === "insertion" ? 1 : 0,
    held: null,
  };
  const steps = [];

  function save(action, message, highlights = {}) {
    steps.push({ ...state, items: [...items], action, message, ...highlights });
  }

  const instruction = algorithm === "insertion"
    ? "左边只有一个元素时已经有序。下一步取出 a[1]，给它找位置。"
    : "点击播放，或用「下一步」开始这一趟。";
  save("ready", instruction);
  algorithms[algorithm].run(state, save);

  state.sortedStart = 0;
  state.sortedEnd = items.length;
  save("done", "整个数组已经按从小到大的顺序排好。试试用同一组数据切换算法。");
  return steps;
}

function exchange(state, first, second) {
  const { items } = state;
  const temporary = items[first];
  items[first] = items[second];
  items[second] = temporary;
  state.writes += 2;
}

function bubbleSort(state, save) {
  const { items } = state;
  state.sortedStart = items.length;
  state.sortedEnd = items.length;

  for (let end = items.length - 1; end > 0; end--) {
    for (let j = 0; j < end; j++) {
      const left = items[j].value;
      const right = items[j + 1].value;
      const positions = [j, j + 1];
      state.comparisons++;
      save("compare", `比较 a[${j}] = ${left} 和 a[${j + 1}] = ${right}。${left > right ? "左边较大，下一步交换。" : "顺序正确，保持原位。"}`, { compared: positions });
      if (left > right) {
        exchange(state, j, j + 1);
        save("swap", `交换这两个元素，${left} 向右移一格。`, { moved: positions });
      }
    }
    state.sortedStart = end;
    save("pass", `这一趟的最大值 ${items[end].value} 已到达 a[${end}]。`);
  }
}

function selectionSort(state, save) {
  const { items } = state;

  for (let i = 0; i < items.length - 1; i++) {
    let min = i;
    save("mark", `从 a[${i}] 开始找最小值，暂时记下 ${items[i].value}。`, { candidate: min });
    for (let j = i + 1; j < items.length; j++) {
      const smaller = items[j].value < items[min].value;
      state.comparisons++;
      save("compare", `比较 a[${j}] = ${items[j].value} 与当前最小值 ${items[min].value}。${smaller ? "发现了更小的值。" : "当前最小位置不变。"}`, { compared: [j], candidate: min });
      if (smaller) {
        min = j;
        save("update", `把 a[${min}] = ${items[min].value} 记为当前最小值。`, { candidate: min });
      }
    }
    if (min !== i) {
      const minimum = items[min].value;
      exchange(state, i, min);
      save("swap", `把最小值 ${minimum} 从 a[${min}] 换到 a[${i}]。`, { moved: [i, min] });
    } else {
      save("check", `最小值已经在 a[${i}]，这一趟跳过交换。`, { candidate: i });
    }
    state.sortedEnd = i + 1;
    save("pass", `a[${i}] = ${items[i].value} 已经归位。`);
  }
}

function insertionSort(state, save) {
  const { items } = state;

  for (let i = 1; i < items.length; i++) {
    const key = items[i];
    state.held = key;
    state.sortedEnd = i + 1;
    items[i] = null;
    save("take", `把 a[${i}] = ${key.value} 暂存到 key，图中用虚线标出空位。`);

    let j = i - 1;
    while (j >= 0) {
      const value = items[j].value;
      state.comparisons++;
      save("compare", `比较 a[${j}] = ${value} 和 key = ${key.value}。${value > key.value ? "这个元素更大，下一步向右移动。" : "它小于或等于 key，可以在它右边插入。"}`, { compared: [j] });
      if (value <= key.value) {
        break;
      }
      items[j + 1] = items[j];
      items[j] = null;
      state.writes++;
      save("shift", `把 ${value} 从 a[${j}] 移到 a[${j + 1}]，空位向左移一格。`, { moved: [j + 1] });
      j--;
    }

    items[j + 1] = key;
    state.held = null;
    state.writes++;
    save("insert", `把 key = ${key.value} 填入 a[${j + 1}]。现在 a[0] 到 a[${i}] 有序。`, { moved: [j + 1] });
  }
}
