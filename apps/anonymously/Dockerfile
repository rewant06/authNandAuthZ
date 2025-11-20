# --- STAGE 1: BUILDER ---
FROM node:22-alpine AS builder

RUN npm install -g pnpm prisma@6.19.0
RUN apk add --no-cache openssl

WORKDIR /app

# 1. Context Setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.base.json ./
COPY apps/iam-service/package.json ./apps/iam-service/
COPY apps/anonymously/package.json ./apps/anonymously/

# 2. Install Dependencies
RUN pnpm install --frozen-lockfile

# 3. Copy Source Code
COPY apps/anonymously ./apps/anonymously

# 4. Generate Prisma Client
WORKDIR /app/apps/anonymously
RUN prisma generate

# 5. Build the App (Using pnpm to fix missing modules)
RUN pnpm build

# --- STAGE 2: RUNNER ---
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl
RUN npm install -g pnpm prisma@6.19.0

WORKDIR /app
ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 1. Setup Dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/anonymously/package.json ./apps/anonymously/

# Install Prod Deps
RUN pnpm install --prod --frozen-lockfile

# 2. Copy Built Assets
COPY --chown=nestjs:nodejs --from=builder /app/apps/anonymously/dist ./apps/anonymously/dist
COPY --chown=nestjs:nodejs --from=builder /app/apps/anonymously/prisma ./apps/anonymously/prisma

# 3. Generate Client in Runner
WORKDIR /app/apps/anonymously
RUN prisma generate

# 4. Permissions
WORKDIR /app
RUN chown -R nestjs:nodejs /app/apps/anonymously/node_modules

USER nestjs

EXPOSE 8001

# Standard path for this service
CMD ["node", "apps/anonymously/dist/main.js"]