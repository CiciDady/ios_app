#!/usr/bin/env bash
#
# auto_commit_push.sh
# Stage, commit, and push all local changes to the CURRENT git branch.
# Designed to be run on a schedule (e.g. 12:30 and 21:30 daily) so that work
# is regularly snapshotted to GitHub for tracking / rollback.
#
# Usage:
#   scripts/auto_commit_push.sh
#
# Notes:
# - Runs from the repository root regardless of where it is invoked.
# - If there is nothing to commit, it exits successfully without creating a commit.
# - It pushes to whatever branch is currently checked out.

set -euo pipefail

# Move to the repository root (parent of this script's directory).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
STAMP="$(date '+%Y-%m-%d %H:%M:%S')"

if [ -z "$(git status --porcelain)" ]; then
  echo "[$STAMP] No changes to commit on branch '$BRANCH'."
  exit 0
fi

git add -A
git commit -m "chore: scheduled auto-commit ($STAMP)"

# Retry push a few times to tolerate transient network errors.
n=0
until [ "$n" -ge 4 ]; do
  if git push origin "$BRANCH"; then
    echo "[$STAMP] Pushed changes to origin/$BRANCH."
    exit 0
  fi
  n=$((n+1))
  sleep $((4 ** n))
done

echo "[$STAMP] ERROR: git push failed after retries." >&2
exit 1
