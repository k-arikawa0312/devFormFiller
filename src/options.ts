const AUTO_OPEN_KEY = "autoOpenPanel";

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
    </div>
  `;
}

const autoOpen = document.querySelector<HTMLInputElement>(".auto-open");
if (autoOpen) {
  chrome.storage.local.get([AUTO_OPEN_KEY], (data) => {
    const value = data[AUTO_OPEN_KEY];
    autoOpen.checked = typeof value === "boolean" ? value : true;
  });

  autoOpen.addEventListener("change", () => {
    chrome.storage.local.set({ [AUTO_OPEN_KEY]: autoOpen.checked });
  });
}

const style = document.createElement("link");
style.rel = "stylesheet";
style.href = "/src/options.css";
document.head.appendChild(style);
