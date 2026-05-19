import { Panel } from "./Panel";

export class VictoryDialog extends Panel {
  levelId = "";

  open(levelId: string): void {
    this.levelId = levelId;
    this.show();
  }
}
