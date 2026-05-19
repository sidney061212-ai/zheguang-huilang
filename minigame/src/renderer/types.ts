import type { EntityId, RaySegment } from "../entities/types";
import type { LevelConfig } from "../levels/LevelConfig";

export type RenderButton = {
  id: EntityId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  enabled?: boolean;
  visible?: boolean;
};

export type VictoryDialogRenderState = {
  visible: boolean;
  title?: string;
  message?: string;
  primaryButton?: RenderButton;
  secondaryButton?: RenderButton;
};

export type LevelRenderState = {
  level: LevelConfig;
  raySegments?: RaySegment[];
  selectedMirrorId?: EntityId | null;
  hitTargetIds?: readonly EntityId[];
  buttons?: readonly RenderButton[];
  victoryDialog?: VictoryDialogRenderState;
};

export type MenuRenderState = {
  title: string;
  subtitle: string;
  caption?: string;
  buttons: readonly RenderButton[];
};
