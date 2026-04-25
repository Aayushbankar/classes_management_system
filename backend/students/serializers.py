from rest_framework import serializers
from .models import Student
from branches.models import Branch


class StudentSerializer(serializers.ModelSerializer):
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    fee_left = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Student
        fields = (
            'id', 'branch', 'branch_name', 'name', 'parent_name', 'contact_number', 'address',
            'standard', 'batch_time', 'roll_number', 'admission_date', 'decided_fee', 'paid_fee',
            'fee_left', 'status', 'critical_notes', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'branch_name', 'fee_left', 'created_at', 'updated_at')
