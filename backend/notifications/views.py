from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationPermission(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or getattr(request.user, 'role', None) == 'admin':
            return True

        if request.method in SAFE_METHODS or view.action == 'mark_read':
            if obj.recipient_id:
                return obj.recipient_id == request.user.id
            if obj.target_role == 'all' or obj.target_role == getattr(request.user, 'role', None):
                return True
            if obj.branch and hasattr(request.user, 'branch') and request.user.branch and obj.branch_id == request.user.branch_id:
                return True
            return False

        return False


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.select_related('branch', 'recipient').all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, NotificationPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_superuser or getattr(self.request.user, 'role', None) == 'admin':
            return queryset

        query = Q(recipient=self.request.user) | Q(target_role='all') | Q(target_role=self.request.user.role)
        if hasattr(self.request.user, 'branch') and self.request.user.branch:
            query |= Q(branch=self.request.user.branch)

        return queryset.filter(query).distinct()

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'}, status=status.HTTP_200_OK)
    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        queryset = self.get_queryset().filter(is_read=False)
        queryset.update(is_read=True)
        return Response({'status': 'all marked as read'}, status=status.HTTP_200_OK)
