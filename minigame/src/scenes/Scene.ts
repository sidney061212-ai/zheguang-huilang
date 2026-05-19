import type { Time } from "../core/Time";
import type { CanvasRenderer } from "../renderer/CanvasRenderer";

export interface Scene {
  readonly name: string;
  enter(): void;
  exit(): void;
  update(time: Time): void;
  render(renderer: CanvasRenderer): void;
}
