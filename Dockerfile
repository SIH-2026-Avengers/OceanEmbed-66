# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/Frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Static Host
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TF_ENABLE_ONEDNN_OPTS=0 \
    TF_CPP_MIN_LOG_LEVEL=2

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py oceanembed_best.keras ./
COPY --from=frontend-builder /app/Frontend/dist ./Frontend/dist

EXPOSE 8000
ENV PORT=8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
