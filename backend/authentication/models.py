from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_OWNER = 'owner'
    ROLE_ADMIN = 'admin'
    ROLE_ASSISTANT = 'assistant'
    ROLE_CHOICES = [
        (ROLE_OWNER, 'Owner'),
        (ROLE_ADMIN, 'Admin'),
        (ROLE_ASSISTANT, 'Assistant'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=24, choices=ROLE_CHOICES, default=ROLE_ASSISTANT)
    branch = models.ForeignKey('branches.Branch', null=True, blank=True, on_delete=models.SET_NULL, related_name='users')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.username} - {self.email}"


class UserActionLog(models.Model):
    ACTION_CREATE = 'create'
    ACTION_UPDATE = 'update'
    ACTION_DELETE = 'delete'
    ACTION_PASSWORD_CHANGE = 'password_change'
    ACTION_LOGIN = 'login'
    ACTION_LOGOUT = 'logout'

    ACTION_CHOICES = [
        (ACTION_CREATE, 'Create'),
        (ACTION_UPDATE, 'Update'),
        (ACTION_DELETE, 'Delete'),
        (ACTION_PASSWORD_CHANGE, 'Password Change'),
        (ACTION_LOGIN, 'Login'),
        (ACTION_LOGOUT, 'Logout'),
    ]

    actor = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='action_logs',
    )
    target_user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='target_logs',
    )
    action = models.CharField(max_length=32, choices=ACTION_CHOICES)
    details = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'User Action Log'
        verbose_name_plural = 'User Action Logs'

    def __str__(self):
        actor = self.actor.username if self.actor else 'system'
        target = self.target_user.username if self.target_user else 'unknown'
        return f"{self.timestamp.isoformat()} {actor} {self.action} {target}"
