import { strict as assert } from "node:assert";
import { simulateLight } from "../src/core/optics";
import type { Level, OpticalObject } from "../src/core/types";

function makePrism(id: string, x: number, y: number): OpticalObject {
  return {
    id,
    kind: "prism",
    pos: { x, y },
    radius: 25,
    angleDeg: 0,
    movable: false
  };
}

function runLevel(objects: OpticalObject[]): ReturnType<typeof simulateLight> {
  const level: Level = {
    id: "prism-test",
    name: "Prism Test",
    hint: "",
    source: {
      pos: { x: 40, y: 100 },
      angleDeg: 0,
      maxDistance: 600
    },
    exits: [],
    objects,
    tools: {
      mirror: 0,
      portableConcentrator: 0,
      prism: 0
    }
  };
  return simulateLight(level);
}

const singlePrism = runLevel([makePrism("prism-1", 140, 100)]);
assert.equal(singlePrism.debug?.prismSplits.length, 1);
assert.deepEqual(singlePrism.debug?.prismSplits[0], {
  prismId: "prism-1",
  outputCount: 3,
  inputColor: "white"
});
assert.equal(singlePrism.segments.filter((segment) => segment.color !== "white").length, 3);

const repeatPrism = runLevel([
  makePrism("prism-1", 140, 100),
  makePrism("prism-2", 270, 100)
]);
assert.equal(repeatPrism.debug?.prismSplits.length, 1);
assert.ok(repeatPrism.segments.filter((segment) => segment.color !== "white").length >= 3);
assert.ok(repeatPrism.segments.length < 20);

console.log("prism tests passed");
