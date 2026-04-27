from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import TimetableSlot, TestSchedule
from .serializers import TimetableSlotSerializer, TestScheduleSerializer


class TimetableSlotViewSet(viewsets.ModelViewSet):
    queryset = TimetableSlot.objects.select_related('branch', 'teacher').all()
    serializer_class = TimetableSlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        branch_id = self.request.query_params.get('branch')
        standard = self.request.query_params.get('standard')
        batch_time = self.request.query_params.get('batch_time')

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
        if batch_time:
            queryset = queryset.filter(batch_time__icontains=batch_time)
        
        teacher_id = self.request.query_params.get('teacher')
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)

        return queryset


class TestScheduleViewSet(viewsets.ModelViewSet):
    queryset = TestSchedule.objects.select_related('branch').all()
    serializer_class = TestScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        branch_id = self.request.query_params.get('branch')
        if self.request.user.is_superuser:
            if branch_id:
                return queryset.filter(branch_id=branch_id)
            return queryset
        if hasattr(self.request.user, 'branch') and self.request.user.branch:
            return queryset.filter(branch=self.request.user.branch)
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        return queryset
