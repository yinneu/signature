from django.db import models
from django.utils import timezone


class UploadedFile(models.Model):
    file_path = models.CharField(max_length=255)
    user_uuid = models.CharField(max_length=36)
    uploaded_at = models.DateTimeField(default=timezone.now)
    expiration_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.file_path
