from rest_framework import serializers
from .models import TimetableSlot, TestSchedule


class TimetableSlotSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)

    class Meta:
        model = TimetableSlot
        fields = (
            'id', 'branch', 'standard', 'batch_time', 'day_of_week', 'start_time', 'end_time',
            'subject', 'teacher', 'teacher_name', 'location', 'notes', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'teacher_name', 'created_at', 'updated_at')


class TestScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestSchedule
        fields = ('id', 'branch', 'standard', 'title', 'description', 'test_date', 'reminder_days_before', 'created_at')
        read_only_fields = ('id', 'created_at',)
