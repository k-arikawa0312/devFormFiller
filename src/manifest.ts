import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "DevFormFiller Pro",
  version: "1.0.0",
  description: "フォーム入力テストを自動化する開発者向け拡張機能",
  permissions: ["storage", "activeTab", "scripting"],
  host_permissions: ["http://*/*", "https://*/*"],
  action: {
    default_popup: "index.html",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],
});
