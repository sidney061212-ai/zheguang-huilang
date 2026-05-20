export type Vec2 = { x: number; y: number };

export type ToolKind = 'mirror' | 'portableConcentrator' | 'prism';
export type ObjectKind = ToolKind | 'obstacle' | 'fixedConcentrator';

export type LightColor = 'white' | 'red' | 'green' | 'blue';

export type LightSource = {
  id: string;
  pos: Vec2;
  angleDeg: number;
  maxDistance: number;
};

export type ExitTarget = {
  id: string;
  pos: Vec2;
  radius: number;
  accepts?: LightColor[];
};

export type MirrorObject = {
  id: string;
  kind: 'mirror';
  pos: Vec2;
  angleDeg: number;
  length: number;
  movable: boolean;
};

export type ConcentratorObject = {
  id: string;
  kind: 'fixedConcentrator' | 'portableConcentrator';
  pos: Vec2;
  radius: number;
  boostDistance: number;
  movable: boolean;
};

export type PrismObject = {
  id: string;
  kind: 'prism';
  pos: Vec2;
  radius: number;
  angleDeg: number;
  movable: boolean;
  enabled: boolean; // v0.1 可设 true，但不要把它作为主线关卡唯一解
};

export type ObstacleObject = {
  id: string;
  kind: 'obstacle';
  x: number;
  y: number;
  w: number;
  h: number;
};

export type LevelObject = MirrorObject | ConcentratorObject | PrismObject | ObstacleObject;

export type ToolStock = {
  mirror: number;
  portableConcentrator: number;
  prism: number;
};

export type PlacedObject = MirrorObject | ConcentratorObject | PrismObject;

export type LevelSolution = {
  objects: PlacedObject[];
  note?: string;
};

export type LevelConfig = {
  id: string;
  index: number;
  name: string;
  hint: string;
  width: number;
  height: number;
  source: LightSource;
  exits: ExitTarget[];
  tools: ToolStock;
  objects: LevelObject[];
  solution: LevelSolution;
};

export type RayState = {
  origin: Vec2;
  dir: Vec2;
  remaining: number;
  color: LightColor;
  depth: number;
  touchedConcentrators: string[];
  touchedPrisms: string[];
};

export type RaySegment = {
  from: Vec2;
  to: Vec2;
  color: LightColor;
  remainingStart: number;
  remainingEnd: number;
};

export type SimulationReason = 'connected' | 'blocked' | 'distance_lost' | 'missed' | 'max_events';

export type SimulationResult = {
  success: boolean;
  hitExitId?: string;
  reason: SimulationReason;
  segments: RaySegment[];
  eventCount: number;
};
