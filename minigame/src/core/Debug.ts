import type { Ray } from "../entities/types";

export class Debug {
  enabled = false;

  logRay(ray: Ray): void {
    if (!this.enabled) return;
    console.log("[ray]", ray);
  }

  logPrism(message: string, payload?: unknown): void {
    if (!this.enabled) return;
    console.log("[prism]", message, payload ?? "");
  }

  logPerformance(label: string, milliseconds: number): void {
    if (!this.enabled) return;
    console.log("[perf]", label, `${milliseconds.toFixed(2)}ms`);
  }
}
