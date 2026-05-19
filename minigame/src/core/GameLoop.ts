import { Time } from "./Time";

type FrameRequest = (callback: FrameRequestCallback) => number;
type FrameCancel = (handle: number) => void;

export type GameLoopCallbacks = {
  update: (time: Time) => void;
  render: (time: Time) => void;
};

export class GameLoop {
  private readonly time = new Time();
  private running = false;
  private frameHandle = 0;
  private lastTimestamp = 0;

  constructor(
    private readonly callbacks: GameLoopCallbacks,
    private readonly requestFrame: FrameRequest = requestAnimationFrame,
    private readonly cancelFrame: FrameCancel = cancelAnimationFrame
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = 0;
    this.frameHandle = this.requestFrame((timestamp) => this.tick(timestamp));
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    this.cancelFrame(this.frameHandle);
  }

  tick(timestamp: number): void {
    if (!this.running) return;
    const deltaSeconds = this.lastTimestamp === 0 ? 0 : Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = timestamp;
    this.time.update(deltaSeconds);
    this.callbacks.update(this.time);
    this.callbacks.render(this.time);
    this.frameHandle = this.requestFrame((nextTimestamp) => this.tick(nextTimestamp));
  }
}
