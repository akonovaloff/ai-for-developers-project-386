# Stage 1: build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN VITE_API_URL="" npm run build

# Stage 2: final image
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim
WORKDIR /app

COPY backend/pyproject.toml backend/uv.lock ./
COPY backend/ .
RUN uv sync --frozen --no-dev

COPY --from=frontend-builder /app/dist ./frontend/dist

EXPOSE 8000
CMD uv run uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
