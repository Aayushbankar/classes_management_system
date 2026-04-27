from rest_framework import serializers
from .models import Student
from branches.models import Branch
from finance.models import FeePayment
from django.utils import timezone


class StudentSerializer(serializers.ModelSerializer):
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    fee_left = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payment_mode = serializers.CharField(write_only=True, required=False, default='cash')

    class Meta:
        model = Student
        fields = (
            'id', 'branch', 'branch_name', 'name', 'parent_name', 'contact_number', 'address',
            'standard', 'batch_time', 'roll_number', 'admission_date', 'decided_fee', 'paid_fee',
            'fee_left', 'status', 'critical_notes', 'created_at', 'updated_at', 'payment_mode',
        )
        read_only_fields = ('id', 'branch_name', 'fee_left', 'created_at', 'updated_at')

    def create(self, validated_data):
        payment_mode = validated_data.pop('payment_mode', 'cash')
        student = super().create(validated_data)
        if student.paid_fee > 0:
            FeePayment.objects.create(
                student=student,
                amount=student.paid_fee,
                payment_date=timezone.now().date(),
                payment_mode=payment_mode,
                notes="Initial payment during registration"
            )
        return student
