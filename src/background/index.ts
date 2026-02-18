const OPEN_PANEL_MESSAGE = { type: "DEV_FORM_FILLER_OPEN_PANEL" } as const;

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    await sendOpenPanel(tab.id);
  } catch (error) {
    // Content script might not be loaded yet, try reloading the tab
    const message = error instanceof Error ? error.message : String(error);
    console.error('Failed to send message:', message);
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
