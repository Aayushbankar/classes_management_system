from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'standard', 'batch_time', 'status', 'decided_fee', 'paid_fee', 'fee_left')
    list_filter = ('branch', 'standard', 'status', 'batch_time')
    search_fields = ('name', 'parent_name', 'contact_number', 'roll_number')
