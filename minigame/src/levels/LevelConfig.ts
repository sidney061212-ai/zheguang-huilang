import type { LightSource, Mirror, Prism, Target, Wall } from "../entities/types";

export type LevelConfig = {
  id: string;
  name: string;
  hint: string;
  maxDistance: number;
  maxBounces: number;
  lightSource: LightSource;
  mirrors: Mirror[];
  prisms: Prism[];
  targets: Target[];
  walls: Wall[];
  acceptance: {
    expectedConcept: string;
    hasDeterministicSolution: boolean;
  };
};
