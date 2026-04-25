from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [
        ('manual', 'Manual'),
        ('system', 'System'),
        ('reminder', 'Reminder'),
    ]

    TARGET_ROLES = [
        ('admin', 'Admin'),
        ('branch_manager', 'Branch Manager'),
        ('staff', 'Staff'),
        ('all', 'All Users'),
    ]

    branch = models.ForeignKey('branches.Branch', null=True, blank=True, on_delete=models.SET_NULL, related_name='notifications')
    recipient = models.ForeignKey('authentication.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    type = models.CharField(max_length=16, choices=TYPE_CHOICES, default='manual')
    target_role = models.CharField(max_length=24, choices=TARGET_ROLES, default='all')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"{self.title} ({self.type})"
