from celery import Celery
from celery.schedules import crontab
from core.config import settings

celery_app = Celery(
    "blog_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
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

    # ── Periodic tasks (Celery Beat) ──────────────────────────────────────
    beat_schedule={
        "weekly-digest-every-monday": {
            "task": "worker.tasks.send_weekly_digest",
            "schedule": crontab(hour=8, minute=0, day_of_week=1),  # Mon 08:00 UTC
        },
    },
)
