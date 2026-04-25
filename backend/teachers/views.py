from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Teacher
from .serializers import TeacherSerializer


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related('branch').all()
    serializer_class = TeacherSerializer
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
