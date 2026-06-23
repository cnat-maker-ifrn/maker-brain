FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY makerapp/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY makerapp/ .

CMD ["sh", "-c", "mkdir -p /app/data && python manage.py migrate && python manage.py runserver 0.0.0.0:8001"]