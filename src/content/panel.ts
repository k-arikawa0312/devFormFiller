import type { FormPreset, InjectionResult } from "../lib/types";
import { injectPreset } from "./injector";
import { pickElement } from "./picker";

const PANEL_ID = "dev-form-filler-panel";
const PRESETS_KEY = "panelPresets";
const THEME_KEY = "theme";

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
      :host {
        all: initial;
        --panel-bg: #ffffff;
        --panel-text: #0f172a;
        --panel-border: #e5e7eb;
        --panel-muted: #475569;
        --panel-subtle: #94a3b8;
        --panel-header-bg: #0f172a;
        --panel-header-text: #ffffff;
        --panel-input-border: #cbd5f5;
        --panel-input-bg: #f8fafc;
        --panel-accent: #2563eb;
        --panel-accent-muted: #eef2ff;
        --panel-accent-border: #c7d2fe;
      }
      :host([data-theme="dark"]) {
        --panel-bg: #0f172a;
        --panel-text: #e2e8f0;
        --panel-border: #1e293b;
        --panel-muted: #94a3b8;
        --panel-subtle: #64748b;
        --panel-header-bg: #020617;
        --panel-header-text: #e2e8f0;
        --panel-input-border: #334155;
        --panel-input-bg: #0b1120;
        --panel-accent: #3b82f6;
        --panel-accent-muted: #1e293b;
        --panel-accent-border: #334155;
      }
      .panel {
        width: 300px;
        max-width: calc(100vw - 32px);
        background: var(--panel-bg);
        border: 1px solid var(--panel-border);
        border-radius: 12px;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
        color: var(--panel-text);
        overflow: hidden;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        background: var(--panel-header-bg);
        color: var(--panel-header-text);
      }
      .header h2 {
        margin: 0;
        font-size: 14px;
      }
      .close {
        background: transparent;
        border: none;
        color: var(--panel-header-text);
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
        color: var(--panel-text);
      }
      input[type="text"],
      input[type="email"] {
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid var(--panel-input-border);
        font-size: 12px;
        background: var(--panel-input-bg);
        color: var(--panel-text);
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
        border: 1px solid var(--panel-border);
        border-radius: 10px;
        background: var(--panel-input-bg);
      }
      .field-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .field-title {
        font-size: 12px;
        color: var(--panel-muted);
      }
      .remove {
        border: none;
        background: transparent;
        color: var(--panel-subtle);
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
        border: 1px solid var(--panel-input-border);
        font-size: 12px;
        background: var(--panel-input-bg);
        color: var(--panel-text);
      }
      .selector {
        flex: 1;
        font-size: 12px;
        background: var(--panel-input-bg);
        color: var(--panel-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .secondary {
        border: 1px solid var(--panel-accent-border);
        background: var(--panel-accent-muted);
        color: var(--panel-text);
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 12px;
        cursor: pointer;
      }
      .secondary:disabled {
        background: var(--panel-accent-muted);
        color: var(--panel-subtle);
        cursor: not-allowed;
      }
      .primary {
        width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: none;
        background: var(--panel-accent);
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        margin-top: 4px;
      }
      .status {
        font-size: 12px;
        color: var(--panel-muted);
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
        color: var(--panel-muted);
      }
      .results li {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ok { color: #16a34a; font-weight: 600; }
      .ng { color: #dc2626; font-weight: 600; }
      .reason { color: var(--panel-subtle); }
      .checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--panel-text);
      }
      .add {
        width: 100%;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px dashed var(--panel-input-border);
        background: var(--panel-input-bg);
        color: var(--panel-muted);
        font-size: 12px;
        cursor: pointer;
      }
      .preset {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px;
        border: 1px solid var(--panel-border);
        border-radius: 10px;
        background: var(--panel-input-bg);
      }
      .preset-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .preset-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .preset-row input,
      .preset-row select {
        flex: 1;
        min-width: 0;
      }
      .preset-name,
      .preset-select {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .tertiary {
        border: 1px solid var(--panel-border);
        background: var(--panel-bg);
        color: var(--panel-muted);
        border-radius: 8px;
        padding: 6px 8px;
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
        <div class="preset">
          <div class="preset-row">
            <input class="preset-name" type="text" placeholder="プリセット名" />
            <button class="tertiary preset-save" type="button">保存</button>
          </div>
          <div class="preset-row">
            <select class="preset-select"></select>
            <div class="preset-actions">
              <button class="tertiary preset-load" type="button">読み込み</button>
              <button class="tertiary preset-delete" type="button">削除</button>
            </div>
          </div>
        </div>

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

  chrome.storage.local.get([THEME_KEY], (data) => {
    const value = data[THEME_KEY];
    if (value === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      host.dataset.theme = isDark ? "dark" : "light";
    } else {
      host.dataset.theme = value === "dark" ? "dark" : "light";
    }
  });

  const autoSubmit = shadow.querySelector<HTMLInputElement>(".auto-submit");
  const status = shadow.querySelector<HTMLParagraphElement>(".status");
  const results = shadow.querySelector<HTMLUListElement>(".results");
  const closeButton = shadow.querySelector<HTMLButtonElement>(".close");
  const injectButton = shadow.querySelector<HTMLButtonElement>(".inject");
  const fieldsRoot = shadow.querySelector<HTMLDivElement>(".fields");
  const addButton = shadow.querySelector<HTMLButtonElement>(".add");
  const presetName = shadow.querySelector<HTMLInputElement>(".preset-name");
  const presetSelect =
    shadow.querySelector<HTMLSelectElement>(".preset-select");
  const presetSave = shadow.querySelector<HTMLButtonElement>(".preset-save");
  const presetLoad = shadow.querySelector<HTMLButtonElement>(".preset-load");
  const presetDelete =
    shadow.querySelector<HTMLButtonElement>(".preset-delete");

  if (
    !autoSubmit ||
    !status ||
    !results ||
    !closeButton ||
    !injectButton ||
    !fieldsRoot ||
    !addButton ||
    !presetName ||
    !presetSelect ||
    !presetSave ||
    !presetLoad ||
    !presetDelete
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

  const reindexFields = () => {
    const rows = Array.from(
      fieldsRoot.querySelectorAll<HTMLDivElement>(".field-row"),
    );
    rows.forEach((row, index) => {
      const title = row.querySelector<HTMLSpanElement>(".field-title");
      if (title) {
        title.textContent = `入力フィールド${index + 1}`;
      }
    });
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
      reindexFields();
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
    reindexFields();
  };

  const clearFields = () => {
    fieldsRoot.innerHTML = "";
    reindexFields();
  };

  const collectFields = () => {
    const rows = Array.from(
      fieldsRoot.querySelectorAll<HTMLDivElement>(".field-row"),
    );
    return rows
      .map((row, index) => {
        const selector = row.querySelector<HTMLInputElement>(".selector");
        const value = row.querySelector<HTMLInputElement>(".field-value");
        const type = row.querySelector<HTMLSelectElement>(".field-type");
        const label = row.querySelector<HTMLInputElement>(".field-label");
        if (!selector || !value || !type || !label) return null;
        const selectorValue = selector.value.trim();
        if (!selectorValue) return null;

        return {
          id: `field-${index + 1}`,
          selector: selectorValue,
          type: type.value as FormPreset["fields"][number]["type"],
          valueStrategy: "static" as const,
          staticValue: value.value,
          label: label.value,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const populateFields = (
    fields: Array<{
      label?: string;
      selector: string;
      type: string;
      value?: string;
    }>,
  ) => {
    clearFields();
    for (const field of fields) {
      createFieldRow({
        label: field.label ?? "",
        selector: field.selector,
        type: field.type,
        value: field.value ?? "",
      });
    }
  };

  const formatPresetLabel = (name: string) => {
    return name.length > 20 ? `${name.slice(0, 20)}…` : name;
  };

  const loadPresetList = () => {
    chrome.storage.local.get([PRESETS_KEY], (data) => {
      const presets =
        (data[PRESETS_KEY] as Array<{ name: string }> | undefined) ?? [];
      presetSelect.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "プリセットを選択";
      presetSelect.appendChild(placeholder);
      for (const preset of presets) {
        const option = document.createElement("option");
        option.value = preset.name;
        option.textContent = formatPresetLabel(preset.name);
        option.title = preset.name;
        presetSelect.appendChild(option);
      }
    });
  };

  const buildPreset = (): FormPreset => {
    const fields = collectFields().map(({ label, ...rest }) => rest);

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

  presetSave.addEventListener("click", () => {
    const name = presetName.value.trim();
    if (!name) {
      setStatus("プリセット名を入力してください");
      return;
    }

    const fields = collectFields();
    chrome.storage.local.get([PRESETS_KEY], (data) => {
      const presets =
        (data[PRESETS_KEY] as
          | Array<{ name: string; fields: typeof fields; autoSubmit: boolean }>
          | undefined) ?? [];
      const next = presets.filter((preset) => preset.name !== name);
      next.push({ name, fields, autoSubmit: autoSubmit.checked });
      chrome.storage.local.set({ [PRESETS_KEY]: next }, () => {
        setStatus("プリセットを保存しました");
        loadPresetList();
      });
    });
  });

  presetLoad.addEventListener("click", () => {
    const name = presetSelect.value;
    if (!name) return;
    chrome.storage.local.get([PRESETS_KEY], (data) => {
      const presets =
        (data[PRESETS_KEY] as
          | Array<{
              name: string;
              fields: Array<{
                label?: string;
                selector: string;
                type: string;
                value?: string;
              }>;
              autoSubmit: boolean;
            }>
          | undefined) ?? [];
      const preset = presets.find((item) => item.name === name);
      if (!preset) return;
      populateFields(preset.fields);
      autoSubmit.checked = preset.autoSubmit;
      presetName.value = preset.name;
      setStatus("プリセットを読み込みました");
    });
  });

  presetDelete.addEventListener("click", () => {
    const name = presetSelect.value;
    if (!name) return;
    chrome.storage.local.get([PRESETS_KEY], (data) => {
      const presets =
        (data[PRESETS_KEY] as Array<{ name: string }> | undefined) ?? [];
      const next = presets.filter((preset) => preset.name !== name);
      chrome.storage.local.set({ [PRESETS_KEY]: next }, () => {
        setStatus("プリセットを削除しました");
        presetSelect.value = "";
        loadPresetList();
      });
    });
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
  loadPresetList();
}
