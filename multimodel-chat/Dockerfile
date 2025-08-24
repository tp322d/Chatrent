# Multi-stage build for production deployment
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files and install root dependencies
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --only=production && npm cache clean --force

# Build the client
FROM base AS client-builder
WORKDIR /app/client

# Copy client source and dependencies
COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3101

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy server files
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/server/node_modules ./server/node_modules
COPY --chown=nextjs:nodejs server/ ./server/
COPY --chown=nextjs:nodejs package*.json ./

# Copy built client
COPY --from=client-builder --chown=nextjs:nodejs /app/client/dist ./client/dist

# Create uploads directory
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3101

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3101/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "server/index.js"]