import { AudioManager } from "../audio/AudioManager";
import { Debug } from "../core/Debug";
import { EventBus } from "../core/EventBus";
import { GameLoop } from "../core/GameLoop";
import { InputManager } from "../input/InputManager";
import type { PlatformAdapter } from "../platform/PlatformAdapter";
import { ProgressRepository } from "../platform/ProgressRepository";
import { CanvasRenderer } from "../renderer/CanvasRenderer";
import { GameScene } from "../scenes/GameScene";
import { HomeScene } from "../scenes/HomeScene";
import { LevelSelectScene } from "../scenes/LevelSelectScene";
import { SceneManager } from "../scenes/SceneManager";
import { levels } from "../levels";

export class GameApp {
  private readonly eventBus = new EventBus();
  private readonly input = new InputManager();
  private readonly sceneManager = new SceneManager();
  private readonly debug = new Debug();
  private readonly progressRepository: ProgressRepository;
  private readonly renderer: CanvasRenderer;
  private readonly loop: GameLoop;
  private readonly audio: AudioManager;
  private readonly gameScene: GameScene;

  constructor(private readonly platform: PlatformAdapter) {
    const canvas = platform.createCanvas();
    canvas.width = 750;
    canvas.height = 1334;
    const viewport = platform.getViewportSize();
    this.input.setCoordinateTransform({
      scale: Math.min(viewport.width / canvas.width, viewport.height / canvas.height),
      offsetX: Math.max(0, (viewport.width - canvas.width * Math.min(viewport.width / canvas.width, viewport.height / canvas.height)) / 2),
      offsetY: Math.max(0, (viewport.height - canvas.height * Math.min(viewport.width / canvas.width, viewport.height / canvas.height)) / 2)
    });
    this.renderer = new CanvasRenderer(canvas);
    this.progressRepository = new ProgressRepository(platform.createStorage());
    this.audio = new AudioManager(this.eventBus);
    this.gameScene = new GameScene(
      this.eventBus,
      this.input,
      this.progressRepository,
      () => this.sceneManager.switchTo("level-select"),
      () => this.nextLevel()
    );
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
    this.sceneManager.register(
      new HomeScene(
        this.progressRepository,
        (buttons) => this.input.setButtons(buttons),
        () => this.sceneManager.switchTo("level-select"),
        () => this.startLatestUnlockedLevel()
      )
    );
    this.sceneManager.register(
      new LevelSelectScene(
        this.progressRepository,
        (buttons) => this.input.setButtons(buttons),
        (index) => this.startLevel(index),
        () => this.sceneManager.switchTo("home")
      )
    );
    this.sceneManager.register(this.gameScene);
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

  private startLevel(index: number): void {
    this.gameScene.loadLevel(index);
    this.sceneManager.switchTo("game");
  }

  private startLatestUnlockedLevel(): void {
    let index = 0;
    for (let current = 0; current < levels.length; current += 1) {
      if (this.progressRepository.getLevelProgress(levels[current].id).completed) {
        index = Math.min(current + 1, levels.length - 1);
      }
    }
    this.startLevel(index);
  }

  private nextLevel(): void {
    const nextIndex = this.gameScene.getCurrentLevelIndex() + 1;
    if (nextIndex >= levels.length) {
      this.sceneManager.switchTo("level-select");
      return;
    }
    this.startLevel(nextIndex);
  }
}
