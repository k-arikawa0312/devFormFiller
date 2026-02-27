const AUTO_OPEN_KEY = "autoOpenPanel";
const AUTO_OPEN_SCOPE_KEY = "autoOpenPanelScope";
const AUTO_OPEN_SITE_LIST_KEY = "autoOpenPanelSiteList";
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

        <label class="column">
          <span>自動表示の対象</span>
          <select class="auto-open-scope">
            <option value="all">すべてのサイト</option>
            <option value="specific">特定サイトのみ</option>
          </select>
        </label>
        <label class="column">
          <span>対象サイト（1行1件）</span>
          <textarea
            class="auto-open-sites"
            rows="5"
            placeholder="https://example.com/login&#10;https://dev.example.net/form?mode=new"
          ></textarea>
        </label>
        <p class="hint">現在ページのURL（アドレスバー）と完全一致する場合のみ自動表示します。</p>
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
const autoOpenScope = document.querySelector<HTMLSelectElement>(
  ".auto-open-scope",
);
const autoOpenSites = document.querySelector<HTMLTextAreaElement>(
  ".auto-open-sites",
);
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
  chrome.storage.local.get(
    [AUTO_OPEN_KEY, AUTO_OPEN_SCOPE_KEY, AUTO_OPEN_SITE_LIST_KEY],
    (data) => {
      const value = data[AUTO_OPEN_KEY];
      autoOpen.checked = typeof value === "boolean" ? value : true;

      if (autoOpenScope) {
        const scope = data[AUTO_OPEN_SCOPE_KEY];
        const resolvedScope = scope === "specific" ? "specific" : "all";
        autoOpenScope.value = resolvedScope;
      }

      if (autoOpenSites) {
        const siteList = data[AUTO_OPEN_SITE_LIST_KEY];
        autoOpenSites.value = typeof siteList === "string" ? siteList : "";
      }

      if (autoOpenSites) {
        autoOpenSites.disabled = !autoOpen.checked || autoOpenScope?.value !== "specific";
      }
    },
  );

  autoOpen.addEventListener("change", () => {
    chrome.storage.local.set({ [AUTO_OPEN_KEY]: autoOpen.checked });
    if (autoOpenSites) {
      autoOpenSites.disabled = !autoOpen.checked || autoOpenScope?.value !== "specific";
    }
  });
}

if (autoOpenScope) {
  autoOpenScope.addEventListener("change", () => {
    const scope = autoOpenScope.value === "specific" ? "specific" : "all";
    chrome.storage.local.set({ [AUTO_OPEN_SCOPE_KEY]: scope });
    if (autoOpenSites) {
      autoOpenSites.disabled = !autoOpen?.checked || scope !== "specific";
    }
  });
}

if (autoOpenSites) {
  autoOpenSites.addEventListener("change", () => {
    chrome.storage.local.set({ [AUTO_OPEN_SITE_LIST_KEY]: autoOpenSites.value });
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
