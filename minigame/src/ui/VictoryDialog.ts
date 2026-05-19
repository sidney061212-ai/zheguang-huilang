import { Panel } from "./Panel";
import { Button, type ButtonRenderState } from "./Button";

export type VictoryDialogRenderOptions = {
  x: number;
  y: number;
  width: number;
  title: string;
  message: string;
  primaryButton?: ButtonRenderState;
  secondaryButton?: ButtonRenderState;
};

export class VictoryDialog extends Panel {
  levelId = "";

  open(levelId: string): void {
    this.levelId = levelId;
    this.show();
  }

  static render(context: CanvasRenderingContext2D, options: VictoryDialogRenderOptions): void {
    const height = options.secondaryButton ? 250 : 198;
    context.save();
    context.fillStyle = "rgba(13, 28, 48, 0.28)";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    context.beginPath();
    context.roundRect(options.x, options.y, options.width, height, 16);
    context.fillStyle = "rgba(255, 255, 255, 0.96)";
    context.fill();
    context.strokeStyle = "rgba(32, 56, 95, 0.12)";
    context.lineWidth = 2;
    context.stroke();

    context.fillStyle = "#20385f";
    context.font = "700 32px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(options.title, options.x + options.width / 2, options.y + 50);

    context.fillStyle = "#5f7590";
    context.font = "22px sans-serif";
    context.fillText(options.message, options.x + options.width / 2, options.y + 92);

    if (options.primaryButton) {
      Button.render(context, options.primaryButton);
    }

    if (options.secondaryButton) {
      Button.render(context, options.secondaryButton);
    }

    context.restore();
  }
}
