import type { FormPreset } from "../lib/types";
import { injectPreset } from "./injector";
import { pickElement } from "./picker";
import { openPanel } from "./panel";

const AUTO_OPEN_KEY = "autoOpenPanel";
let panelOpened = false;

// chrome APIが利用可能かチェック
const isChromeExtensionContext = (): boolean => {
  try {
    return typeof window !== 'undefined' &&
           typeof window.chrome === 'object' &&
           window.chrome !== null &&
           typeof window.chrome.storage === 'object' &&
           window.chrome.storage !== null &&
           typeof window.chrome.storage.local === 'object';
  } catch {
    return false;
  }
};

function ensurePanelOpen() {
  if (panelOpened) return;
  panelOpened = true;
  openPanel();
}

function autoOpenIfEnabled() {
  if (!isChromeExtensionContext()) {
    // chrome APIが利用できない場合はデフォルトでパネルを開く
    ensurePanelOpen();
    return;
  }

  try {
    chrome.storage.local.get([AUTO_OPEN_KEY], (data) => {
      const value = data[AUTO_OPEN_KEY];
      const enabled = typeof value === "boolean" ? value : true;
      if (enabled) {
        ensurePanelOpen();
      }
    });
  } catch (e) {
    // エラー場合はデフォルトでパネルを開く
    console.warn('Failed to access chrome.storage.local:', e);
    ensurePanelOpen();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(autoOpenIfEnabled);
  });
} else {
  requestAnimationFrame(autoOpenIfEnabled);
}

interface InjectMessage {
  type: "DEV_FORM_FILLER_INJECT";
  preset: FormPreset;
}

interface PickMessage {
  type: "DEV_FORM_FILLER_PICK";
  target: "name" | "email";
}

interface OpenPanelMessage {
  type: "DEV_FORM_FILLER_OPEN_PANEL";
}

type RuntimeMessage = InjectMessage | PickMessage | OpenPanelMessage;

function isInjectMessage(message: RuntimeMessage): message is InjectMessage {
  return message.type === "DEV_FORM_FILLER_INJECT";
}

function isPickMessage(message: RuntimeMessage): message is PickMessage {
  return message.type === "DEV_FORM_FILLER_PICK";
}

function isOpenPanelMessage(
  message: RuntimeMessage,
): message is OpenPanelMessage {
  return message.type === "DEV_FORM_FILLER_OPEN_PANEL";
}

function isRuntimeMessage(message: unknown): message is RuntimeMessage {
  if (!message || typeof message !== "object") return false;
  const maybe = message as Partial<RuntimeMessage>;
  return (
    maybe.type === "DEV_FORM_FILLER_INJECT" ||
    maybe.type === "DEV_FORM_FILLER_PICK" ||
    maybe.type === "DEV_FORM_FILLER_OPEN_PANEL"
  );
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isRuntimeMessage(message)) return;

  if (isPickMessage(message)) {
    pickElement()
      .then((result) => {
        if (isChromeExtensionContext()) {
          try {
            chrome.storage.local.set({
              lastPick: {
                target: message.target,
                result,
                timestamp: Date.now(),
              },
            });
          } catch (e) {
            console.warn('Failed to save to chrome.storage.local:', e);
          }
        }
        sendResponse({ ok: true, result });
      })
      .catch((error) => {
        sendResponse({ ok: false, error: String(error) });
      });
    return true;
  }

  if (isOpenPanelMessage(message)) {
    openPanel();
    sendResponse({ ok: true });
    return true;
  }

  if (isInjectMessage(message)) {
    injectPreset(message.preset)
      .then((results) => {
        sendResponse({ ok: true, results });
      })
      .catch((error) => {
        sendResponse({ ok: false, error: String(error) });
      });
    return true;
  }
});
