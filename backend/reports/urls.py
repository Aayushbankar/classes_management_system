from django.urls import path
from .views import (
    DashboardStudentStatusView,
    DashboardTestRemindersView,
    FeeReportView,
    TimetableReportView,
    ComprehensiveDashboardStatsView,
    GlobalSearchView,
)

urlpatterns = [
    path('dashboard/student-status/', DashboardStudentStatusView.as_view(), name='dashboard-student-status'),
    path('dashboard/test-reminders/', DashboardTestRemindersView.as_view(), name='dashboard-test-reminders'),
    path('dashboard/stats/', ComprehensiveDashboardStatsView.as_view(), name='dashboard-stats'),
    path('reports/fees/', FeeReportView.as_view(), name='reports-fees'),
    path('reports/timetable/', TimetableReportView.as_view(), name='reports-timetable'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
]
