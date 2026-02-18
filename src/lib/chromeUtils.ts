/**
 * Chrome Extension API関連のユーティリティ関数
 */

/**
 * Chrome Extensionのコンテキストで実行されているかをチェック
 * chrome.storage.local が利用可能かどうかを判定
 */
export const isChromeExtensionContext = (): boolean => {
  try {
    return typeof window !== 'undefined' &&
           typeof window.chrome === 'object' &&
           window.chrome !== null &&
           typeof window.chrome.storage === 'object' &&
           window.chrome.storage !== null &&
           typeof window.chrome.storage.local === 'object';
  } catch {
    return false;
  }
};

/**
 * chrome.storage.local.getの安全なラッパー
 * Chrome Extensionコンテキスト外でもエラーを投げない
 */
export const safeStorageGet = <T>(keys: string[], callback: (data: Record<string, T>) => void): void => {
  if (!isChromeExtensionContext()) {
    callback({} as Record<string, T>);
    return;
  }

  try {
    chrome.storage.local.get(keys, callback);
  } catch (e) {
    console.warn('Failed to access chrome.storage.local:', e);
    callback({} as Record<string, T>);
  }
};

/**
 * chrome.storage.local.setの安全なラッパー
 * Chrome Extensionコンテキスト外でもエラーを投げない
 */
export const safeStorageSet = (data: Record<string, unknown>, callback?: () => void): void => {
  if (!isChromeExtensionContext()) {
    if (callback) callback();
    return;
  }

  try {
    chrome.storage.local.set(data, callback ?? (() => {}));
  } catch (e) {
    console.warn('Failed to save to chrome.storage.local:', e);
    if (callback) callback();
  }
};
