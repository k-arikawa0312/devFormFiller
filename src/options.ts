const AUTO_OPEN_KEY = "autoOpenPanel";
const THEME_KEY = "theme";

const root = document.getElementById("root");

if (root) {
  root.innerHTML = `
    <div class="page">
      <header>
        <h1>DevFormFiller Pro</h1>
        <p>オプション設定</p>
      </header>

      <section class="card">
        <label class="row">
          <input class="auto-open" type="checkbox" />
          <span>ページ読み込み時にフローティングパネルを自動で開く</span>
        </label>
        <p class="hint">無効にすると、拡張機能アイコンからのみ開けます。</p>
      </section>

      <section class="card">
        <label class="row">
          <span>カラーテーマ</span>
          <select class="theme-select">
            <option value="light">ライト</option>
            <option value="dark">ダーク</option>
            <option value="system">端末設定に準じる</option>
          </select>
        </label>
        <p class="hint">フローティングパネルの配色に反映されます。</p>
      </section>
    </div>
  `;
}

const autoOpen = document.querySelector<HTMLInputElement>(".auto-open");
const themeSelect = document.querySelector<HTMLSelectElement>(".theme-select");

const resolveTheme = (value: string) => {
  if (value === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return value === "dark" ? "dark" : "light";
};

const applyTheme = (value: string) => {
  document.documentElement.dataset.theme = resolveTheme(value);
};
if (autoOpen) {
  chrome.storage.local.get([AUTO_OPEN_KEY], (data) => {
    const value = data[AUTO_OPEN_KEY];
    autoOpen.checked = typeof value === "boolean" ? value : true;
  });

  autoOpen.addEventListener("change", () => {
    chrome.storage.local.set({ [AUTO_OPEN_KEY]: autoOpen.checked });
  });
}

if (themeSelect) {
  chrome.storage.local.get([THEME_KEY], (data) => {
    const value = data[THEME_KEY];
    const raw =
      value === "dark" || value === "light" || value === "system"
        ? value
        : "system";
    themeSelect.value = raw;
    applyTheme(raw);
  });

  themeSelect.addEventListener("change", () => {
    const theme =
      themeSelect.value === "dark" ||
      themeSelect.value === "light" ||
      themeSelect.value === "system"
        ? themeSelect.value
        : "system";
    chrome.storage.local.set({ [THEME_KEY]: theme });
    applyTheme(theme);
  });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (themeSelect.value === "system") {
        applyTheme("system");
      }
    });
}

const style = document.createElement("link");
style.rel = "stylesheet";
style.href = "/src/options.css";
document.head.appendChild(style);
