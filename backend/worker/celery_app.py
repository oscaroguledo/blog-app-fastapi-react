from celery import Celery
from core.config import settings

# Use Redis as both broker and result backend
# Convert async URL to sync for Celery (celery doesn't use asyncpg)
_broker_url = settings.REDIS_URL

celery_app = Celery(
    "blog_worker",
    broker=_broker_url,
    backend=_broker_url,
    include=["worker.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
)
