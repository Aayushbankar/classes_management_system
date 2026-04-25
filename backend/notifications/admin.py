from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'branch', 'type', 'target_role', 'is_read', 'created_at')
    list_filter = ('type', 'target_role', 'is_read', 'branch')
    search_fields = ('title', 'message')
