// src/lib/events.ts
// 依存ゼロのミニイベントバス（Web/ネイティブ両対応）
type Listener = () => void;

const openLinkListeners = new Set<Listener>();

export const appEvents = {
  onOpenLink(fn: Listener) {
    openLinkListeners.add(fn);
    return () => openLinkListeners.delete(fn);
  },
  emitOpenLink() {
    openLinkListeners.forEach((fn) => {
      try { fn(); } catch {}
    });
  },
};
