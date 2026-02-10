import type { FormPreset } from "../lib/types";
import { injectPreset } from "./injector";
import { pickElement } from "./picker";
import { openPanel } from "./panel";

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
        chrome.storage.local.set({
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
