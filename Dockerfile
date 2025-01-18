# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy all necessary project files
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1

# Build application
RUN yarn build

# Stage 3: Migrations (new stage)
FROM builder AS migrations
# Set the database URL as a build argument
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Run Prisma migrations
RUN npx prisma migrate deploy

# Stage 4: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install production dependencies
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set up directories
RUN mkdir -p .next/cache/
RUN chown -R nextjs:nodejs .next/

# Copy necessary files and directories
COPY --from=migrations --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=migrations --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=migrations --chown=nextjs:nodejs /app/public ./public
COPY --from=migrations --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=migrations --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=migrations --chown=nextjs:nodejs /app/src ./src
COPY --from=migrations --chown=nextjs:nodejs /app/components.json ./
COPY --from=migrations --chown=nextjs:nodejs /app/tailwind.config.ts ./
COPY --from=migrations --chown=nextjs:nodejs /app/postcss.config.mjs ./

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]