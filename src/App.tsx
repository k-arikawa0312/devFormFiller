import { useMemo, useState } from "react";
import type { FormPreset, InjectionResult } from "./lib/types";
import "./App.css";

type InjectResponse =
  | { ok: true; results: InjectionResult[] }
  | { ok: false; error: string };

function App() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [nameSelector, setNameSelector] = useState("name");
  const [emailSelector, setEmailSelector] = useState("email");
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
          selector: nameSelector,
          type: "text",
          valueStrategy: "static",
          staticValue: fullName,
        },
        {
          id: "email",
          selector: emailSelector,
          type: "email",
          valueStrategy: "static",
          staticValue: email,
        },
      ],
    };
  }, [fullName, email, autoSubmit, nameSelector, emailSelector]);

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
        setStatus(formatError(response.error));
      }
    } catch (error) {
      setStatus(formatError(String(error)));
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
          <input
            className="selector"
            type="text"
            placeholder="セレクタ/属性（例: name, #fullName, [name=fullName]）"
            value={nameSelector}
            onChange={(event) => setNameSelector(event.target.value)}
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
          <input
            className="selector"
            type="text"
            placeholder="セレクタ/属性（例: email, #email, [name=email]）"
            value={emailSelector}
            onChange={(event) => setEmailSelector(event.target.value)}
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
        if (!response) {
          reject(new Error("no-response"));
          return;
        }
        resolve(response);
      },
    );
  });
}

function formatError(raw: string): string {
  if (raw.includes("active-tab-not-found")) {
    return "失敗: アクティブタブが見つかりません";
  }

  if (
    raw.includes("Receiving end does not exist") ||
    raw.includes("Could not establish connection") ||
    raw.includes("no-response")
  ) {
    return "失敗: コンテンツスクリプト未注入です。対象ページが http/https か確認し、必要なら拡張機能を再読み込みしてください。file:// で検証中なら「ファイル URL へのアクセスを許可」を有効にしてください。";
  }

  return `失敗: ${raw}`;
}

export default App;
