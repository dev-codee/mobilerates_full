#!/bin/sh
set -eu
repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec docker compose --project-name mobilerates --project-directory "$repo_dir"     --env-file "$repo_dir/frontend/.env" -f "$repo_dir/docker-compose.yml" build frontend
