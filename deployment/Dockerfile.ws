# ── Chatsapp server image (Fastify + Socket.IO + Prisma) ──────
FROM node:20-alpine AS build
WORKDIR /app
# Prisma needs openssl on alpine
RUN apk add --no-cache openssl
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY server/package.json ./
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "fetch('http://localhost:3001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" || exit 1
CMD ["node", "dist/index.js"]
