# プライバシーポリシー

# Privacy Policy

**最終更新日: 2026年2月19日**
**Last Updated: February 19, 2026**

---

## 日本語

### 1. はじめに

DevFormFiller （以下、「本拡張機能」）は、ウェブフォームの入力テストを支援するための開発者向けツールです。本プライバシーポリシーでは、本拡張機能がどのようにデータを扱うかについて説明します。

### 2. 収集するデータ

本拡張機能は、以下のデータをユーザーのローカル環境でのみ保存します：

- **フォームプリセット**: ユーザーが作成したフォーム入力ルール（セレクタ、フィールドタイプ、値の生成方法など）
- **設定情報**: テーマ設定（ライト/ダーク/システム）、パネル自動起動のオン/オフ設定

### 3. データの保存場所

すべてのデータはユーザーのブラウザ内（`chrome.storage.local`）にのみ保存され、外部サーバーには送信されません。

### 4. データの共有

本拡張機能は、第三者とデータを共有することはありません。すべてのデータはユーザーのローカル環境に留まります。

### 5. 権限の使用目的

本拡張機能が要求する権限とその使用目的は以下の通りです：

- **storage**: プリセットと設定をローカルに保存するため
- **activeTab**: アクティブなタブのページにコンテンツスクリプトを注入し、フォーム操作を行うため
- **scripting**: ページにスクリプトを注入してパネル UI を表示するため
- **host_permissions (http://_/_, https://_/_)**: すべてのウェブサイトでフォーム入力を支援するため

### 6. データの削除

ユーザーは anytime で以下の方法によりデータを削除できます：

- Chrome 拡張機能の設定画面から本拡張機能を削除する
- オプションページからプリセットを個別に削除する

### 7. お問い合わせ

本プライバシーポリシーに関するご質問やご意見は、GitHub リポジトリの Issues を通じてお願いします：
https://github.com/k-arikawa0312/dev-form-filler/issues

---

## English

### 1. Introduction

DevFormFiller Pro (hereinafter "the Extension") is a developer tool designed to assist with web form input testing. This Privacy Policy explains how the Extension handles data.

### 2. Data Collected

The Extension stores the following data locally on the user's device only:

- **Form Presets**: Form input rules created by users (selectors, field types, value generation methods, etc.)
- **Settings**: Theme settings (Light/Dark/System) and auto-panel launch on/off settings

### 3. Data Storage

All data is stored only in the user's browser (via `chrome.storage.local`) and is never transmitted to external servers.

### 4. Data Sharing

The Extension does not share any data with third parties. All data remains on the user's local environment.

### 5. Permission Usage

The permissions required by the Extension and their purposes are as follows:

- **storage**: To store presets and settings locally
- **activeTab**: To inject content scripts into the active tab and interact with forms
- **scripting**: To inject scripts to display the panel UI
- **host_permissions (http://_/_, https://_/_)**: To assist with form input on all websites

### 6. Data Deletion

Users can delete their data at any time by:

- Removing the Extension from Chrome extension settings
- Individually deleting presets from the options page

### 7. Contact

For questions or feedback about this Privacy Policy, please contact us via GitHub Issues:
https://github.com/k-arikawa0312/dev-form-filler/issues
