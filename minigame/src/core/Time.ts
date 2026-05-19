export class Time {
  deltaTime = 0;
  elapsedTime = 0;
  frame = 0;

  update(deltaSeconds: number): void {
    this.deltaTime = deltaSeconds;
    this.elapsedTime += deltaSeconds;
    this.frame += 1;
  }

  reset(): void {
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.frame = 0;
  }
}
