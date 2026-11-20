import { actions, algorithms, buildSteps } from "./algorithms.js";

const elements = Object.fromEntries(
  [...document.querySelectorAll("[id]")].map((element) => [element.id, element]),
);
const algorithmButtons = [...document.querySelectorAll("[data-algorithm]")];
const sample = [54, 28, 76, 42, 63, 18, 88, 36];
const presets = {
  nearly: [18, 28, 36, 42, 54, 76, 63, 88],
  reverse: [...sample].sort((a, b) => b - a),
  duplicates: [42, 42, 18, 68, 28, 68, 52, 36],
};

let values = sample;
let algorithm = "bubble";
let traces;
let index = 0;
let playing = false;
let timer;
let bars = [];
let slots = [];
let suffixes = [];

function node(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}

function identifyDuplicates() {
  const totals = new Map();
  const seen = new Map();
  for (const value of values) {
    totals.set(value, (totals.get(value) ?? 0) + 1);
  }
  suffixes = values.map((value) => {
    if (totals.get(value) === 1) return "";
    const count = seen.get(value) ?? 0;
    seen.set(value, count + 1);
    return String.fromCharCode(97 + count);
  });
  elements["duplicate-note"].hidden = suffixes.every((suffix) => !suffix);
}

function prepareChart() {
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const span = maximum - minimum || 1;
  const baseline = 100 * (-minimum / span);
  elements["zero-line"].style.bottom = `${baseline}%`;
  elements.chart.style.setProperty("--count", values.length);
  elements.chart.style.minWidth = `${2 + values.length * 2.24}rem`;

  const indices = values.map((_, i) => node("span", i, "index"));
  slots = values.map((_, position) => {
    const hole = node("span", "空位", "hole");
    hole.style.gridColumn = position + 1;
    return hole;
  });
  bars = values.map((value, id) => {
    const bar = node("div", "", "bar");
    const number = node("span", value, "bar-value");
    if (suffixes[id]) number.append(node("sub", suffixes[id], "suffix"));

    bar.classList.toggle("negative", value < 0);
    bar.classList.toggle("zero", value === 0);
    bar.style.bottom = `${100 * ((Math.min(0, value) - minimum) / span)}%`;
    bar.style.height = `${100 * (Math.abs(value) / span)}%`;
    bar.append(number);
    return bar;
  });
  elements.indices.replaceChildren(...indices);
  elements.slots.replaceChildren(...slots);
  elements.bars.replaceChildren(...bars);
}

function renderChart(step) {
  const { items, held } = step;
  if (held) {
    bars[held.id].classList.add("parked");
    elements.held.textContent = `暂存 key = ${held.value}${suffixes[held.id]}`;
  }
  elements.held.hidden = held === null;
  elements.held.classList.toggle("is-compared", step.action === "compare");

  items.forEach((item, position) => {
    slots[position].hidden = item !== null;
    if (!item) return;
    const bar = bars[item.id];
    bar.style.left = `${100 * ((position + 0.5) / items.length)}%`;
    bar.classList.remove("parked");
    bar.classList.toggle("sorted", position >= step.sortedStart && position < step.sortedEnd);
    bar.classList.toggle("operation", step.moved?.includes(position) ?? false);
    bar.classList.toggle("compared", step.compared?.includes(position) ?? false);
    bar.classList.toggle("candidate", step.candidate === position);
  });
  elements["array-summary"].textContent = `当前数组：${items.map((item) => item ? item.value + suffixes[item.id] : "空位").join("，")}。`;
}

function renderCode() {
  const lines = algorithms[algorithm].code.map((source, index) => {
    const line = node("span", "", "code-line");
    const number = node("span", index + 1, "line-number");
    number.setAttribute("aria-hidden", "true");
    const content = node("span", "", "code-text");
    for (const [position, token] of source.split(/(\b(?:int|for|if|while)\b|\b\d+\b)/).entries()) {
      if (position % 2 === 0) {
        content.append(token);
      } else {
        content.append(node("span", token, /^\d/.test(token) ? "literal" : "keyword"));
      }
    }
    line.append(number, content);
    return line;
  });
  elements.code.replaceChildren(...lines);
}

function renderAlgorithm() {
  const info = algorithms[algorithm];
  for (const button of algorithmButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.algorithm === algorithm));
  }
  elements["algorithm-title"].textContent = info.name;
  elements.principle.textContent = info.principle;

  const markers = [...info.markers, ["sorted", info.sortedLabel]];
  elements.legend.replaceChildren(...markers.map(([kind, label]) => {
    const entry = node("li", "", "");
    entry.append(node("span", "", `swatch ${kind}`), label);
    return entry;
  }));

  renderCode();
  const rows = Object.entries(algorithms).map(([name, entry]) => {
    const final = traces[name].at(-1);
    const row = node("tr", "", name === algorithm ? "selected" : "");
    const header = node("th", entry.name, "");
    header.scope = "row";
    row.append(header, node("td", final.comparisons, ""), node("td", final.writes, ""));
    return row;
  });
  elements.comparison.replaceChildren(...rows);
}

function render() {
  const steps = traces[algorithm];
  const step = steps[index];
  const last = steps.length - 1;
  const position = `${index} / ${last} 步`;

  renderChart(step);
  const highlighted = algorithms[algorithm].lines[step.action] ?? [];
  Array.from(elements.code.children).forEach((line, number) => {
    line.classList.toggle("highlighted", highlighted.includes(number + 1));
  });

  elements.action.textContent = actions[step.action];
  elements.action.dataset.action = step.action;
  elements.explanation.textContent = step.message;
  elements.comparisons.textContent = step.comparisons;
  elements.writes.textContent = step.writes;
  elements.timeline.max = last;
  elements.timeline.value = index;
  elements.timeline.setAttribute("aria-valuetext", position);
  elements.position.value = position;
  elements.restart.disabled = index === 0 && !playing;
  elements.previous.disabled = index === 0;
  elements.next.disabled = index === last;
  elements.play.textContent = playing ? "暂停" : index === last ? "重播" : "播放";
}

function pause() {
  clearTimeout(timer);
  playing = false;
}

function goTo(position) {
  pause();
  index = position;
  render();
}

function scheduleStep() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    index++;
    if (index === traces[algorithm].length - 1) pause();
    render();
    if (playing) scheduleStep();
  }, Number(elements.speed.value));
}

function applyValues(nextValues) {
  pause();
  values = nextValues;
  index = 0;
  traces = Object.fromEntries(Object.keys(algorithms).map((name) => [name, buildSteps(name, values)]));
  elements["data-input"].value = values.join(", ");
  clearInputError();
  identifyDuplicates();
  prepareChart();
  renderAlgorithm();
  render();
}

function clearInputError() {
  elements["data-input"].removeAttribute("aria-invalid");
  elements["data-error"].hidden = true;
  elements["data-error"].textContent = "";
}

for (const button of algorithmButtons) {
  button.addEventListener("click", () => {
    if (algorithm === button.dataset.algorithm) return;
    algorithm = button.dataset.algorithm;
    pause();
    index = 0;
    renderAlgorithm();
    render();
  });
}

for (const button of document.querySelectorAll("[data-preset]")) {
  button.addEventListener("click", () => {
    const preset = button.dataset.preset;
    const nextValues = preset === "random"
      ? Array.from({ length: sample.length }, () => 10 + Math.floor(Math.random() * 81))
      : presets[preset];
    applyValues(nextValues);
  });
}

elements["data-form"].addEventListener("submit", (event) => {
  event.preventDefault();
  const input = elements["data-input"];
  const tokens = input.value.trim().split(/[\s,，、]+/);
  const numbers = tokens.map(Number);
  if (tokens.length < 2 || tokens.length > 12
      || tokens.some((token) => !/^[+-]?\d+$/.test(token))
      || numbers.some((number) => Math.abs(number) > 99)) {
    input.setAttribute("aria-invalid", "true");
    elements["data-error"].textContent = "请检查元素个数和数值范围，再试一次。";
    elements["data-error"].hidden = false;
    input.focus();
    return;
  }
  applyValues(numbers);
});
elements["data-input"].addEventListener("input", clearInputError);
elements.timeline.addEventListener("input", () => goTo(Number(elements.timeline.value)));
elements.restart.addEventListener("click", () => goTo(0));
elements.previous.addEventListener("click", () => goTo(index - 1));
elements.next.addEventListener("click", () => goTo(index + 1));
elements.speed.addEventListener("change", () => {
  if (playing) scheduleStep();
});
elements.play.addEventListener("click", () => {
  if (playing) {
    pause();
  } else {
    if (index === traces[algorithm].length - 1) index = 0;
    playing = true;
    scheduleStep();
  }
  render();
});

applyValues(sample);
