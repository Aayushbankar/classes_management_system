from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse

from .models import FeePayment
from .serializers import FeePaymentSerializer
from .utils import render_to_pdf
from notifications.models import Notification
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404


class FeePaymentViewSet(viewsets.ModelViewSet):
    queryset = FeePayment.objects.select_related('student').all()
    serializer_class = FeePaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        payment = serializer.save()
        student = payment.student
        Notification.objects.create(
            branch=student.branch,
            title=f'Fee payment recorded for {student.name}',
            message=f'₹{payment.amount} was added for {student.name} on {payment.payment_date}.',
            type='system',
            target_role='all',
        )
        return payment

    def get_queryset(self):
        queryset = super().get_queryset()
        branch_id = self.request.query_params.get('branch')
        batch_time = self.request.query_params.get('batch')
        student_id = self.request.query_params.get('student')

        user = self.request.user
        if user.is_superuser or getattr(user, 'role', None) == 'owner':
            if branch_id:
                queryset = queryset.filter(student__branch_id=branch_id)
        else:
            if hasattr(user, 'branch') and user.branch:
                queryset = queryset.filter(student__branch=user.branch)
            else:
                return queryset.none()

        std = self.request.query_params.get('standard')
        if std:
            queryset = queryset.filter(student__standard=std)

        if batch_time:
            queryset = queryset.filter(student__batch_time=batch_time)

        if student_id:
            queryset = queryset.filter(student_id=student_id)

        return queryset

    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        payment = get_object_or_404(FeePayment, pk=pk)
        
        # Check permissions
        user = request.user
        if not (user.is_superuser or getattr(user, 'role', None) == 'owner'):
            if hasattr(user, 'branch') and user.branch:
                if payment.student.branch != user.branch:
                    return HttpResponse("Unauthorized", status=403)
        
        context = {
            'payment': payment,
            'student': payment.student,
        }
        return render_to_pdf('finance/receipt_pdf.html', context)
