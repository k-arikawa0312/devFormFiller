const OPEN_PANEL_MESSAGE = { type: "DEV_FORM_FILLER_OPEN_PANEL" } as const;

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    await sendOpenPanel(tab.id);
  } catch (error) {
    // Content script might not be loaded yet, try injecting it
    const message = error instanceof Error ? error.message : String(error);
    console.error('Failed to send message:', message);

    // Try to inject the content script and retry
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["assets/index.ts-DoFBOnJD.js"]
      });
      // Wait a bit for the script to initialize, then retry
      await new Promise(resolve => setTimeout(resolve, 100));
      await sendOpenPanel(tab.id);
    } catch (injectError) {
      console.error('Failed to inject content script:', injectError);
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
