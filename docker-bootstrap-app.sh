#!/bin/sh
# ENVIRONMENT from docker-compose.yaml doesn't get through to subprocesses
# Need to explicitly pass DATABASE_URL here, otherwise migration doesn't work

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "Migrations applied successfully."
else
    echo "Failed to apply migrations."
    exit 1
fi

# Start the application

node server.js