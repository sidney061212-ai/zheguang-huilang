import { LevelPackV01 } from '../levels/LevelPackV01';
import { validateSolution } from '../core/optics/LightSimulator';

export function validateAllLevels(): boolean {
  let allPass = true;
  for (const level of LevelPackV01) {
    const result = validateSolution(level);
    const label = `${String(level.index).padStart(2, '0')} ${level.name}`;
    if (result.success) {
      console.log(`[PASS] ${label} -> ${result.reason}, segments=${result.segments.length}, events=${result.eventCount}`);
    } else {
      allPass = false;
      console.error(`[FAIL] ${label} -> ${result.reason}, segments=${result.segments.length}, events=${result.eventCount}`);
      console.error(JSON.stringify(result.segments, null, 2));
    }
  }
  return allPass;
}

// Codex: 在 Cocos 启动调试时可临时调用 validateAllLevels()；正式构建不要自动执行。
