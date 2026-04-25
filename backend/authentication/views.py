from django.db.models import Q
from django.contrib.auth import authenticate
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission, SAFE_METHODS
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import PermissionDenied

from .models import User, UserActionLog
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UserManagementSerializer,
    LoginResponseSerializer,
    ChangePasswordSerializer,
)


class UserManagementPermission(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.role == User.ROLE_OWNER:
            return True

        if request.user.role == User.ROLE_ADMIN:
            if obj.id == request.user.id:
                return True
            if request.method in SAFE_METHODS:
                return obj.branch_id == request.user.branch_id
            if request.method in ['PUT', 'PATCH', 'DELETE']:
                return obj.role == User.ROLE_ASSISTANT and obj.branch_id == request.user.branch_id
            return False

        # Assistants can only read their own profile
        if request.method in SAFE_METHODS:
            return obj.id == request.user.id
        return False


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('branch').all()
    permission_classes = [IsAuthenticated, UserManagementPermission]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserManagementSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == User.ROLE_OWNER:
            return User.objects.select_related('branch').all()
        if user.role == User.ROLE_ADMIN:
            return User.objects.select_related('branch').filter(
                Q(branch=user.branch) | Q(id=user.id)
            )
        return User.objects.filter(id=user.id)

    def perform_create(self, serializer):
        actor = self.request.user
        data = serializer.validated_data

        if actor.role == User.ROLE_ADMIN:
            if data.get('role') == User.ROLE_ADMIN:
                raise PermissionDenied('Admin cannot create another admin.')
            data['role'] = User.ROLE_ASSISTANT
            data['branch'] = actor.branch

        if actor.role not in [User.ROLE_OWNER, User.ROLE_ADMIN] and not actor.is_superuser:
            raise PermissionDenied('Only owners or admins can create users.')

        created = serializer.save()
        UserActionLog.objects.create(
            actor=actor,
            target_user=created,
            action=UserActionLog.ACTION_CREATE,
            details=f'Created by {actor.username}',
        )

    def perform_update(self, serializer):
        actor = self.request.user
        if actor.role == User.ROLE_ADMIN:
            data = serializer.validated_data
            if data.get('role') == User.ROLE_ADMIN:
                raise PermissionDenied('Admin cannot promote users to admin.')
            if 'branch' in data and data.get('branch') != actor.branch:
                raise PermissionDenied('Admin can only manage users in their own branch.')

        updated = serializer.save()
        UserActionLog.objects.create(
            actor=actor,
            target_user=updated,
            action=UserActionLog.ACTION_UPDATE,
            details=f'Updated by {actor.username}',
        )

    def perform_destroy(self, instance):
        actor = self.request.user
        if actor.role == User.ROLE_ADMIN and instance.role != User.ROLE_ASSISTANT:
            raise PermissionDenied('Admin can only delete assistant users.')

        UserActionLog.objects.create(
            actor=actor,
            target_user=instance,
            action=UserActionLog.ACTION_DELETE,
            details=f'Deleted by {actor.username}',
        )
        instance.delete()


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login user with username and password
    Returns JWT tokens and user data
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        response_data = {
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
        return Response(response_data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """
    Get current user profile
    """
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """
    Update user profile information
    """
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Change user password
    """
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)

    if serializer.is_valid():
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']

        if not user.check_password(old_password):
            return Response(
                {'error': 'Invalid old password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        UserActionLog.objects.create(
            actor=user,
            target_user=user,
            action=UserActionLog.ACTION_PASSWORD_CHANGE,
            details='Password changed.',
        )
        return Response(
            {'message': 'Password updated successfully.'},
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user (optional - JWT tokens are stateless)
    """
    UserActionLog.objects.create(
        actor=request.user,
        target_user=request.user,
        action=UserActionLog.ACTION_LOGOUT,
        details='User logged out.',
    )
    return Response(
        {'message': 'Logout successful.'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint
    """
    return Response({'status': 'API is running'}, status=status.HTTP_200_OK)
