'use strict';

const fs = require('fs');
const path = require('path');

function loadStreamRegistry(repoRoot = path.resolve(__dirname, '..')) {
  const registryPath = path.join(
    repoRoot,
    'config',
    'luvia-streams.json'
  );

  const registry = JSON.parse(
    fs.readFileSync(registryPath, 'utf8')
  );

  if (registry.schemaVersion !== 1) {
    throw new Error(
      `Unsupported stream registry schema: ${registry.schemaVersion}`
    );
  }

  if (!Array.isArray(registry.streams)) {
    throw new Error('Stream registry must contain a streams array.');
  }

  if (registry.streamCount !== registry.streams.length) {
    throw new Error(
      `streamCount=${registry.streamCount} does not match streams.length=${registry.streams.length}`
    );
  }

  const ids = new Set();
  const branches = new Set();
  const worktrees = new Set();

  for (const stream of registry.streams) {
    for (const field of ['id', 'branch', 'worktree', 'kind', 'purpose']) {
      if (!stream[field] || typeof stream[field] !== 'string') {
        throw new Error(
          `Invalid stream registry entry: missing ${field}`
        );
      }
    }

    if (ids.has(stream.id)) {
      throw new Error(`Duplicate stream id: ${stream.id}`);
    }

    if (branches.has(stream.branch)) {
      throw new Error(`Duplicate stream branch: ${stream.branch}`);
    }

    if (worktrees.has(stream.worktree)) {
      throw new Error(`Duplicate stream worktree: ${stream.worktree}`);
    }

    ids.add(stream.id);
    branches.add(stream.branch);
    worktrees.add(stream.worktree);
  }

  return {
    registryPath,
    registry,
    streams: registry.streams
  };
}

module.exports = {
  loadStreamRegistry
};
