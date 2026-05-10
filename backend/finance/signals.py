from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from decimal import Decimal

from .models import FeePayment
from students.models import Student

@receiver(post_save, sender=FeePayment)
@receiver(post_delete, sender=FeePayment)
def update_student_paid_fee(sender, instance, **kwargs):
    """
    Update the Student.paid_fee whenever a payment is added, updated, or removed.
    """
    student = instance.student
    total_paid = FeePayment.objects.filter(student=student).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    
    # We use update() to avoid triggering the student's own signals if any
    Student.objects.filter(id=student.id).update(paid_fee=total_paid)
