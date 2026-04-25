from django.db import models


class Teacher(models.Model):
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='teachers')
    name = models.CharField(max_length=140)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=24, blank=True)
    subject = models.CharField(max_length=120, blank=True)
    assigned_standard = models.CharField(max_length=64, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Teacher'
        verbose_name_plural = 'Teachers'

    def __str__(self):
        return f"{self.name} ({self.subject})"
