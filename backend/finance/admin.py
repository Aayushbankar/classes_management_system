from django.contrib import admin
from .models import FeePayment


@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('student', 'amount', 'payment_date', 'payment_mode', 'reference')
    list_filter = ('payment_mode', 'payment_date')
    search_fields = ('student__name', 'reference', 'notes')
