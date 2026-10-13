FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download embedding model for fast cold start
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Copy backend application files
COPY . .

# Expose backend port
EXPOSE 8000

# Start server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
