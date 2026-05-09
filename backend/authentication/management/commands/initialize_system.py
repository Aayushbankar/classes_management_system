from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from branches.models import Branch
from students.models import Student
from teachers.models import Teacher
from finance.models import FeePayment
from schedule.models import TimetableSlot, TestSchedule
from notifications.models import Notification
from config.defaults import DEFAULT_BRANCHES, TEACHER_TEMPLATES

User = get_user_model()

class Command(BaseCommand):
    help = 'Initialize the system with default users, branches, and sample data safely.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('--- Eklavya System Initialization ---'))

        # 1. Create Owner user (owner / owner@123)
        if not User.objects.filter(username='owner').exists():
            owner = User.objects.create_superuser(
                username='owner',
                email='owner@eklavya.edu',
                password='owner@123',
                first_name='Eklavya',
                last_name='Owner',
            )
            if hasattr(owner, 'role'):
                owner.role = User.ROLE_OWNER
                owner.save(update_fields=['role'])
            self.stdout.write(self.style.SUCCESS('Created Owner user (owner / owner@123)'))
        else:
            self.stdout.write(self.style.WARNING('User "owner" already exists. Skipping.'))

        # 2. Create Admin user (admin / admin@123)
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_user(
                username='admin',
                email='admin@eklavya.edu',
                password='admin@123',
                first_name='Admin',
                last_name='User',
            )
            if hasattr(admin, 'role'):
                admin.role = User.ROLE_ADMIN
                admin.save(update_fields=['role'])
            self.stdout.write(self.style.SUCCESS('Created Admin user (admin / admin@123)'))
        else:
            self.stdout.write(self.style.WARNING('User "admin" already exists. Skipping.'))

        # 3. Seed Branches
        created_branches = []
        for b_data in DEFAULT_BRANCHES:
            branch, created = Branch.objects.get_or_create(
                code=b_data['code'],
                defaults={
                    'name': b_data['name'],
                    'address': b_data['address'],
                    'city': b_data['city'],
                    'is_active': True,
                }
            )
            created_branches.append(branch)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created branch: {branch.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Branch exists: {branch.name}"))

        # Assign admin user to first branch
        try:
            admin_user = User.objects.get(username='admin')
            if created_branches and not admin_user.branch:
                admin_user.branch = created_branches[0]
                admin_user.save(update_fields=['branch'])
                self.stdout.write(self.style.SUCCESS(f"Assigned admin to branch: {created_branches[0].name}"))
        except User.DoesNotExist:
            pass

        # 4. Seed Teachers
        for t_data in TEACHER_TEMPLATES:
            branch = next((b for b in created_branches if b.code == t_data['branch_code']), None)
            if not branch: continue
            
            teacher, created = Teacher.objects.get_or_create(
                branch=branch,
                name=t_data['name'],
                defaults={
                    'email': f"{t_data['name'].split()[0].lower()}@eklavya.edu",
                    'phone': '9999999999',
                    'subject': t_data['subject'],
                    'assigned_standard': t_data['assigned_standard'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created teacher: {teacher.name}"))

        # 5. Create Sample Notification if none exist
        if not Notification.objects.exists():
            for branch in created_branches:
                Notification.objects.create(
                    branch=branch,
                    title=f'Welcome to {branch.name}',
                    message='System initialized successfully. You can now manage students, fees, and schedules.',
                    type='system',
                    target_role='all'
                )
            self.stdout.write(self.style.SUCCESS('Created welcome notifications'))

        self.stdout.write(self.style.SUCCESS('--- Initialization Complete ---'))
        self.stdout.write(self.style.SUCCESS('Login credentials:'))
        self.stdout.write(self.style.SUCCESS('  Owner: owner / owner@123'))
        self.stdout.write(self.style.SUCCESS('  Admin: admin / admin@123'))
