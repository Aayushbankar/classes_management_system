from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)

    class Meta:
        model = Notification
        fields = ('id', 'branch', 'branch_name', 'recipient', 'recipient_username', 'title', 'message', 'type', 'target_role', 'is_read', 'created_at')
        read_only_fields = ('id', 'branch_name', 'recipient_username', 'created_at')
