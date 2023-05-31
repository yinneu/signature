from django.db import models
from django.utils import timezone


class UploadedFile(models.Model):
    user_uuid = models.CharField(primary_key=True, max_length=36)
    file_path = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(default=timezone.now)
    expiration_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.file_path
