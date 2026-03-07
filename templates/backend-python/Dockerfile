# =========================
# Backend Python (FastAPI) - Dokploy-ready
# =========================
FROM python:3.11-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency spec first (for better layer caching)
COPY pyproject.toml ./

# Install runtime dependencies only (no dev extras)
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir .

# Copy application source
COPY src ./src
COPY scripts ./scripts

# Non-root user for security
RUN useradd --create-home --shell /bin/bash app
USER app

# Expose the port (matches settings.PORT default)
EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Start the application (Dokploy can override PORT via env)
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
