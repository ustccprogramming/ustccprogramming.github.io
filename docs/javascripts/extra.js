function patchSearchPlaceholder(node) {
  if (!node || !node.querySelectorAll) return;
  node.querySelectorAll("input[placeholder='Search']").forEach((input) => {
    input.placeholder = "搜索";
  });
  node.querySelectorAll("*").forEach((element) => {
    if (element.shadowRoot) patchSearchPlaceholder(element.shadowRoot);
  });
}

document.addEventListener("click", () => {
  requestAnimationFrame(() => patchSearchPlaceholder(document.body));
});
