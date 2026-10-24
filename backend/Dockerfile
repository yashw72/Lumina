FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Install CPU-only PyTorch first to keep image lightweight (~150MB instead of 800MB+)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install application dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Set Hugging Face cache directory and thread optimization for low-memory environments
ENV HF_HOME=/app/hf_cache \
    TRANSFORMERS_OFFLINE=1 \
    HF_HUB_OFFLINE=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1

# Pre-download the default embedding model into /app/hf_cache at build time
RUN mkdir -p /app/hf_cache && \
    python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Create non-root user and ensure ownership of /app including hf_cache and data
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/data /app/hf_cache && \
    chown -R appuser:appuser /app

# Copy entrypoint and application code
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

COPY --chown=appuser:appuser . .

EXPOSE 8000

# Entrypoint script configures volume permissions and starts uvicorn as appuser
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
