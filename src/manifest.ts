import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "DevFormFiller Pro",
  version: "1.0.0",
  description: "フォーム入力テストを自動化する開発者向け拡張機能",
  permissions: ["storage", "activeTab"],
  action: {
    default_popup: "index.html",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"], // 開発中は一旦すべて許可。後で localhost 限定に絞れます
      js: ["src/content/index.ts"],
    },
  ],
});
