#!/bin/bash
# This script will copy the development postgresql database to "datausa-cms-21-<release>",
# keeping the credentials for "prod" user

# Replace
POSTGRES_HOST="<check-1password>"
OLD_PASSWORD="<check-1password>"
NEW_DB="datausa-cms-21-<release>"

# Set variables
POSTGRES_IMAGE="postgres:latest"
CONTAINER_NAME="postgres_client"
POSTGRES_PORT=5432

OLD_DB="datausa-cms-21-dev"
OLD_USER="postgres"

NEW_USER="prod"

DUMP_FILE="/tmp/db_dump.sql"

# Start a temporary PostgreSQL container as a client
echo "Starting PostgreSQL client container..."
docker run -d \
  -e PGPASSWORD=$OLD_PASSWORD \
  --name $CONTAINER_NAME \
  $POSTGRES_IMAGE tail -f /dev/null

# Wait for container to be ready
echo "Waiting for client container to be ready..."
sleep 5

# Create a dump of the old database
echo "Creating a dump of the old database..."
docker exec $CONTAINER_NAME pg_dump -h $POSTGRES_HOST -p $POSTGRES_PORT -U $OLD_USER $OLD_DB > $DUMP_FILE
if [ $? -ne 0 ]; then
  echo "Failed to create dump. Exiting."
  docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME
  exit 1
fi

# Create the new database on the remote PostgreSQL instance
echo "Creating new database on the remote instance..."
docker exec -i $CONTAINER_NAME psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $OLD_USER <<EOF
DROP DATABASE IF EXISTS "$NEW_DB";
CREATE DATABASE "$NEW_DB" OWNER $NEW_USER;
GRANT CONNECT ON DATABASE "$NEW_DB" TO $NEW_USER;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO $NEW_USER;
EOF

# Restore the dump to the new database
echo "Restoring dump to the new database..."
docker exec -i $CONTAINER_NAME psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $OLD_USER -d $NEW_DB < $DUMP_FILE
if [ $? -ne 0 ]; then
  echo "Failed to restore dump. Exiting."
  docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME
  exit 1
fi

# Grant permissions on tables for the new db
docker exec -i $CONTAINER_NAME psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $OLD_USER -d $NEW_DB <<EOF
GRANT SELECT ON ALL TABLES IN SCHEMA public TO $NEW_USER;
EOF

# Cleanup
echo "Cleaning up dump file..."
rm $DUMP_FILE

echo "Stopping and removing the client container..."
docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME

# Show success message
echo "Database dump and restore completed successfully!"
