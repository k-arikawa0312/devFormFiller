import type { FormPreset, InjectionResult } from "../lib/types";
import { injectPreset } from "./injector";
import { pickElement } from "./picker";

const PANEL_ID = "dev-form-filler-panel";

export function openPanel(): void {
  if (document.getElementById(PANEL_ID)) return;

  const host = document.createElement("div");
  host.id = PANEL_ID;
  host.style.position = "fixed";
  host.style.right = "16px";
  host.style.bottom = "16px";
  host.style.zIndex = "2147483647";
  host.style.fontFamily = "Inter, system-ui, sans-serif";

  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .panel {
        width: 300px;
        max-width: calc(100vw - 32px);
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
        color: #0f172a;
        overflow: hidden;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        background: #0f172a;
        color: #ffffff;
      }
      .header h2 {
        margin: 0;
        font-size: 14px;
      }
      .close {
        background: transparent;
        border: none;
        color: #ffffff;
        cursor: pointer;
        font-size: 16px;
      }
      .body {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: min(70vh, 520px);
        overflow-y: auto;
        overflow-x: hidden;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 12px;
        color: #334155;
      }
      input[type="text"],
      input[type="email"] {
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid #cbd5f5;
        font-size: 12px;
      }
      .selector-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .field-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #ffffff;
      }
      .field-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .field-title {
        font-size: 12px;
        color: #475569;
      }
      .remove {
        border: none;
        background: transparent;
        color: #94a3b8;
        cursor: pointer;
        font-size: 12px;
      }
      .row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .row > * {
        min-width: 0;
      }
      select {
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid #cbd5f5;
        font-size: 12px;
        background: #f8fafc;
      }
      .selector {
        flex: 1;
        font-size: 12px;
        background: #f8fafc;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .secondary {
        border: 1px solid #c7d2fe;
        background: #eef2ff;
        color: #3730a3;
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 12px;
        cursor: pointer;
      }
      .secondary:disabled {
        background: #e0e7ff;
        color: #94a3b8;
        cursor: not-allowed;
      }
      .primary {
        width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: none;
        background: #2563eb;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        margin-top: 4px;
      }
      .status {
        font-size: 12px;
        color: #475569;
        margin: 4px 0 0;
      }
      .results {
        list-style: none;
        padding: 0;
        margin: 6px 0 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: #475569;
      }
      .results li {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ok { color: #16a34a; font-weight: 600; }
      .ng { color: #dc2626; font-weight: 600; }
      .reason { color: #94a3b8; }
      .checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #334155;
      }
      .add {
        width: 100%;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px dashed #cbd5f5;
        background: #f8fafc;
        color: #475569;
        font-size: 12px;
        cursor: pointer;
      }
    </style>
    <div class="panel">
      <div class="header">
        <h2>DevFormFiller</h2>
        <button class="close" type="button">×</button>
      </div>
      <div class="body">
        <div class="fields"></div>
        <button class="add" type="button">+ 入力欄を追加</button>

        <label class="checkbox">
          <input class="auto-submit" type="checkbox" />
          <span>入力後に送信</span>
        </label>

        <button class="primary inject" type="button">フォームに注入</button>
        <p class="status"></p>
        <ul class="results"></ul>
      </div>
    </div>
  `;

  document.documentElement.appendChild(host);

  const autoSubmit = shadow.querySelector<HTMLInputElement>(".auto-submit");
  const status = shadow.querySelector<HTMLParagraphElement>(".status");
  const results = shadow.querySelector<HTMLUListElement>(".results");
  const closeButton = shadow.querySelector<HTMLButtonElement>(".close");
  const injectButton = shadow.querySelector<HTMLButtonElement>(".inject");
  const fieldsRoot = shadow.querySelector<HTMLDivElement>(".fields");
  const addButton = shadow.querySelector<HTMLButtonElement>(".add");

  if (
    !autoSubmit ||
    !status ||
    !results ||
    !closeButton ||
    !injectButton ||
    !fieldsRoot ||
    !addButton
  ) {
    host.remove();
    return;
  }

  const setStatus = (message: string) => {
    status.textContent = message;
  };

  const setResults = (items: InjectionResult[]) => {
    results.innerHTML = "";
    for (const item of items) {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="${item.matched ? "ok" : "ng"}">${
          item.matched ? "OK" : "NG"
        }</span>
        <span>${item.selectorTried}</span>
        ${item.matched ? "" : `<span class="reason">(${item.reason})</span>`}
      `;
      results.appendChild(li);
    }
  };

  const setPicking = (isPicking: boolean) => {
    host.style.pointerEvents = isPicking ? "none" : "auto";
    host.style.opacity = isPicking ? "0.6" : "1";
    const pickButtons = fieldsRoot.querySelectorAll<HTMLButtonElement>(".pick");
    pickButtons.forEach((button) => {
      button.disabled = isPicking;
    });
    const removeButtons =
      fieldsRoot.querySelectorAll<HTMLButtonElement>(".remove");
    removeButtons.forEach((button) => {
      button.disabled = isPicking;
    });
    addButton.disabled = isPicking;
    injectButton.disabled = isPicking;
  };

  const createFieldRow = (defaults?: {
    label?: string;
    selector?: string;
    type?: string;
    value?: string;
  }) => {
    const row = document.createElement("div");
    row.className = "field-row";
    row.innerHTML = `
      <div class="field-header">
        <span class="field-title">入力フィールド</span>
        <button class="remove" type="button">削除</button>
      </div>
      <label>
        <span>ラベル</span>
        <input class="field-label" type="text" placeholder="例: 氏名" />
      </label>
      <label>
        <span>値</span>
        <input class="field-value" type="text" placeholder="入力する値" />
      </label>
      <div class="row">
        <select class="field-type">
          <option value="text">text</option>
          <option value="email">email</option>
          <option value="number">number</option>
          <option value="date">date</option>
          <option value="checkbox">checkbox</option>
        </select>
        <input class="selector" type="text" placeholder="セレクタ/属性" />
        <button class="secondary pick" type="button">選択</button>
      </div>
    `;

    const labelInput = row.querySelector<HTMLInputElement>(".field-label");
    const valueInput = row.querySelector<HTMLInputElement>(".field-value");
    const selectorInput = row.querySelector<HTMLInputElement>(".selector");
    const typeSelect = row.querySelector<HTMLSelectElement>(".field-type");
    const pickButton = row.querySelector<HTMLButtonElement>(".pick");
    const removeButton = row.querySelector<HTMLButtonElement>(".remove");

    if (
      !labelInput ||
      !valueInput ||
      !selectorInput ||
      !typeSelect ||
      !pickButton ||
      !removeButton
    ) {
      return;
    }

    if (defaults?.label) labelInput.value = defaults.label;
    if (defaults?.value) valueInput.value = defaults.value;
    if (defaults?.selector) selectorInput.value = defaults.selector;
    if (defaults?.type) typeSelect.value = defaults.type;

    removeButton.addEventListener("click", () => {
      row.remove();
    });

    pickButton.addEventListener("click", async () => {
      setStatus("画面上で対象の入力欄をクリックしてください（Escで中止）");
      setPicking(true);
      const result = await pickElement();
      setPicking(false);
      if (result.selector) {
        selectorInput.value = result.selector;
        if (!labelInput.value && result.label) {
          labelInput.value = result.label;
        }
        setStatus("要素を取得しました");
      } else {
        setStatus("選択を中止しました");
      }
    });

    fieldsRoot.appendChild(row);
  };

  const buildPreset = (): FormPreset => {
    const rows = Array.from(
      fieldsRoot.querySelectorAll<HTMLDivElement>(".field-row"),
    );
    const fields = rows
      .map((row, index) => {
        const selector = row.querySelector<HTMLInputElement>(".selector");
        const value = row.querySelector<HTMLInputElement>(".field-value");
        const type = row.querySelector<HTMLSelectElement>(".field-type");
        if (!selector || !value || !type) return null;
        const selectorValue = selector.value.trim();
        if (!selectorValue) return null;

        return {
          id: `field-${index + 1}`,
          selector: selectorValue,
          type: type.value as FormPreset["fields"][number]["type"],
          valueStrategy: "static" as const,
          staticValue: value.value,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()),
      name: "Floating Panel",
      urlPattern: ".*",
      autoSubmit: autoSubmit.checked,
      fields,
    };
  };

  closeButton.addEventListener("click", () => {
    host.remove();
  });

  injectButton.addEventListener("click", async () => {
    setStatus("");
    results.innerHTML = "";
    const preset = buildPreset();
    const response = await injectPreset(preset);
    setResults(response);
    setStatus("注入が完了しました");
  });

  addButton.addEventListener("click", () => {
    createFieldRow();
  });

  createFieldRow({ label: "氏名", selector: "name", type: "text" });
  createFieldRow({ label: "メール", selector: "email", type: "email" });
}
