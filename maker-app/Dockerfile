FROM python:3.12-slim

WORKDIR /app

COPY makerapp/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY makerapp/ .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]