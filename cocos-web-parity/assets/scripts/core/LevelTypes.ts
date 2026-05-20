import type { Vec } from "./Math2D";

export type ToolKind = "mirror" | "portableConcentrator" | "prism";
export type LightColor = "white" | "red" | "green" | "blue";

export type Source = {
  pos: Vec;
  angleDeg: number;
  maxDistance: number;
};

export type Exit = {
  id: string;
  pos: Vec;
  radius: number;
};

export type Mirror = {
  id: string;
  kind: "mirror";
  pos: Vec;
  angleDeg: number;
  length: number;
  movable: boolean;
};

export type Obstacle = {
  id: string;
  kind: "obstacle";
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Concentrator = {
  id: string;
  kind: "concentrator";
  pos: Vec;
  radius: number;
  boostDistance: number;
  movable: boolean;
};

export type Prism = {
  id: string;
  kind: "prism";
  pos: Vec;
  radius: number;
  angleDeg: number;
  movable: boolean;
};

export type OpticalObject = Mirror | Obstacle | Concentrator | Prism;

export type ToolStock = {
  mirror: number;
  portableConcentrator: number;
  prism: number;
};

export type Level = {
  id: string;
  name: string;
  hint: string;
  source: Source;
  exits: Exit[];
  objects: OpticalObject[];
  tools: ToolStock;
};

export type Ray = {
  origin: Vec;
  dir: Vec;
  remaining: number;
  color: LightColor;
  depth: number;
  touchedBoosters: Set<string>;
  hasPassedPrism: boolean;
  splitFromPrismId?: string;
  touchedPrisms: Set<string>;
};

export type RaySegment = {
  from: Vec;
  to: Vec;
  color: LightColor;
  remainingStart: number;
  remainingEnd: number;
};

export type SimulationResult = {
  segments: RaySegment[];
  success: boolean;
  hitExitId?: string;
  reason: "connected" | "blocked" | "distance_lost" | "missed";
  debug?: {
    prismSplits: Array<{
      prismId: string;
      outputCount: number;
      inputColor: LightColor;
    }>;
  };
};
