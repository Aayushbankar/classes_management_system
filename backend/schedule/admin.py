from django.contrib import admin
from .models import TimetableSlot, TestSchedule


@admin.register(TimetableSlot)
class TimetableSlotAdmin(admin.ModelAdmin):
    list_display = ('branch', 'standard', 'day_of_week', 'start_time', 'end_time', 'subject', 'teacher')
    list_filter = ('branch', 'standard', 'day_of_week')
    search_fields = ('subject', 'location', 'teacher__name')


@admin.register(TestSchedule)
class TestScheduleAdmin(admin.ModelAdmin):
    list_display = ('title', 'branch', 'standard', 'test_date', 'reminder_days_before')
    list_filter = ('branch', 'standard', 'test_date')
    search_fields = ('title', 'description')
