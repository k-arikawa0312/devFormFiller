import type { FormPreset } from "../lib/types";
import { injectPreset } from "./injector";

interface InjectMessage {
  type: "DEV_FORM_FILLER_INJECT";
  preset: FormPreset;
}

function isInjectMessage(message: unknown): message is InjectMessage {
  if (!message || typeof message !== "object") return false;
  const maybe = message as Partial<InjectMessage>;
  return (
    maybe.type === "DEV_FORM_FILLER_INJECT" &&
    typeof maybe.preset === "object" &&
    maybe.preset !== null
  );
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isInjectMessage(message)) return;

  injectPreset(message.preset)
    .then((results) => {
      sendResponse({ ok: true, results });
    })
    .catch((error) => {
      sendResponse({ ok: false, error: String(error) });
    });

  return true;
});
