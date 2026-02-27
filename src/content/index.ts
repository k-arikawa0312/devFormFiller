import type { FormPreset } from "../lib/types";
import { injectPreset } from "./injector";
import { pickElement } from "./picker";
import { openPanel } from "./panel";
import { isChromeExtensionContext, safeStorageGet, safeStorageSet } from "../lib/chromeUtils";

const AUTO_OPEN_KEY = "autoOpenPanel";
const AUTO_OPEN_SCOPE_KEY = "autoOpenPanelScope";
const AUTO_OPEN_SITE_LIST_KEY = "autoOpenPanelSiteList";
let panelOpened = false;

type AutoOpenScope = "all" | "specific";

function ensurePanelOpen() {
  if (panelOpened) return;
  panelOpened = true;
  openPanel();
}

function parseSiteRules(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function shouldAutoOpenOnCurrentPage(scopeRaw: unknown, rulesRaw: unknown): boolean {
  const scope: AutoOpenScope = scopeRaw === "specific" ? "specific" : "all";
  if (scope === "all") return true;

  const rules = parseSiteRules(rulesRaw);
  if (rules.length === 0) return false;
  const currentUrl = window.location.href;
  return rules.some((rule) => rule === currentUrl);
}

function autoOpenIfEnabled() {
  if (!isChromeExtensionContext()) {
    // chrome APIが利用できない場合はデフォルトでパネルを開く
    ensurePanelOpen();
    return;
  }

  try {
    safeStorageGet<unknown>(
      [AUTO_OPEN_KEY, AUTO_OPEN_SCOPE_KEY, AUTO_OPEN_SITE_LIST_KEY],
      (data) => {
      const value = data[AUTO_OPEN_KEY];
      const enabled = typeof value === "boolean" ? value : true;
      if (
        enabled &&
        shouldAutoOpenOnCurrentPage(
          data[AUTO_OPEN_SCOPE_KEY],
          data[AUTO_OPEN_SITE_LIST_KEY],
        )
      ) {
        ensurePanelOpen();
      }
      },
    );
  } catch (e) {
    // エラーの場合はデフォルトでパネルを開く
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
        safeStorageSet({
          lastPick: {
            target: message.target,
            result,
            timestamp: Date.now(),
          },
        });
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
