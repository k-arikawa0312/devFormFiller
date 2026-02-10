export interface PickResult {
  selector: string;
  label?: string;
}

export function pickElement(): Promise<PickResult> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "2147483647";
    overlay.style.border = "2px solid #2563eb";
    overlay.style.borderRadius = "6px";
    overlay.style.background = "rgba(37, 99, 235, 0.08)";
    overlay.style.boxShadow = "0 0 0 1px rgba(37,99,235,0.3)";
    document.documentElement.appendChild(overlay);

    let currentTarget: Element | null = null;

    const cleanup = () => {
      overlay.remove();
      window.removeEventListener("mousemove", handleMove, true);
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("keydown", handleKeydown, true);
    };

    const handleMove = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || !(target instanceof Element)) return;
      currentTarget = target;
      const rect = target.getBoundingClientRect();
      overlay.style.top = `${Math.max(rect.top, 0)}px`;
      overlay.style.left = `${Math.max(rect.left, 0)}px`;
      overlay.style.width = `${Math.max(rect.width, 0)}px`;
      overlay.style.height = `${Math.max(rect.height, 0)}px`;
    };

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const target = (event.target as Element | null) ?? currentTarget;
      const selector = target ? buildSelector(target) : "";
      const label = target ? buildLabel(target) : undefined;
      cleanup();
      resolve({ selector, label });
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cleanup();
        resolve({ selector: "" });
      }
    };

    window.addEventListener("mousemove", handleMove, true);
    window.addEventListener("click", handleClick, true);
    window.addEventListener("keydown", handleKeydown, true);
  });
}

function buildSelector(element: Element): string {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    const id = element.getAttribute("id");
    if (id) return `#${cssEscape(id)}`;

    const name = element.getAttribute("name");
    if (name) return `[name="${cssEscape(name)}"]`;

    const testId = element.getAttribute("data-testid");
    if (testId) return `[data-testid="${cssEscape(testId)}"]`;

    const placeholder = element.getAttribute("placeholder");
    if (placeholder) return `[placeholder="${cssEscape(placeholder)}"]`;

    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) return `[aria-label="${cssEscape(ariaLabel)}"]`;

    const type = element.getAttribute("type");
    if (type) return `input[type="${cssEscape(type)}"]`;
  }

  return buildNthOfTypeSelector(element);
}

function buildLabel(element: Element): string | undefined {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel;

    const placeholder = element.getAttribute("placeholder");
    if (placeholder) return placeholder;

    const name = element.getAttribute("name");
    if (name) return name;
  }

  return element.tagName.toLowerCase();
}

function buildNthOfTypeSelector(element: Element): string {
  const parent = element.parentElement;
  if (!parent) return element.tagName.toLowerCase();
  const siblings = Array.from(parent.children).filter(
    (child) => child.tagName === element.tagName,
  );
  const index = siblings.indexOf(element);
  const nth = index >= 0 ? index + 1 : 1;
  return `${element.tagName.toLowerCase()}:nth-of-type(${nth})`;
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, "\\$&");
}
