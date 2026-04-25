from django.db.models import ProtectedError
from rest_framework import status, viewsets
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response

from .models import Branch
from .serializers import BranchSerializer


class BranchManagePermission(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_superuser or getattr(request.user, 'role', None) in ['owner', 'admin']:
            return True
        if request.method in ['PUT', 'PATCH'] and getattr(request.user, 'role', None) == 'branch_manager':
            return request.user.branch_id == obj.id
        return False


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated, BranchManagePermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_superuser:
            return queryset
        if hasattr(self.request.user, 'branch') and self.request.user.branch:
            return queryset.filter(pk=self.request.user.branch.pk)
        return queryset

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    'detail': 'Cannot delete branch because it has related students, teachers, or schedules. Deactivate it instead.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
