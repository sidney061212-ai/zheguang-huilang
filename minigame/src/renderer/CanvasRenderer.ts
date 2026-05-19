export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context is not available");
    }
    this.context = context;
  }

  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderScene(title: string, subtitle: string): void {
    this.clear();
    this.context.fillStyle = "#f6fbff";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "#20385f";
    this.context.font = "24px sans-serif";
    this.context.fillText(title, 24, 56);
    this.context.font = "14px sans-serif";
    this.context.fillText(subtitle, 24, 86);
  }
}
