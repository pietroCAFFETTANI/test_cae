
# Deps stage - so instala node_modules
FROM node:22-alpine AS deps
WORKDIR /app
 
COPY package*.json ./
RUN npm ci
 
# Build stage - gera build standalone
FROM node:22-alpine AS builder
WORKDIR /app
 
COPY --from=deps /app/node_modules ./node_modules
COPY . .
 
# IMPORTANTE: nao precisamos de BACKEND_URL em build time.
# A descoberta do backend acontece em runtime, via API Route que le
# process.env.BACKEND_URL a cada request.
 
RUN npm run build
 
# Runtime stage - so o necessario pra rodar
FROM node:22-alpine AS runner
WORKDIR /app
 
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
 
# Cria usuario non-root por seguranca
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
 
# Copia apenas os arquivos do build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
 
# Se voce criar uma pasta public/ no futuro, descomente a linha abaixo:
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public
 
USER nextjs
 
EXPOSE 3000
 
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
 
# O server.js eh gerado pelo Next.js standalone
CMD ["node", "server.js"]
