export type EntityId = string;

export type RayColor = "white" | "red" | "green" | "blue";

export type Vector2 = {
  x: number;
  y: number;
};

export type Ray = {
  id: EntityId;
  origin: Vector2;
  direction: Vector2;
  color: RayColor;
  intensity: number;
  remainingDistance: number;
  depth: number;
  hasSplit: boolean;
  splitHistory: EntityId[];
  sourceId: EntityId;
};

export type LightSource = {
  id: EntityId;
  position: Vector2;
  direction: Vector2;
  color: RayColor;
  intensity: number;
  enabled: boolean;
};

export type Mirror = {
  id: EntityId;
  position: Vector2;
  rotation: number;
  length: number;
  enabled: boolean;
  movable: boolean;
};

export type Prism = {
  id: EntityId;
  position: Vector2;
  rotation: number;
  size: number;
  enabled: boolean;
};

export type Target = {
  id: EntityId;
  position: Vector2;
  radius: number;
  acceptedColors: RayColor[];
  hit: boolean;
};

export type Wall = {
  id: EntityId;
  position: Vector2;
  width: number;
  height: number;
  enabled: boolean;
};

export type RaySegment = {
  id: EntityId;
  from: Vector2;
  to: Vector2;
  color: RayColor;
  intensityStart: number;
  intensityEnd: number;
  remainingStart: number;
  remainingEnd: number;
  sourceRayId: EntityId;
};
