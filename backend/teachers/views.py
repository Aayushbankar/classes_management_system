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
        user = self.request.user
        if user.is_superuser or getattr(user, 'role', None) == 'owner':
            if branch_id:
                return queryset.filter(branch_id=branch_id)
            return queryset
        
        if hasattr(user, 'branch') and user.branch:
            return queryset.filter(branch=user.branch)
            
        return queryset.none()
