import type { EventBus } from "../core/EventBus";

export class AudioManager {
  private muted = false;

  constructor(eventBus: EventBus) {
    eventBus.on("ui:click", () => this.playSfx("click"));
    eventBus.on("ray:split", () => this.playSfx("split"));
    eventBus.on("target:hit", () => this.playSfx("hit"));
    eventBus.on("level:win", () => this.playSfx("win"));
  }

  playSfx(name: string): void {
    if (this.muted) return;
    console.log(`[sfx] ${name}`);
  }

  playBgm(name: string): void {
    if (this.muted) return;
    console.log(`[bgm] ${name}`);
  }

  mute(): void {
    this.muted = true;
  }

  unmute(): void {
    this.muted = false;
  }

  isMuted(): boolean {
    return this.muted;
  }
}
