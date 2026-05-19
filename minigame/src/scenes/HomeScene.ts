import type { Time } from "../core/Time";
import type { CanvasRenderer } from "../renderer/CanvasRenderer";
import type { Scene } from "./Scene";

export class HomeScene implements Scene {
  readonly name = "home";

  enter(): void {}

  exit(): void {}

  update(_time: Time): void {}

  render(renderer: CanvasRenderer): void {
    renderer.renderScene("Prism Lab", "Tap Start");
  }
}
