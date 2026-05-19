import { AudioManager } from "../audio/AudioManager";
import { Debug } from "../core/Debug";
import { EventBus } from "../core/EventBus";
import { GameLoop } from "../core/GameLoop";
import { InputManager } from "../input/InputManager";
import type { PlatformAdapter } from "../platform/PlatformAdapter";
import { CanvasRenderer } from "../renderer/CanvasRenderer";
import { GameScene } from "../scenes/GameScene";
import { HomeScene } from "../scenes/HomeScene";
import { LevelSelectScene } from "../scenes/LevelSelectScene";
import { SceneManager } from "../scenes/SceneManager";

export class GameApp {
  private readonly eventBus = new EventBus();
  private readonly input = new InputManager();
  private readonly sceneManager = new SceneManager();
  private readonly debug = new Debug();
  private readonly renderer: CanvasRenderer;
  private readonly loop: GameLoop;
  private readonly audio: AudioManager;

  constructor(private readonly platform: PlatformAdapter) {
    const canvas = platform.createCanvas();
    canvas.width = 750;
    canvas.height = 1334;
    this.renderer = new CanvasRenderer(canvas);
    this.audio = new AudioManager(this.eventBus);
    this.loop = new GameLoop(
      {
        update: (time) => this.sceneManager.update(time),
        render: () => this.sceneManager.render(this.renderer)
      },
      (callback) => this.platform.requestFrame(callback),
      (handle) => this.platform.cancelFrame(handle)
    );
  }

  init(): void {
    this.sceneManager.register(new HomeScene());
    this.sceneManager.register(new LevelSelectScene());
    this.sceneManager.register(new GameScene(this.eventBus));
    this.platform.onTouch((payload) => this.input.emitTouch(payload));
    this.sceneManager.switchTo("home");
    this.debug.logPerformance("app:init", 0);
    void this.audio;
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }
}
