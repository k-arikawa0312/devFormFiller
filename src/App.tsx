import { useMemo, useState } from "react";
import type { FormPreset, InjectionResult } from "./lib/types";
import "./App.css";

type InjectResponse =
  | { ok: true; results: InjectionResult[] }
  | { ok: false; error: string };

function App() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [details, setDetails] = useState<InjectionResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const preset = useMemo<FormPreset>(() => {
    return {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()),
      name: "MVP Preset",
      urlPattern: ".*",
      autoSubmit,
      fields: [
        {
          id: "fullName",
          selector: "name",
          type: "text",
          valueStrategy: "static",
          staticValue: fullName,
        },
        {
          id: "email",
          selector: "email",
          type: "email",
          valueStrategy: "static",
          staticValue: email,
        },
      ],
    };
  }, [fullName, email, autoSubmit]);

  const handleInject = async () => {
    setIsRunning(true);
    setStatus(null);
    setDetails(null);

    try {
      const tab = await getActiveTab();
      if (!tab?.id) {
        throw new Error("active-tab-not-found");
      }

      const response = await sendMessageToTab(tab.id, preset);
      if (response.ok) {
        setStatus("注入が完了しました");
        setDetails(response.results);
      } else {
        setStatus(`失敗: ${response.error}`);
      }
    } catch (error) {
      setStatus(`失敗: ${String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="popup">
      <header className="header">
        <h1>DevFormFiller Pro</h1>
        <p className="subtitle">MVP: 2フィールド注入</p>
      </header>

      <div className="form">
        <label className="field">
          <span>氏名</span>
          <input
            type="text"
            placeholder="name を持つ入力"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>

        <label className="field">
          <span>メール</span>
          <input
            type="email"
            placeholder="email を持つ入力"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={autoSubmit}
            onChange={(event) => setAutoSubmit(event.target.checked)}
          />
          <span>入力後に送信</span>
        </label>
      </div>

      <button className="primary" onClick={handleInject} disabled={isRunning}>
        {isRunning ? "実行中..." : "フォームに注入"}
      </button>

      {status && <p className="status">{status}</p>}

      {details && (
        <ul className="results">
          {details.map((result) => (
            <li key={result.fieldId}>
              <span className={result.matched ? "ok" : "ng"}>
                {result.matched ? "OK" : "NG"}
              </span>
              <span>{result.selectorTried}</span>
              {!result.matched && result.reason && (
                <span className="reason">({result.reason})</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(tabs[0]);
    });
  });
}

async function sendMessageToTab(
  tabId: number,
  preset: FormPreset,
): Promise<InjectResponse> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      { type: "DEV_FORM_FILLER_INJECT", preset },
      (response: InjectResponse) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      },
    );
  });
}

export default App;
