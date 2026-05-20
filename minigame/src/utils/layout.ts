import type { Vector2 } from "../entities/types";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportLayout {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  padding: number;
  topBar: Rect;
  playArea: Rect;
  bottomBar: Rect;
  dialog: Rect;
}

export function createViewportLayout(width: number, height: number): ViewportLayout {
  const padding = Math.max(12, Math.round(Math.min(width, height) * 0.03));
  const topBarHeight = Math.max(58, Math.round(height * 0.085));
  const bottomBarHeight = Math.max(84, Math.round(height * 0.1));
  const sectionGap = Math.max(10, Math.round(height * 0.012));

  const topBar: Rect = {
    x: padding,
    y: padding,
    width: Math.max(220, width - padding * 2),
    height: topBarHeight
  };

  const playAreaHeight = Math.max(
    260,
    height - padding * 2 - topBarHeight - bottomBarHeight - sectionGap * 2
  );

  const playArea: Rect = {
    x: padding,
    y: topBar.y + topBar.height + sectionGap,
    width: Math.max(300, width - padding * 2),
    height: playAreaHeight
  };

  const bottomBar: Rect = {
    x: padding,
    y: playArea.y + playArea.height + sectionGap,
    width: Math.max(220, width - padding * 2),
    height: bottomBarHeight
  };

  const dialogWidth = Math.min(playArea.width * 0.84, Math.max(280, width * 0.84));
  const dialogHeight = Math.max(250, Math.round(Math.min(playArea.height * 0.56, height * 0.34)));

  return {
    width,
    height,
    centerX: width / 2,
    centerY: height / 2,
    padding,
    topBar,
    playArea,
    bottomBar,
    dialog: {
      x: width / 2 - dialogWidth / 2,
      y: Math.min(
        playArea.y + Math.max(12, playArea.height * 0.18),
        playArea.y + playArea.height - dialogHeight - 12
      ),
      width: dialogWidth,
      height: dialogHeight
    }
  };
}

export function clampPointToRect(point: Vector2, rect: Rect, padding = 0): Vector2 {
  return {
    x: Math.max(rect.x + padding, Math.min(rect.x + rect.width - padding, point.x)),
    y: Math.max(rect.y + padding, Math.min(rect.y + rect.height - padding, point.y))
  };
}

export function centerRect(parent: Rect, width: number, height: number, offsetY = 0): Rect {
  return {
    x: parent.x + (parent.width - width) / 2,
    y: parent.y + (parent.height - height) / 2 + offsetY,
    width,
    height
  };
}
