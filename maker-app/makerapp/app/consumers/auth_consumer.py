import pika
import json
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "makerapp.settings")
django.setup()

from app.models import User
from django.contrib.auth.models import Group

def handle_user_created(payload: dict):
    User.objects.get_or_create(
        auth_id=payload["id"],
        defaults={
            "cpf": payload["cpf"],
            "email": payload["email"],
            "name": payload["name"],
            "cellphone": payload["cellphone"],
            "bond": payload["bond"],
            "enrollment": payload["enrollment"],
            "groups": payload["groups"],
            "is_active": payload["is_active"],
        }
    )

def handle_user_updated(payload: dict):
    User.objects.filter(auth_id=payload["id"]).update(
        email=payload["email"],
        name=payload["name"],
        bond=payload["bond"],
        enrollment=payload.get("enrollment"),
        groups=payload["groups"],
        is_active=payload["is_active"],
    )

def handle_user_deleted(payload: dict):
    User.objects.filter(auth_id=payload["id"]).delete()

HANDLERS = {
    "user.created": handle_user_created,
    "user.updated": handle_user_updated,
    "user.deleted": handle_user_deleted,
}

def on_message(channel, method, properties, body):
    payload = json.loads(body)
    handler = HANDLERS.get(method.routing_key)
    if handler:
        handler(payload)
    channel.basic_ack(delivery_tag=method.delivery_tag)

def start():
    url = os.environ["RABBITMQ_URL"]
    params = pika.URLParameters(url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(
        exchange="auth.events",
        exchange_type="topic",
        durable=True
    )

    result = channel.queue_declare(queue="scheduling.auth", durable=True)
    queue_name = result.method.queue

    # escuta todos os eventos de user.*
    channel.queue_bind(
        exchange="auth.events",
        queue=queue_name,
        routing_key="user.*"
    )

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=queue_name, on_message_callback=on_message)
    channel.start_consuming()

if __name__ == "__main__":
    start()