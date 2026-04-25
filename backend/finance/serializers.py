from rest_framework import serializers
from .models import FeePayment


class FeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_branch_name = serializers.CharField(source='student.branch.name', read_only=True)
    student_standard = serializers.CharField(source='student.standard', read_only=True)
    student_batch_time = serializers.CharField(source='student.batch_time', read_only=True)

    class Meta:
        model = FeePayment
        fields = (
            'id', 'student', 'student_name', 'student_branch_name', 'student_standard', 'student_batch_time',
            'amount', 'payment_date', 'payment_mode', 'reference', 'notes', 'created_at'
        )
        read_only_fields = ('id', 'student_name', 'student_branch_name', 'student_standard', 'student_batch_time', 'created_at')
