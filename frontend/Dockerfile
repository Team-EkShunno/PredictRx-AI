# Multi-stage build for PredictRx-AI React Frontend

# Stage 1: Build production assets
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies using clean install
COPY package.json package-lock.json ./
RUN npm ci

# Copy configuration and source files
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html tailwind.config.js postcss.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# Build client distribution
ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_ENABLE_MOCK_FALLBACK=false
ARG VITE_MOCK_LATENCY_MS=1000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ENABLE_MOCK_FALLBACK=$VITE_ENABLE_MOCK_FALLBACK \
    VITE_MOCK_LATENCY_MS=$VITE_MOCK_LATENCY_MS

RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine

# Default port for local / container runtime
ENV PORT=80

# Copy built distribution from stage 1 (clean overwrite of default html)
COPY --from=build /app/dist /usr/share/nginx/html

# Copy customized Nginx template for dynamic PORT substitution by docker-entrypoint
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expose standard HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:${PORT}/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
