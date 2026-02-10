import { faker } from "@faker-js/faker";
import type {
  FieldRule,
  FieldType,
  FormPreset,
  InjectionResult,
} from "../lib/types";

export interface InjectOptions {
  allowBatchYield?: boolean;
  batchSize?: number;
}

const DEFAULT_OPTIONS: Required<InjectOptions> = {
  allowBatchYield: true,
  batchSize: 8,
};

export async function injectPreset(
  preset: FormPreset,
  options: InjectOptions = {},
): Promise<InjectionResult[]> {
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
  const results: InjectionResult[] = [];

  for (let i = 0; i < preset.fields.length; i += 1) {
    const rule = preset.fields[i];
    const result = injectField(rule);
    results.push(result);

    if (
      resolvedOptions.allowBatchYield &&
      (i + 1) % resolvedOptions.batchSize === 0
    ) {
      await nextFrame();
    }
  }

  if (preset.autoSubmit) {
    submitNearestForm();
  }

  return results;
}

export function injectField(rule: FieldRule): InjectionResult {
  const element = findElement(rule.selector);
  if (!element) {
    return {
      fieldId: rule.id,
      matched: false,
      selectorTried: rule.selector,
      reason: "element-not-found",
    };
  }

  const value = buildValue(rule);
  const applied = applyValue(element, rule.type, value);

  if (!applied) {
    return {
      fieldId: rule.id,
      matched: false,
      selectorTried: rule.selector,
      reason: "unsupported-element-or-type",
    };
  }

  return {
    fieldId: rule.id,
    matched: true,
    selectorTried: rule.selector,
  };
}

function findElement(
  selector: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  const trimmed = selector.trim();
  if (!trimmed) return null;

  const byCss = safeQuerySelector(selector);
  if (byCss) return byCss;

  const byExact = findByExactAttributes(trimmed);
  if (byExact) return byExact;

  const byType = findByInputType(trimmed);
  if (byType) return byType;

  const byAria = findByAriaLabel(trimmed);
  if (byAria) return byAria;

  const byData = findByDataAttributes(trimmed);
  if (byData) return byData;

  const byLabel = findByLabelText(trimmed);
  if (byLabel) return byLabel;

  const byPartial = findByPartialAttributes(trimmed);
  if (byPartial) return byPartial;

  const byLabelPartial = findByLabelContains(trimmed);
  if (byLabelPartial) return byLabelPartial;

  return null;
}

function safeQuerySelector(
  selector: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  try {
    return document.querySelector(selector) as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | null;
  } catch {
    return null;
  }
}

function findByExactAttributes(
  selector: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  const byName = document.querySelector(`[name="${cssEscape(selector)}"]`) as
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement
    | null;
  if (byName) return byName;

  const byId = document.getElementById(selector) as
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement
    | null;
  if (byId) return byId;

  const byPlaceholder = document.querySelector(
    `[placeholder="${cssEscape(selector)}"]`,
  ) as HTMLInputElement | HTMLTextAreaElement | null;
  if (byPlaceholder) return byPlaceholder;

  const byAutocomplete = document.querySelector(
    `[autocomplete="${cssEscape(selector)}"]`,
  ) as HTMLInputElement | HTMLTextAreaElement | null;
  if (byAutocomplete) return byAutocomplete;

  return null;
}

function findByInputType(
  selector: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  if (!isSimpleToken(selector)) return null;
  return document.querySelector(
    `input[type="${cssEscape(selector)}"]`,
  ) as HTMLInputElement | null;
}

function findByAriaLabel(
  selector: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  return document.querySelector(
    `[aria-label="${cssEscape(selector)}"]`,
  ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
}

function findByDataAttributes(
  selector: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  return document.querySelector(
    `[data-testid="${cssEscape(selector)}"], [data-test="${cssEscape(
      selector,
    )}"]`,
  ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
}

function findByLabelText(
  text: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  const labels = Array.from(document.querySelectorAll("label"));
  for (const label of labels) {
    const labelText = (label.textContent || "").trim();
    if (!labelText) continue;
    if (!fuzzyEquals(labelText, text)) continue;

    const controlByFor = label.htmlFor
      ? (document.getElementById(label.htmlFor) as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
          | null)
      : null;
    if (controlByFor) return controlByFor;

    const controlInLabel = label.querySelector("input, select, textarea") as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | null;
    if (controlInLabel) return controlInLabel;
  }

  return null;
}

function findByLabelContains(
  text: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  const labels = Array.from(document.querySelectorAll("label"));
  for (const label of labels) {
    const labelText = (label.textContent || "").trim();
    if (!labelText) continue;
    if (!normalizeText(labelText).includes(normalizeText(text))) continue;

    const controlByFor = label.htmlFor
      ? (document.getElementById(label.htmlFor) as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
          | null)
      : null;
    if (controlByFor) return controlByFor;

    const controlInLabel = label.querySelector("input, select, textarea") as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | null;
    if (controlInLabel) return controlInLabel;
  }

  return null;
}

function findByPartialAttributes(
  selector: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  const normalized = normalizeText(selector);
  const candidates = Array.from(
    document.querySelectorAll("input, textarea, select"),
  ) as Array<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

  for (const element of candidates) {
    const placeholder = element.getAttribute("placeholder");
    if (placeholder && normalizeText(placeholder).includes(normalized)) {
      return element;
    }

    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel && normalizeText(ariaLabel).includes(normalized)) {
      return element;
    }

    const name = element.getAttribute("name");
    if (name && normalizeText(name).includes(normalized)) {
      return element;
    }

    const id = element.getAttribute("id");
    if (id && normalizeText(id).includes(normalized)) {
      return element;
    }
  }

  return null;
}

function buildValue(rule: FieldRule): string {
  if (rule.valueStrategy === "static") {
    return rule.staticValue ?? "";
  }

  if (!rule.fakerMethod) return "";

  const method = resolveFakerMethod(rule.fakerMethod);
  if (typeof method === "function") {
    try {
      const value = method();
      return value == null ? "" : String(value);
    } catch {
      return "";
    }
  }

  return "";
}

function resolveFakerMethod(path: string): unknown {
  const segments = path.split(".").map((part) => part.trim());
  let current: unknown = faker;
  for (const segment of segments) {
    if (!segment) return undefined;
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function applyValue(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  type: FieldType,
  value: string,
): boolean {
  switch (type) {
    case "checkbox": {
      if (!(element instanceof HTMLInputElement)) return false;
      element.checked = value === "true" || value === "1" || value === "on";
      dispatchEvents(element, ["input", "change"]);
      return true;
    }
    case "select": {
      if (!(element instanceof HTMLSelectElement)) return false;
      element.value = value;
      dispatchEvents(element, ["input", "change"]);
      return true;
    }
    case "number":
    case "date":
    case "email":
    case "text": {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        element.value = value;
        dispatchEvents(element, ["input", "change"]);
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}

function dispatchEvents(element: Element, events: Array<"input" | "change">) {
  for (const eventName of events) {
    element.dispatchEvent(new Event(eventName, { bubbles: true }));
  }
}

function submitNearestForm() {
  const active = document.activeElement as HTMLElement | null;
  const form = active?.closest("form") ?? document.querySelector("form");
  if (form) {
    form.requestSubmit?.();
  }
}

function fuzzyEquals(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b);
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function isSimpleToken(value: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(value);
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, "\\$&");
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
