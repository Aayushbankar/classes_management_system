from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register_view,
    login_view,
    user_profile_view,
    update_profile_view,
    change_password_view,
    logout_view,
    health_check,
    UserViewSet,
)

app_name = 'authentication'

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('profile/', user_profile_view, name='profile'),
    path('profile/update/', update_profile_view, name='update-profile'),
    path('change-password/', change_password_view, name='change-password'),
    path('logout/', logout_view, name='logout'),
    path('health/', health_check, name='health'),
]
