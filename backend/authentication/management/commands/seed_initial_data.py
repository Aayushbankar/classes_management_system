from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from branches.models import Branch
from students.models import Student
from teachers.models import Teacher
from finance.models import FeePayment
from schedule.models import TimetableSlot, TestSchedule
from notifications.models import Notification

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed initial branches, students, teachers, timetable, test schedules, fee payments, and notifications.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding initial data...')

        branches = [
            {
                'name': 'Central Campus',
                'code': 'CENTRAL',
                'address': '123 Main Street, Downtown',
                'city': 'Mumbai',
            },
            {
                'name': 'East Campus',
                'code': 'EAST',
                'address': '56 East Avenue, Powai',
                'city': 'Mumbai',
            },
        ]

        created_branches = []
        for branch_data in branches:
            branch, created = Branch.objects.get_or_create(
                code=branch_data['code'],
                defaults={
                    'name': branch_data['name'],
                    'address': branch_data['address'],
                    'city': branch_data['city'],
                    'is_active': True,
                }
            )
            created_branches.append(branch)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created branch: {branch.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Branch already exists: {branch.name}"))

        # Create teachers
        teachers_by_branch = {
            'CENTRAL': [
                {'name': 'Riya Sharma', 'subject': 'Mathematics', 'assigned_standard': 'Class 10'},
                {'name': 'Amit Patel', 'subject': 'Science', 'assigned_standard': 'Class 9'},
                {'name': 'Sneha Joshi', 'subject': 'English', 'assigned_standard': 'Class 11'},
            ],
            'EAST': [
                {'name': 'Deepak Singh', 'subject': 'Physics', 'assigned_standard': 'Class 10'},
                {'name': 'Priya Menon', 'subject': 'Chemistry', 'assigned_standard': 'Class 12'},
                {'name': 'Nikhil Verma', 'subject': 'Biology', 'assigned_standard': 'Class 9'},
            ],
        }

        for branch in created_branches:
            for teacher_data in teachers_by_branch.get(branch.code, []):
                teacher, created = Teacher.objects.get_or_create(
                    branch=branch,
                    name=teacher_data['name'],
                    defaults={
                        'email': f"{teacher_data['name'].split()[0].lower()}@eklavya.edu",
                        'phone': '9999999999',
                        'subject': teacher_data['subject'],
                        'assigned_standard': teacher_data['assigned_standard'],
                        'is_active': True,
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created teacher: {teacher.name} in {branch.code}"))

        # Create students and fee payments
        student_templates = [
            {
                'name': 'Rahul Gupta',
                'parent_name': 'Sunil Gupta',
                'standard': 'Class 10',
                'batch_time': '10:00 AM',
                'roll_number': 'C10-001',
                'decided_fee': 45000.00,
                'paid_fee': 35000.00,
                'status': Student.STATUS_ACTIVE,
                'contact_number': '9876543210',
            },
            {
                'name': 'Meera Kaur',
                'parent_name': 'Anita Kaur',
                'standard': 'Class 9',
                'batch_time': '12:00 PM',
                'roll_number': 'C09-002',
                'decided_fee': 42000.00,
                'paid_fee': 42000.00,
                'status': Student.STATUS_ACTIVE,
                'contact_number': '9123456780',
            },
            {
                'name': 'Sameer Shah',
                'parent_name': 'Ramesh Shah',
                'standard': 'Class 11',
                'batch_time': '04:00 PM',
                'roll_number': 'C11-003',
                'decided_fee': 50000.00,
                'paid_fee': 20000.00,
                'status': Student.STATUS_ACTIVE,
                'contact_number': '9988776655',
            },
            {
                'name': 'Nina Joshi',
                'parent_name': 'Pooja Joshi',
                'standard': 'Class 12',
                'batch_time': '06:00 PM',
                'roll_number': 'C12-004',
                'decided_fee': 52000.00,
                'paid_fee': 52000.00,
                'status': Student.STATUS_INACTIVE,
                'contact_number': '9012345678',
            },
        ]

        for branch in created_branches:
            for template in student_templates:
                student, created = Student.objects.get_or_create(
                    branch=branch,
                    roll_number=template['roll_number'] + f"-{branch.code}",
                    defaults={
                        'name': template['name'],
                        'parent_name': template['parent_name'],
                        'contact_number': template['contact_number'],
                        'address': f"{branch.name} campus address",
                        'standard': template['standard'],
                        'batch_time': template['batch_time'],
                        'admission_date': date.today() - timedelta(days=120),
                        'decided_fee': template['decided_fee'],
                        'paid_fee': template['paid_fee'],
                        'status': template['status'],
                        'critical_notes': 'Needs weekly progress review' if template['status'] == Student.STATUS_ACTIVE else '',
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created student: {student.name} in {branch.code}"))

                    due_amount = student.decided_fee - student.paid_fee
                    due_amount = due_amount if due_amount > 0 else 0
                    create_amount = student.paid_fee if student.paid_fee > 0 else 0
                    if create_amount > 0:
                        FeePayment.objects.get_or_create(
                            student=student,
                            payment_date=date.today() - timedelta(days=15),
                            amount=min(create_amount, student.decided_fee),
                            payment_mode='upi',
                            defaults={
                                'reference': f'PAY-{student.roll_number}',
                                'notes': 'Initial fee payment',
                            }
                        )
                    if due_amount > 0:
                        FeePayment.objects.get_or_create(
                            student=student,
                            payment_date=date.today() - timedelta(days=5),
                            amount=due_amount,
                            payment_mode='cash',
                            defaults={
                                'reference': f'DUE-{student.roll_number}',
                                'notes': 'Pending fee due',
                            }
                        )

        # Create timetable and test schedules
        timetable_templates = [
            {'standard': 'Class 10', 'batch_time': '10:00 AM', 'day_of_week': 'monday', 'subject': 'Mathematics'},
            {'standard': 'Class 9', 'batch_time': '12:00 PM', 'day_of_week': 'wednesday', 'subject': 'Science'},
            {'standard': 'Class 11', 'batch_time': '04:00 PM', 'day_of_week': 'friday', 'subject': 'English'},
        ]

        test_schedule_templates = [
            {'standard': 'Class 10', 'title': 'Chapter 3 Practice Test', 'description': 'Math assessment for upcoming board exams', 'reminder_days_before': 2},
            {'standard': 'Class 9', 'title': 'Periodic Science Evaluation', 'description': 'Science test on current chapter topics', 'reminder_days_before': 3},
        ]

        for branch in created_branches:
            for slot in timetable_templates:
                start = '10:00' if slot['day_of_week'] == 'monday' else '12:00' if slot['day_of_week'] == 'wednesday' else '16:00'
                end = '11:00' if slot['day_of_week'] == 'monday' else '13:00' if slot['day_of_week'] == 'wednesday' else '17:00'
                timetable, created = TimetableSlot.objects.get_or_create(
                    branch=branch,
                    standard=slot['standard'],
                    day_of_week=slot['day_of_week'],
                    start_time=start,
                    end_time=end,
                    subject=slot['subject'],
                    defaults={
                        'batch_time': slot['batch_time'],
                        'location': 'Room 101',
                        'notes': 'Live class for students',
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created timetable slot for {branch.code}: {timetable.subject}"))

            for test in test_schedule_templates:
                test_date = date.today() + timedelta(days=3 if test['standard'] == 'Class 10' else 5)
                schedule, created = TestSchedule.objects.get_or_create(
                    branch=branch,
                    standard=test['standard'],
                    title=test['title'],
                    defaults={
                        'description': test['description'],
                        'test_date': test_date,
                        'reminder_days_before': test['reminder_days_before'],
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created test schedule: {schedule.title} in {branch.code}"))

            Notification.objects.get_or_create(
                branch=branch,
                title=f'Welcome to {branch.name}',
                defaults={
                    'message': 'Your branch is set up with sample students, teachers, and reports.',
                    'type': 'system',
                    'target_role': 'all',
                }
            )
            Notification.objects.get_or_create(
                branch=branch,
                title='New weekly report available',
                defaults={
                    'message': 'Review incoming payment and timetable summaries for your branch.',
                    'type': 'reminder',
                    'target_role': 'all',
                }
            )

        self.stdout.write(self.style.SUCCESS('Seed data completed.'))
