const OPEN_PANEL_MESSAGE = { type: "DEV_FORM_FILLER_OPEN_PANEL" } as const;

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    await sendOpenPanel(tab.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("Receiving end does not exist") ||
      message.includes("Could not establish connection")
    ) {
      await injectContentScript(tab.id);
      await sendOpenPanel(tab.id);
    }
  }
});

function sendOpenPanel(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, OPEN_PANEL_MESSAGE, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response || response.ok !== true) {
        reject(new Error("no-response"));
        return;
      }
      resolve();
    });
  });
}

function injectContentScript(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ["src/content/index.ts"],
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      },
    );
  });
}
