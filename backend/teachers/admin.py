from django.contrib import admin
from .models import Teacher


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'subject', 'assigned_standard', 'is_active')
    list_filter = ('branch', 'subject', 'assigned_standard', 'is_active')
    search_fields = ('name', 'email', 'phone', 'subject')
