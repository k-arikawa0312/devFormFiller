import type { FormPreset } from "../lib/types";
import { injectPreset } from "./injector";
import { pickElement } from "./picker";

interface InjectMessage {
  type: "DEV_FORM_FILLER_INJECT";
  preset: FormPreset;
}

interface PickMessage {
  type: "DEV_FORM_FILLER_PICK";
  target: "name" | "email";
}

type RuntimeMessage = InjectMessage | PickMessage;

function isInjectMessage(message: RuntimeMessage): message is InjectMessage {
  return message.type === "DEV_FORM_FILLER_INJECT";
}

function isPickMessage(message: RuntimeMessage): message is PickMessage {
  return message.type === "DEV_FORM_FILLER_PICK";
}

function isRuntimeMessage(message: unknown): message is RuntimeMessage {
  if (!message || typeof message !== "object") return false;
  const maybe = message as Partial<RuntimeMessage>;
  return (
    maybe.type === "DEV_FORM_FILLER_INJECT" ||
    maybe.type === "DEV_FORM_FILLER_PICK"
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
