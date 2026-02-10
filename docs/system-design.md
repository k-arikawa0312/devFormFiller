System Design Document: DevFormFiller Pro

1. Overview

本プロジェクトは、Web開発におけるフォーム入力テストを効率化するためのGoogle Chrome拡張機能である。TypeScriptとReactを用い、開発者が定義したルールに基づき、ブラウザ上のフォームへ自動的にデータを注入する。

2. Technical Stack

Language: TypeScript

Frontend: React, Tailwind CSS

Build Tool: Vite + @crxjs/vite-plugin

Data Generation: @faker-js/faker

Storage: chrome.storage.local (設定の永続化)

3. Architecture components

拡張機能の標準アーキテクチャに従い、以下の3つのレイヤーで構成する。

3.1. Popup (UI Layer)

役割: 実行するプリセットの選択、クイック設定、オプションページへのリンク提供。

ステート管理: 現在のタブのURLに基づき、適用可能なプリセットをフィルタリングして表示。

3.2. Content Script (Injection Layer)

役割: 実際のDOM操作。Popupからのメッセージを受け取り、フォーム要素を特定して値を入力する。

重要ロジック: \* React/Vue対応: element.value = val だけでなく、dispatchEvent(new Event('input', { bubbles: true })) を発行し、フロントエンドフレームワークのステート更新を強制する。

要素特定アルゴリズム: name > id > placeholder > associated label text の優先順位でマッチング。

3.3. Background / Service Worker (Core Layer)

役割: ストレージ管理、コンテキストメニューの生成、ショートカットキー操作のハンドリング。

4. Data Models (TypeScript Schemas)

TypeScript

/\*\*

- フィールドごとの入力ルール

\*/export interface FieldRule {

id: string;

selector: string; // CSS selector or attribute name

type: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox';

valueStrategy: 'static' | 'faker';

staticValue?: string;

fakerMethod?: string; // e.g., "person.fullName", "internet.email"

}/\*\*

- フォーム単位のプリセット設定

\*/export interface FormPreset {

id: string;

name: string; // プリセット識別名

urlPattern: string; // 実行許可URL（Regex string）

autoSubmit: boolean; // 入力後にSubmitするか

fields: FieldRule[];

}/\*\*

- ストレージ保存形式

\*/export interface AppStorage {

presets: FormPreset[];

settings: {

    theme: 'light' | 'dark';

    shortcutEnabled: boolean;

};

}

5. Sequence Diagram: Data Injection Flow

User: Popup上の「入力実行」ボタンをクリック。

Popup: 現在のURLと選択された FormPreset を chrome.tabs.sendMessage でContent Scriptへ送る。

Content Script: \* FieldRule をループ。

document.querySelector 等で要素を探索。

faker または staticValue から値を生成。

DOMへ値をセットし、イベントを発火。

Content Script: 全項目の完了後、autoSubmit が true なら form.submit() を実行。

6. Implementation Constraints & Priorities

Safety: 本番環境（production domain）での誤動作を防ぐため、デフォルトで localhost や \*.test などの開発ドメインのみ許可するホワイトリスト機能を設ける。

Performance: 大規模なフォームでもブラウザをフリーズさせないよう、DOM操作は非同期またはバッチ処理で行う。

Extensibility: 将来的には、カスタムJavaScriptを注入して複雑なUI（ドラッグ＆ドロップ等）を操作できる「アドバンスドモード」を検討する。
