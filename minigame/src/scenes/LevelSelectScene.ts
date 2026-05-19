import type { Time } from "../core/Time";
import { levels } from "../levels";
import type { CanvasRenderer } from "../renderer/CanvasRenderer";
import type { Scene } from "./Scene";

export class LevelSelectScene implements Scene {
  readonly name = "level-select";

  enter(): void {}

  exit(): void {}

  update(_time: Time): void {}

  render(renderer: CanvasRenderer): void {
    renderer.renderScene("Level Select", `${levels.length} local levels ready`);
  }
}
