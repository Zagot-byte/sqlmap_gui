# ---------------------------------------------------------
#  SQLMap GUI — Dockerfile (Auto Clones sqlmap)
# ---------------------------------------------------------
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    SQLMAP_HOME=/app/sqlmap \
    PATH="/app/sqlmap:${PATH}"

WORKDIR /app

# ---------------------------------------------------------
# Install system dependencies required by sqlmap + Python
# ---------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        curl \
        bash \
        build-essential \
        procps \
        ca-certificates \
        libxml2 \
        libxslt1.1 \
        libxslt1-dev \
        libffi-dev \
        python3-dev \
    && rm -rf /var/lib/apt/lists/*


# ---------------------------------------------------------
# Clone sqlmap (repo is not included in project)
# ---------------------------------------------------------
RUN git clone --depth=1 https://github.com/sqlmapproject/sqlmap.git sqlmap


# ---------------------------------------------------------
# Copy project files
# ---------------------------------------------------------
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app


# ---------------------------------------------------------
# Create non-root user (security best practice)
# ---------------------------------------------------------
RUN useradd -m runner && chown -R runner:runner /app
USER runner


# ---------------------------------------------------------
# Expose backend port
# ---------------------------------------------------------
EXPOSE 5000


# ---------------------------------------------------------
# Start Gunicorn (single worker because sqlmap is heavy)
# ---------------------------------------------------------
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "4", "--timeout", "3600"]
