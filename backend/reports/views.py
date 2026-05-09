from datetime import date, timedelta
from django.db import models
from django.db.models import Count, Sum, Q
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from students.models import Student
from finance.models import FeePayment
from schedule.models import TestSchedule, TimetableSlot
from teachers.models import Teacher
from branches.models import Branch


class DashboardStudentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        students = Student.objects.all()
        if not request.user.is_superuser and hasattr(request.user, 'branch') and request.user.branch:
            students = students.filter(branch=request.user.branch)

        active_students = students.filter(status=Student.STATUS_ACTIVE).count()
        pending_fee_students = students.filter(paid_fee__lt=models.F('decided_fee')).count()
        total_students = students.count()

        return Response({
            'total_students': total_students,
            'active_students': active_students,
            'pending_fee_students': pending_fee_students,
        })


class DashboardTestRemindersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        window = today + timedelta(days=7)
        tests = TestSchedule.objects.filter(test_date__range=(today, window))
        if not request.user.is_superuser and hasattr(request.user, 'branch') and request.user.branch:
            tests = tests.filter(branch=request.user.branch)

        items = [
            {
                'id': test.id,
                'title': test.title,
                'standard': test.standard,
                'test_date': test.test_date,
                'reminder_days_before': test.reminder_days_before,
            }
            for test in tests.order_by('test_date')[:20]
        ]
        return Response({'reminders': items})


class FeeReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = FeePayment.objects.all()
        students = Student.objects.all()
        if not request.user.is_superuser and hasattr(request.user, 'branch') and request.user.branch:
            payments = payments.filter(student__branch=request.user.branch)
            students = students.filter(branch=request.user.branch)
        else:
            branch_id = request.query_params.get('branch')
            if branch_id:
                payments = payments.filter(student__branch_id=branch_id)
                students = students.filter(branch_id=branch_id)
                
        std = request.query_params.get('standard')
        if std:
            payments = payments.filter(student__standard=std)
            students = students.filter(standard=std)

        batch = request.query_params.get('batch')
        if batch:
            payments = payments.filter(student__batch_time=batch)
            students = students.filter(batch_time=batch)

        total_expected = students.aggregate(total=Sum('decided_fee'))['total'] or 0
        total_collected = payments.aggregate(total=Sum('amount'))['total'] or 0
        pending = total_expected - total_collected

        return Response({
            'total_expected_revenue': total_expected,
            'total_collected_revenue': total_collected,
            'pending_revenue': pending,
        })


class TimetableReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        slots = TimetableSlot.objects.all()
        if not request.user.is_superuser and hasattr(request.user, 'branch') and request.user.branch:
            slots = slots.filter(branch=request.user.branch)

        grouped = slots.values('standard', 'day_of_week').annotate(count=Count('id')).order_by('standard', 'day_of_week')
        report = [
            {'standard': item['standard'], 'day_of_week': item['day_of_week'], 'slot_count': item['count']}
            for item in grouped
        ]
        return Response({'timetable_summary': report})


class ComprehensiveDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        branch = None
        if not request.user.is_superuser and hasattr(request.user, 'branch') and request.user.branch:
            branch = request.user.branch

        students = Student.objects.all()
        teachers = Teacher.objects.all()
        branches = Branch.objects.all()
        payments = FeePayment.objects.all()

        if branch:
            students = students.filter(branch=branch)
            teachers = teachers.filter(branch=branch)
            branches = branches.filter(id=branch.id)
            payments = payments.filter(student__branch=branch)

        total_students = students.count()
        total_teachers = teachers.count()
        total_branches = branches.count()
        
        total_expected = students.aggregate(total=Sum('decided_fee'))['total'] or 0
        total_collected = payments.aggregate(total=Sum('amount'))['total'] or 0
        pending_revenue = total_expected - total_collected

        return Response({
            'total_students': total_students,
            'total_teachers': total_teachers,
            'total_courses': 8, # mock
            'total_branches': total_branches,
            'attendance_percent': 95, # mock
            'total_collected_revenue': total_collected,
            'pending_revenue': pending_revenue,
            'results_percent': 90, # mock
            'total_staff': total_teachers + 5 # mock staff count
        })


class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'results': []})

        branch = None
        if not request.user.is_superuser and hasattr(request.user, 'branch') and request.user.branch:
            branch = request.user.branch

        results = []

        # Search Students
        students = Student.objects.filter(
            Q(name__icontains=query) | 
            Q(contact_number__icontains=query) | 
            Q(roll_number__icontains=query)
        )
        if branch:
            students = students.filter(branch=branch)
        
        for student in students[:10]:
            results.append({
                'id': f"student-{student.id}",
                'type': 'student',
                'title': student.name,
                'subtitle': f"Std: {student.standard} | Roll: {student.roll_number}",
                'path': f'/app/students/{student.id}',
                'icon': '🎓'
            })

        # Search Teachers
        teachers = Teacher.objects.filter(
            Q(name__icontains=query) | 
            Q(subject__icontains=query)
        )
        if branch:
            teachers = teachers.filter(branch=branch)
            
        for teacher in teachers[:5]:
            results.append({
                'id': f"teacher-{teacher.id}",
                'type': 'teacher',
                'title': teacher.name,
                'subtitle': f"Subject: {teacher.subject}",
                'path': f'/app/teachers/{teacher.id}',
                'icon': '👩‍🏫'
            })

        # Search Fee Payments
        payments = FeePayment.objects.filter(
            Q(reference__icontains=query) | 
            Q(student__name__icontains=query)
        )
        if branch:
            payments = payments.filter(student__branch=branch)
            
        for payment in payments[:5]:
            results.append({
                'id': f"payment-{payment.id}",
                'type': 'fee',
                'title': f"₹{payment.amount} - {payment.student.name}",
                'subtitle': f"Mode: {payment.payment_mode} | Ref: {payment.reference or 'N/A'}",
                'path': '/app/fees',
                'icon': '💰'
            })

        return Response({'results': results})
