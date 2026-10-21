#!/bin/sh
set -eu
repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
compose() {
    docker compose --project-name mobilerates --project-directory "$repo_dir"         --env-file "$repo_dir/frontend/.env" -f "$repo_dir/docker-compose.yml" "$@"
}
compose config --quiet
# Build both images successfully before replacing either running service.
compose build backend frontend
compose up -d --no-deps --wait --wait-timeout 120 backend
compose up -d --no-deps --wait --wait-timeout 120 frontend
compose ps
