# v0.1 Playable Foundation Design

## State Flow

Home -> LevelSelect -> Game -> VictoryDialog -> next level or replay.

## Scene Structure

- `HomeScene`: title and start / continue entry.
- `LevelSelectScene`: unlocked local levels.
- `GameScene`: active level, input, raycast, render, reset, win.

## Optical Rules

Light starts from one source with `remainingDistance`. Each segment consumes actual traveled distance. Walls stop light. Targets record hit. Mirrors reflect with `direction - 2 * dot(direction, normal) * normal`.

## Input

Touch input is normalized in `InputManager`. Game scene selects mirrors, drags body to move, drags handle to rotate.

## Rendering

Canvas renderer draws background, source, target, walls, mirrors, ray segments, selection, buttons, and victory dialog. No complex animation.

## Level Data

Levels contain source, mirrors, targets, walls, max distance, and hint. Prism fields stay available but unused in v0.1 levels.

## Save

Local progress is stored behind `StorageAdapter`. Scenes must not call `wx.setStorageSync` directly.
