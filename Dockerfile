FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY .env.example .env

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "server/index.js"]
