import type { FormPreset, InjectionResult } from "../lib/types";
import { injectPreset } from "./injector";
import { pickElement } from "./picker";

const PANEL_ID = "dev-form-filler-panel";
const AUTO_OPEN_KEY = "autoOpenPanel";

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
        width: 320px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
        color: #0f172a;
        overflow: hidden;
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
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid #cbd5f5;
        font-size: 13px;
      }
      .selector-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .selector {
        flex: 1;
        font-size: 12px;
        background: #f8fafc;
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
      .checkbox + .checkbox {
        margin-top: -2px;
      }
    </style>
    <div class="panel">
      <div class="header">
        <h2>DevFormFiller</h2>
        <button class="close" type="button">×</button>
      </div>
      <div class="body">
        <label>
          <span>氏名</span>
          <input class="value name-value" type="text" placeholder="name を持つ入力" />
          <div class="selector-row">
            <input class="selector name-selector" type="text" placeholder="セレクタ/属性" value="name" />
            <button class="secondary name-pick" type="button">選択</button>
          </div>
        </label>

        <label>
          <span>メール</span>
          <input class="value email-value" type="email" placeholder="email を持つ入力" />
          <div class="selector-row">
            <input class="selector email-selector" type="text" placeholder="セレクタ/属性" value="email" />
            <button class="secondary email-pick" type="button">選択</button>
          </div>
        </label>

        <label class="checkbox">
          <input class="auto-submit" type="checkbox" />
          <span>入力後に送信</span>
        </label>

        <label class="checkbox">
          <input class="auto-open" type="checkbox" />
          <span>自動でパネルを開く</span>
        </label>

        <button class="primary inject" type="button">フォームに注入</button>
        <p class="status"></p>
        <ul class="results"></ul>
      </div>
    </div>
  `;

  document.documentElement.appendChild(host);

  const nameValue = shadow.querySelector<HTMLInputElement>(".name-value");
  const emailValue = shadow.querySelector<HTMLInputElement>(".email-value");
  const nameSelector = shadow.querySelector<HTMLInputElement>(".name-selector");
  const emailSelector =
    shadow.querySelector<HTMLInputElement>(".email-selector");
  const autoSubmit = shadow.querySelector<HTMLInputElement>(".auto-submit");
  const status = shadow.querySelector<HTMLParagraphElement>(".status");
  const results = shadow.querySelector<HTMLUListElement>(".results");
  const closeButton = shadow.querySelector<HTMLButtonElement>(".close");
  const injectButton = shadow.querySelector<HTMLButtonElement>(".inject");
  const autoOpen = shadow.querySelector<HTMLInputElement>(".auto-open");
  const namePickButton = shadow.querySelector<HTMLButtonElement>(".name-pick");
  const emailPickButton =
    shadow.querySelector<HTMLButtonElement>(".email-pick");

  if (
    !nameValue ||
    !emailValue ||
    !nameSelector ||
    !emailSelector ||
    !autoSubmit ||
    !status ||
    !results ||
    !closeButton ||
    !injectButton ||
    !autoOpen ||
    !namePickButton ||
    !emailPickButton
  ) {
    host.remove();
    return;
  }

  chrome.storage.local.get([AUTO_OPEN_KEY], (data) => {
    const value = data[AUTO_OPEN_KEY];
    autoOpen.checked = typeof value === "boolean" ? value : true;
  });

  autoOpen.addEventListener("change", () => {
    chrome.storage.local.set({ [AUTO_OPEN_KEY]: autoOpen.checked });
  });

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
    namePickButton.disabled = isPicking;
    emailPickButton.disabled = isPicking;
    injectButton.disabled = isPicking;
  };

  const buildPreset = (): FormPreset => {
    return {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()),
      name: "Floating Panel",
      urlPattern: ".*",
      autoSubmit: autoSubmit.checked,
      fields: [
        {
          id: "fullName",
          selector: nameSelector.value.trim(),
          type: "text",
          valueStrategy: "static",
          staticValue: nameValue.value,
        },
        {
          id: "email",
          selector: emailSelector.value.trim(),
          type: "email",
          valueStrategy: "static",
          staticValue: emailValue.value,
        },
      ],
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

  namePickButton.addEventListener("click", async () => {
    setStatus("画面上で対象の入力欄をクリックしてください（Escで中止）");
    setPicking(true);
    const result = await pickElement();
    setPicking(false);
    if (result.selector) {
      nameSelector.value = result.selector;
      if (!nameValue.value && result.label) {
        nameValue.value = result.label;
      }
      setStatus("要素を取得しました");
    } else {
      setStatus("選択を中止しました");
    }
  });

  emailPickButton.addEventListener("click", async () => {
    setStatus("画面上で対象の入力欄をクリックしてください（Escで中止）");
    setPicking(true);
    const result = await pickElement();
    setPicking(false);
    if (result.selector) {
      emailSelector.value = result.selector;
      if (!emailValue.value && result.label) {
        emailValue.value = result.label;
      }
      setStatus("要素を取得しました");
    } else {
      setStatus("選択を中止しました");
    }
  });
}
