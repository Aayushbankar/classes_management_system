from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import TimetableSlotViewSet, TestScheduleViewSet

router = DefaultRouter()
router.register(r'timetable', TimetableSlotViewSet, basename='timetable')
router.register(r'tests', TestScheduleViewSet, basename='test-schedule')

urlpatterns = [
    path('', include(router.urls)),
]
