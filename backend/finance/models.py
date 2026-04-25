from django.db import models


class FeePayment(models.Model):
    PAYMENT_MODES = [
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('upi', 'UPI'),
        ('other', 'Other'),
    ]

    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_mode = models.CharField(max_length=24, choices=PAYMENT_MODES, default='cash')
    reference = models.CharField(max_length=140, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date', '-created_at']
        verbose_name = 'Fee Payment'
        verbose_name_plural = 'Fee Payments'

    def __str__(self):
        return f"{self.student.name} - ₹{self.amount} on {self.payment_date}"
