import type { TouchEventPayload } from "../input/InputManager";
import type { PlatformAdapter } from "./PlatformAdapter";
import { JsonStorageAdapter, MemoryStorageAdapter, type StorageAdapter, type SyncKeyValueStorage } from "./StorageAdapter";

type WechatCanvas = HTMLCanvasElement;

type WechatGlobal = {
  createCanvas?: () => WechatCanvas;
  getSystemInfoSync?: () => { windowWidth: number; windowHeight: number };
  getStorageSync?: (key: string) => unknown;
  setStorageSync?: (key: string, value: unknown) => void;
  removeStorageSync?: (key: string) => void;
  onTouchStart?: (handler: (event: { touches: Array<{ clientX: number; clientY: number }> }) => void) => void;
  onTouchMove?: (handler: (event: { touches: Array<{ clientX: number; clientY: number }> }) => void) => void;
  onTouchEnd?: (handler: (event: { changedTouches: Array<{ clientX: number; clientY: number }> }) => void) => void;
};

declare const wx: WechatGlobal | undefined;

export class WechatPlatformAdapter implements PlatformAdapter {
  createCanvas(): HTMLCanvasElement {
    if (typeof wx !== "undefined" && wx.createCanvas) {
      return wx.createCanvas();
    }
    return document.createElement("canvas");
  }

  getViewportSize(): { width: number; height: number } {
    if (typeof wx !== "undefined" && wx.getSystemInfoSync) {
      const info = wx.getSystemInfoSync();
      return { width: info.windowWidth, height: info.windowHeight };
    }

    if (typeof window !== "undefined") {
      return { width: window.innerWidth, height: window.innerHeight };
    }

    return { width: 750, height: 1334 };
  }

  createStorage(): StorageAdapter {
    if (
      typeof wx !== "undefined" &&
      wx.getStorageSync &&
      wx.setStorageSync &&
      wx.removeStorageSync
    ) {
      return new JsonStorageAdapter(new WechatSyncStorage());
    }

    if (typeof localStorage !== "undefined") {
      return new JsonStorageAdapter(localStorage);
    }

    return new MemoryStorageAdapter();
  }

  requestFrame(callback: FrameRequestCallback): number {
    return requestAnimationFrame(callback);
  }

  cancelFrame(handle: number): void {
    cancelAnimationFrame(handle);
  }

  onTouch(handler: (payload: TouchEventPayload) => void): void {
    if (typeof wx === "undefined") return;
    wx.onTouchStart?.((event) => {
      const touch = event.touches[0];
      if (!touch) return;
      handler({ phase: "start", position: { x: touch.clientX, y: touch.clientY } });
    });
    wx.onTouchMove?.((event) => {
      const touch = event.touches[0];
      if (!touch) return;
      handler({ phase: "move", position: { x: touch.clientX, y: touch.clientY } });
    });
    wx.onTouchEnd?.((event) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      handler({ phase: "end", position: { x: touch.clientX, y: touch.clientY } });
    });
  }
}

class WechatSyncStorage implements SyncKeyValueStorage {
  getItem(key: string): string | null {
    if (typeof wx === "undefined" || !wx.getStorageSync) return null;
    const value = wx.getStorageSync(key);
    return typeof value === "string" ? value : null;
  }

  setItem(key: string, value: string): void {
    wx?.setStorageSync?.(key, value);
  }

  removeItem(key: string): void {
    wx?.removeStorageSync?.(key);
  }
}
