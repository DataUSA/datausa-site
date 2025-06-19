#!/bin/bash
# Pull the latest version and create the containers if they don't exist
export $(cat .env.gcp | xargs)

echo "Pulling the latest version and creating the containers if they don't exist"
docker compose --env-file .env.gcp pull

echo "Compose down"
docker compose down

echo "Compose up"
docker compose --env-file .env.gcp up -d

# Clean old images with the 'project=site' label
docker image prune -af --filter="label=project=site"
