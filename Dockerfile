# syntax=docker/dockerfile:1.7

# -------- Stage 1: Build --------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build-time env for Vite (override in Dokploy if needed)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# -------- Stage 2: Serve --------
FROM nginx:1.27-alpine AS runner

# SPA + reverse-proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
