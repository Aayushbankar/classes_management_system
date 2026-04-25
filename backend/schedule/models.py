from django.db import models


class TimetableSlot(models.Model):
    DAYS = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]

    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='timetable_slots')
    standard = models.CharField(max_length=64)
    batch_time = models.CharField(max_length=64)
    day_of_week = models.CharField(max_length=16, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()
    subject = models.CharField(max_length=120)
    teacher = models.ForeignKey('teachers.Teacher', null=True, blank=True, on_delete=models.SET_NULL, related_name='timetable_slots')
    location = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['day_of_week', 'start_time']
        verbose_name = 'Timetable Slot'
        verbose_name_plural = 'Timetable Slots'

    def __str__(self):
        return f"{self.standard} {self.day_of_week} {self.start_time} - {self.subject}"


class TestSchedule(models.Model):
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='test_schedules')
    standard = models.CharField(max_length=64)
    title = models.CharField(max_length=140)
    description = models.TextField(blank=True)
    test_date = models.DateField()
    reminder_days_before = models.PositiveSmallIntegerField(default=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-test_date']
        verbose_name = 'Test Schedule'
        verbose_name_plural = 'Test Schedules'

    def __str__(self):
        return f"{self.title} for {self.standard} on {self.test_date}"
