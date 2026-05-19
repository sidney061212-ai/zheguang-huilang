import type { RaycastResult } from "./RaycastSystem";

export class WinConditionSystem {
  isWin(result: RaycastResult): boolean {
    return result.hitTargetIds.length > 0;
  }
}
