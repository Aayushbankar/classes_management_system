from django.db import models
from decimal import Decimal


class Student(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_INACTIVE, 'Inactive'),
    ]

    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='students')
    name = models.CharField(max_length=140)
    parent_name = models.CharField(max_length=140, blank=True)
    contact_number = models.CharField(max_length=24, blank=True)
    address = models.TextField(blank=True)
    standard = models.CharField(max_length=64, blank=True)
    batch_time = models.CharField(max_length=64, blank=True)
    roll_number = models.CharField(max_length=32, blank=True)
    admission_date = models.DateField(null=True, blank=True)
    decided_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    paid_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    critical_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f"{self.name} ({self.standard})"

    @property
    def fee_left(self):
        pending = self.decided_fee - self.paid_fee
        return pending if pending >= Decimal('0.00') else Decimal('0.00')
