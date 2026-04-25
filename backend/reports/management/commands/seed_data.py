import random
from decimal import Decimal
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from branches.models import Branch
from students.models import Student
from teachers.models import Teacher
from finance.models import FeePayment

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial mock data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Clear old data (optional, let's just make sure we do it safely)
        FeePayment.objects.all().delete()
        Student.objects.all().delete()
        Teacher.objects.all().delete()
        Branch.objects.all().delete()

        # 2. Branches
        b1 = Branch.objects.create(name='Main Campus', code='MAIN', address='123 Main St')
        b2 = Branch.objects.create(name='Downtown Center', code='DWNT', address='456 Downtown Ave')
        branches = [b1, b2]

        self.stdout.write(f'Created {len(branches)} branches.')

        # 3. Teachers
        subjects = ['Mathematics', 'Science', 'English', 'History', 'Physics', 'Chemistry']
        for i in range(15):
            Teacher.objects.create(
                branch=random.choice(branches),
                name=f'Teacher {i+1}',
                email=f'teacher{i+1}@example.com',
                phone=f'55501{i+1:02d}',
                subject=random.choice(subjects),
                assigned_standard=f'Standard {random.randint(8, 12)}'
            )
        self.stdout.write('Created 15 teachers.')

        # 4. Students
        for i in range(120):
            branch = random.choice(branches)
            decided_fee = Decimal(random.randint(10000, 50000))
            is_defaulter = random.choice([True, False, False]) # 33% chance to owe money
            paid_fee = decided_fee if not is_defaulter else Decimal(random.randint(0, int(decided_fee)))
            
            s = Student.objects.create(
                branch=branch,
                name=f'Student {i+1}',
                parent_name=f'Parent {i+1}',
                contact_number=f'9900{i+1:04d}',
                standard=f'Standard {random.randint(8, 12)}',
                roll_number=f'R{i+1:04d}',
                admission_date=date.today() - timedelta(days=random.randint(10, 300)),
                decided_fee=decided_fee,
                paid_fee=paid_fee,
                status=random.choice([Student.STATUS_ACTIVE, Student.STATUS_ACTIVE, Student.STATUS_INACTIVE])
            )

            # Create fee payment events matching the paid fee roughly
            if paid_fee > 0:
                payment_splits = random.randint(1, 3)
                amount_per_split = paid_fee / payment_splits
                for j in range(payment_splits):
                    FeePayment.objects.create(
                        student=s,
                        amount=amount_per_split,
                        payment_date=s.admission_date + timedelta(days=random.randint(1, 30)),
                        payment_mode=random.choice(['cash', 'upi', 'cheque'])
                    )

        self.stdout.write('Created 120 students and their fee payments.')
        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
