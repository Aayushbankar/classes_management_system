import csv
from io import TextIOWrapper
from datetime import datetime

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Student
from .serializers import StudentSerializer
from finance.serializers import FeePaymentSerializer
from finance.models import FeePayment


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('branch').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = super().get_queryset()
        branch_id = self.request.query_params.get('branch')
        standard = self.request.query_params.get('standard')
        name = self.request.query_params.get('name')

        if self.request.user.is_superuser:
            if branch_id:
                queryset = queryset.filter(branch_id=branch_id)
        else:
            if hasattr(self.request.user, 'branch') and self.request.user.branch:
                queryset = queryset.filter(branch=self.request.user.branch)
            elif branch_id:
                queryset = queryset.filter(branch_id=branch_id)

        if standard:
            queryset = queryset.filter(standard__icontains=standard)
        if name:
            queryset = queryset.filter(name__icontains=name)

        return queryset

    @action(detail=True, methods=['get'], url_path='fees')
    def fees(self, request, pk=None):
        student = self.get_object()
        payments = FeePayment.objects.filter(student=student).order_by('-payment_date')
        serializer = FeePaymentSerializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='import')
    def import_students(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'CSV or XLS file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        wrapper = TextIOWrapper(file_obj.file, encoding='utf-8')
        reader = csv.DictReader(wrapper)
        created, skipped = 0, 0
        errors = []

        for row_index, row in enumerate(reader, start=1):
            try:
                branch_id = row.get('branch') or request.data.get('branch')
                payload = {
                    'branch': branch_id,
                    'name': row.get('name', '').strip(),
                    'parent_name': row.get('parent_name', '').strip(),
                    'contact_number': row.get('contact_number', '').strip(),
                    'address': row.get('address', '').strip(),
                    'standard': row.get('standard', '').strip(),
                    'batch_time': row.get('batch_time', '').strip(),
                    'decided_fee': row.get('decided_fee', '0').strip() or '0',
                    'paid_fee': row.get('paid_fee', '0').strip() or '0',
                    'status': row.get('status', 'active').strip() or 'active',
                    'critical_notes': row.get('critical_notes', '').strip(),
                    'roll_number': row.get('roll_number', '').strip(),
                    'admission_date': row.get('admission_date', '').strip() or None,
                }

                if payload['admission_date']:
                    payload['admission_date'] = datetime.strptime(payload['admission_date'], '%Y-%m-%d').date()

                serializer = self.get_serializer(data=payload)
                if serializer.is_valid():
                    serializer.save()
                    created += 1
                else:
                    skipped += 1
                    errors.append({'row': row_index, 'message': serializer.errors})
            except Exception as exc:
                skipped += 1
                errors.append({'row': row_index, 'message': str(exc)})

        return Response({'created_count': created, 'skipped_count': skipped, 'errors': errors})
