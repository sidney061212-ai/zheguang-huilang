import { copyFileSync, existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptName = process.argv[2];
const forwardArgs = process.argv.slice(3);

if (!scriptName) {
  console.error('Usage: node scripts/run-node-tooling.mjs <script> [...args]');
  process.exit(1);
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cocosPackage = path.join(projectRoot, 'package.json');
const nodePackage = path.join(projectRoot, 'package.node.json');
const backupPackage = path.join(projectRoot, '.package.cocos.backup.json');

if (!existsSync(nodePackage)) {
  console.error(`Missing ${nodePackage}`);
  process.exit(1);
}

copyFileSync(cocosPackage, backupPackage);
copyFileSync(nodePackage, cocosPackage);

let exitCode = 1;
try {
  const npmArgs = ['run', scriptName];
  if (forwardArgs.length > 0) {
    npmArgs.push('--', ...forwardArgs);
  }

  const result = spawnSync('npm', npmArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    throw result.error;
  }

  exitCode = result.status ?? 1;
} finally {
  copyFileSync(backupPackage, cocosPackage);
  unlinkSync(backupPackage);
}

process.exit(exitCode);
