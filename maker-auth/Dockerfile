FROM python:3.12-slim

WORKDIR /app

COPY makerauth/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY makerauth/ .

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]