import { Director, Node, director } from 'cc';
import { PrismGameController } from './PrismGameController';

function ensureGameRoot(scene: Node | null) {
  if (!scene) {
    return;
  }

  const canvas = scene.getChildByName('Canvas');
  if (!canvas) {
    return;
  }

  let gameRoot = canvas.getChildByName('GameRoot');
  if (!gameRoot) {
    gameRoot = new Node('GameRoot');
    gameRoot.layer = canvas.layer;
    gameRoot.parent = canvas;
  }
  gameRoot.layer = canvas.layer;

  if (!gameRoot.getComponent(PrismGameController)) {
    gameRoot.addComponent(PrismGameController);
  }
}

const SCENE_BOOT_KEY = '__prism_scene_bootstrap_bound__';
const globalState = globalThis as Record<string, unknown>;
if (!globalState[SCENE_BOOT_KEY]) {
  globalState[SCENE_BOOT_KEY] = true;
  director.on(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
    ensureGameRoot(director.getScene());
  });
}

ensureGameRoot(director.getScene());
