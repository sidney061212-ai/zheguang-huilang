import type { Time } from "../core/Time";
import type { CanvasRenderer } from "../renderer/CanvasRenderer";
import type { Scene } from "./Scene";

export class SceneManager {
  private scenes = new Map<string, Scene>();
  private currentScene: Scene | null = null;

  register(scene: Scene): void {
    this.scenes.set(scene.name, scene);
  }

  switchTo(name: string): void {
    const nextScene = this.scenes.get(name);
    if (!nextScene) {
      throw new Error(`Scene not found: ${name}`);
    }
    this.currentScene?.exit();
    this.currentScene = nextScene;
    this.currentScene.enter();
  }

  update(time: Time): void {
    this.currentScene?.update(time);
  }

  render(renderer: CanvasRenderer): void {
    this.currentScene?.render(renderer);
  }
}
