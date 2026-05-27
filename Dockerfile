FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# --ignore-scripts prevents prisma generate from running before schema.prisma is copied
RUN npm ci --ignore-scripts

FROM node:20-slim AS builder
# Install OpenSSL for Prisma schema engine (debian-openssl-3.0.x target)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:/tmp/build.db"
ENV AUTH_SECRET="build-time-placeholder-secret"
ENV NEXT_PUBLIC_APP_URL="https://localhost:3000"
# Generate Prisma client now that schema.prisma is available
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner
# Install OpenSSL for Prisma schema engine at runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL="file:/data/app.db"
ENV AUTH_SECRET="forge-app-default-secret-override-in-production"
# Auth.js / NextAuth v5 refuses to serve when behind a proxy unless this is set
# (errors.authjs.dev#untrustedhost). Coolify is always proxied. Without it,
# every request to an auth-using app returns 502.
ENV AUTH_TRUST_HOST=1
ENV NEXT_PUBLIC_APP_URL=""
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir -p /data && chown nextjs:nodejs /data
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copy full node_modules so the Prisma CLI has all its runtime deps (v6+ requires effect, c12, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
USER nextjs
EXPOSE 3000
ENV PORT=3000
# Bind Next.js to all interfaces — see HOSTNAME comment in the simple template above.
ENV HOSTNAME=0.0.0.0
CMD ["sh", "-c", "node node_modules/prisma/build/index.js db push --url \"$DATABASE_URL\" && echo 'DB schema initialized' && HOSTNAME=0.0.0.0 exec node server.js"]
