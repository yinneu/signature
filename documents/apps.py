from django.apps import AppConfig
from django.db import models
from django.utils import timezone


class DocumentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'documents'
