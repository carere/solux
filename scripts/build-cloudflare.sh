#!/usr/bin/env bash
set -euo pipefail

# Cloudflare preview clones may have neither a local main nor its remote ref.
# Moon still needs the configured base branch for explicit build targets.
if ! git show-ref --verify --quiet refs/heads/main; then
  git fetch origin main
  git branch main FETCH_HEAD
fi

bun moon run website:build
