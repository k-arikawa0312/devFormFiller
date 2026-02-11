# DevFormFiller

Webフォームの手動入力テストを高速化する、開発者向け Chrome 拡張機能です。  
入力項目の選択、値注入、プリセット保存をブラウザ上で完結させ、E2E 前の手動検証コストを下げることを目的にしています。

## 1. プロジェクト概要

手動でのフォーム入力確認は、以下のような非効率が発生しがちです。

- 同じ入力作業を何度も繰り返す
- UI 変更のたびに入力対象を探し直す
- 複数ページでの回帰確認に時間がかかる

DevFormFillerは、ページ内フローティングパネルから以下を実現します。

- フィールドを視覚的に選択してセレクタを取得
- 複数項目へ一括で値を注入
- 入力ルールをプリセットとして保存・再利用

## 2. 主な機能

- フローティングパネル UI（コンテンツスクリプト）
- 要素ピッカー（クリックで対象入力欄のセレクタ取得）
- 複数戦略による要素探索
  - CSS セレクタ
  - `name` / `id` / `placeholder` / `aria-label`
  - `data-testid` / `data-test`
  - ラベル文字列（完全一致・部分一致）
- 一括注入結果の可視化（OK/NG と理由表示）
- プリセット保存・読み込み・削除（`chrome.storage.local`）
- オプション設定
  - パネル自動起動の ON/OFF
  - ライト / ダーク / システムテーマ切り替え

## 3. 技術的な工夫

- Chrome Extension (Manifest V3) のレイヤー分離
  - `background` / `content script` / `options page` を役割分割
- 型安全な実装
  - TypeScript によるデータモデル定義（`FormPreset`, `FieldRule`, `InjectionResult`）
- 現実的な DOM 操作設計
  - 単純なセレクタ依存ではなく、ラベルや属性ベースのフォールバック探索
- 開発体験を意識した構成
  - Vite + CRXJS で拡張機能開発
  - GitHub Actions で build artifact / release zip を自動化

## 4. 技術スタック

- Language: TypeScript
- Build: Vite, `@crxjs/vite-plugin`
- UI: React（options page）, DOM UI（content panel）
- State/Validation libraries: Zustand, React Query, Zod（依存導入済み）
- Data generation: `@faker-js/faker`
- Lint: ESLint
- CI/CD: GitHub Actions（`.github/workflows/release.yml`）

## 5. アーキテクチャ

### Background (`src/background/index.ts`)

- 拡張アイコンクリックを受け取り、対象タブへパネル表示メッセージを送信
- 未注入時は `chrome.scripting.executeScript` で content script をフォールバック注入

### Content Script (`src/content/*`)

- `panel.ts`: フローティング UI、プリセット操作、注入実行、結果表示
- `picker.ts`: ホバーオーバーレイ表示 + クリック選択
- `injector.ts`: フォーム要素探索、値適用、結果返却
- `index.ts`: メッセージ受信・起動制御（自動オープン設定対応）

### Options Page (`src/options.ts`)

- 自動起動設定とテーマ設定を永続化

## 6. セットアップ

### 前提

- Node.js 20 以上
- Google Chrome

### ローカル起動

```bash
npm ci
npm run dev
```

### Chrome への読み込み（開発）

1. `chrome://extensions` を開く
2. デベロッパーモードを ON
3. 「パッケージ化されていない拡張機能を読み込む」
4. 本リポジトリのルートを選択

## 7. ビルドと配布

### ビルド

```bash
npm run build
```

- 出力先: `dist/`

### GitHub での公開

- `main` への push / PR で CI build を実行
- GitHub Release 作成時に `dist/` を zip 化してアセット添付
- ワークフロー定義: `.github/workflows/release.yml`

## 8. ディレクトリ構成

```text
src/
  background/
    index.ts
  content/
    index.ts
    panel.ts
    injector.ts
    picker.ts
  lib/
    types.ts
  options.ts
  manifest.ts

docs/
  system-design.md

.github/workflows/
  release.yml
```

## 9. 現状の制約と改善予定

- 自動テスト（unit/e2e）は未整備
- アイコンなどストア公開向けメタデータは最小構成
- 現在は全サイト対象の権限設定（開発効率優先）

今後は以下を予定しています。

- Playwright などによる注入ロジックの回帰テスト
- 権限スコープの最小化
- プリセットの import/export 機能
- 入力候補テンプレートの拡充（faker 戦略の UI 化）

## 10. ライセンス

ライセンスは今後整備予定です。必要に応じて `MIT` などを明記してください。
