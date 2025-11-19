#
# === STAGE 1: Build ===
#
FROM node:24-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# 1. Install Dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml .
COPY package.json .
COPY apps/iam-service/package.json ./apps/iam-service/
COPY apps/anonymously/package.json ./apps/anonymously/
COPY apps/client/package.json ./apps/client/
RUN pnpm install --frozen-lockfile

# 2. Copy *only* the Prisma schemas
COPY apps/iam-service/prisma/schema.prisma ./apps/iam-service/prisma/
COPY apps/anonymously/prisma/schema.prisma ./apps/anonymously/prisma/

# 3. Copy the rest of the source code
COPY . .

# 4. Build the app
RUN pnpm --filter iam-service run build:prod

# 5. Prune and deploy production files
RUN pnpm --filter iam-service deploy --prod --legacy /prod/iam-service

# 6. Manually copy the build artifacts (THE FIX)
# This is required because pnpm deploy ignores gitignored files like /dist
RUN cp -r /app/apps/iam-service/dist /prod/iam-service/dist

#
# === STAGE 2: Production ===
#
FROM node:24-alpine

WORKDIR /app

# Create a non-root user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

# Copy the pruned, production-only app from the builder stage
COPY --from=builder /prod/iam-service .

ENV NODE_ENV=production

# Switch to the non-root user
USER appuser

# Expose the port
EXPOSE 8000

# Run the app
CMD ["node", "dist/main"]