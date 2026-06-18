import pika
import json
import os

def publish_event(routing_key, payload):
    url = os.environ["RABBITMQ_URL"]
    params = pika.URLParameters(url)

    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(
        exchange="auth.events",
        exchange_type="topic",
        durable=True
    )

    channel.basic_publish(
        exchange="auth.events",
        routing_key=routing_key,
        body=json.dumps(payload),
        properties=pika.BasicProperties(
            content_type="application/json",
            delivery_mode=2
        )
    )

    connection.close()