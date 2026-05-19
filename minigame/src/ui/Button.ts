import type { Vector2 } from "../entities/types";

export class Button {
  constructor(
    readonly label: string,
    readonly position: Vector2,
    readonly width: number,
    readonly height: number,
    private readonly onClick: () => void
  ) {}

  contains(point: Vector2): boolean {
    return (
      point.x >= this.position.x &&
      point.x <= this.position.x + this.width &&
      point.y >= this.position.y &&
      point.y <= this.position.y + this.height
    );
  }

  click(): void {
    this.onClick();
  }
}
