FROM python:3.12-slim

WORKDIR /app

ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .

RUN pip install --no-cache-dir uv && uv pip install --system --no-cache -e .[dev]

COPY . .

RUN chmod +x /app/scripts/start_api.sh && sed -i 's/\r$//' /app/scripts/start_api.sh

EXPOSE 8000

ENV PORT=8000

CMD ["/app/scripts/start_api.sh"]
