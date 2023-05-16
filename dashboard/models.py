from django.db import models
from django.contrib.auth.models import User


class UploadedFile(models.Model):
    file = models.FileField(upload_to='uploads/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
