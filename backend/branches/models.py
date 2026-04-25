from django.db import models


class Branch(models.Model):
    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=24, unique=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=80, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Branch'
        verbose_name_plural = 'Branches'

    def __str__(self):
        return f"{self.name} ({self.code})"
