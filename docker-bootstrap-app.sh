#!/bin/sh
# ENVIRONEMTN from docker-compose.yaml doesn't get through to subprocesses
# Need to explicit pass DATABASE_URL here, otherwise migration doesn't work
# Run migrations
DATABASE_URL="postgresql://derrickuser:123@localhost:5432/QuantixDBV2?schema=public" npx prisma migrate deploy
# start app
DATABASE_URL="postgresql://derrickuser:123@localhost:5432/QuantixDBV2?schema=public" node server.js