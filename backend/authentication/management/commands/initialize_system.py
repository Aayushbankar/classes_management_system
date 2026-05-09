import random
from datetime import date, timedelta, time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from branches.models import Branch
from students.models import Student
from teachers.models import Teacher
from finance.models import FeePayment
from schedule.models import TimetableSlot, TestSchedule
from notifications.models import Notification
from config.defaults import DEFAULT_BRANCHES, TEACHER_TEMPLATES

User = get_user_model()

# ──────────────────────────────────────────────
# Realistic Gujarati student names
# ──────────────────────────────────────────────
FIRST_NAMES_MALE = [
    'Arjun', 'Darshan', 'Dhruvil', 'Harsh', 'Hitesh', 'Jay', 'Jaydeep',
    'Karan', 'Kartik', 'Keyur', 'Krunal', 'Manav', 'Mihir', 'Neel',
    'Parth', 'Pratik', 'Raj', 'Ravi', 'Rohan', 'Sahil', 'Sagar',
    'Smit', 'Uday', 'Vatsal', 'Vikas', 'Vivek', 'Yash', 'Dhyey',
    'Heet', 'Het', 'Devansh', 'Jeet', 'Aayush', 'Hardik', 'Chirag',
]

FIRST_NAMES_FEMALE = [
    'Aisha', 'Anjali', 'Bhavna', 'Dhara', 'Diya', 'Hetal', 'Jiya',
    'Kavya', 'Khushi', 'Kruti', 'Mahi', 'Mansi', 'Meera', 'Nidhi',
    'Pooja', 'Priya', 'Riddhi', 'Riya', 'Sachi', 'Shreya', 'Sonal',
    'Tanvi', 'Urvi', 'Vaishali', 'Vidhi', 'Yashvi', 'Zeel', 'Feni',
    'Janvi', 'Komal', 'Divya', 'Nirali', 'Isha', 'Palak', 'Swati',
]

SURNAMES = [
    'Patel', 'Shah', 'Joshi', 'Trivedi', 'Bhatt', 'Raval', 'Mehta',
    'Desai', 'Parmar', 'Solanki', 'Makwana', 'Gajera', 'Dudhat',
    'Chauhan', 'Kathiriya', 'Vyas', 'Pandya', 'Dave', 'Tank',
    'Vaghasiya', 'Kansagra', 'Dobariya', 'Baraiya', 'Gohil',
    'Jadeja', 'Rana', 'Bhanushali', 'Modi', 'Nagar', 'Rathod',
]

PARENT_FIRST_NAMES = [
    'Rameshbhai', 'Sureshbhai', 'Nareshbhai', 'Dineshbhai', 'Hiteshbhai',
    'Rajeshbhai', 'Maheshbhai', 'Vijaybhai', 'Sanjaybhai', 'Nileshbhai',
    'Ashokbhai', 'Pravinbhai', 'Bharatbhai', 'Jayeshbhai', 'Kamleshbhai',
    'Mukeshbhai', 'Yogeshbhai', 'Manishbhai', 'Hareshbhai', 'Dipakbhai',
]

STANDARDS_DIST = [
    ('Class 8', '07:00 AM - 09:00 AM'),
    ('Class 8', '04:00 PM - 06:00 PM'),
    ('Class 9', '09:00 AM - 11:00 AM'),
    ('Class 9', '06:00 PM - 08:00 PM'),
    ('Class 10', '07:00 AM - 09:00 AM'),
    ('Class 10', '04:00 PM - 06:00 PM'),
    ('Class 11 (Science)', '09:00 AM - 11:00 AM'),
    ('Class 11 (Science)', '06:00 PM - 08:00 PM'),
    ('Class 11 (Commerce)', '11:00 AM - 01:00 PM'),
    ('Class 12 (Science)', '07:00 AM - 09:00 AM'),
    ('Class 12 (Science)', '04:00 PM - 06:00 PM'),
    ('Class 12 (Commerce)', '11:00 AM - 01:00 PM'),
]

PAYMENT_MODES = ['cash', 'upi', 'cheque', 'cash', 'upi', 'cash']  # weighted toward cash & upi


class Command(BaseCommand):
    help = 'Initialize the system with realistic Bhavnagar demo data.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('--- Eklavya System Initialization ---'))
        random.seed(42)  # reproducible

        # ── 1. USERS ──
        if not User.objects.filter(username='owner').exists():
            owner = User.objects.create_superuser(
                username='owner', email='owner@eklavya.edu',
                password='owner@123', first_name='Eklavya', last_name='Owner',
            )
            owner.role = User.ROLE_OWNER
            owner.save(update_fields=['role'])
            self.stdout.write(self.style.SUCCESS('Created Owner (owner / owner@123)'))
        else:
            self.stdout.write(self.style.WARNING('Owner already exists. Skipping.'))

        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_user(
                username='admin', email='admin@eklavya.edu',
                password='admin@123', first_name='Admin', last_name='User',
            )
            admin.role = User.ROLE_ADMIN
            admin.save(update_fields=['role'])
            self.stdout.write(self.style.SUCCESS('Created Admin (admin / admin@123)'))
        else:
            self.stdout.write(self.style.WARNING('Admin already exists. Skipping.'))

        # ── 2. BRANCHES ──
        branches = []
        for b_data in DEFAULT_BRANCHES:
            branch, created = Branch.objects.get_or_create(
                code=b_data['code'],
                defaults={'name': b_data['name'], 'address': b_data['address'],
                          'city': b_data['city'], 'is_active': True},
            )
            branches.append(branch)
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Exists'} branch: {branch.name}"))

        # Assign admin to first branch
        try:
            admin_user = User.objects.get(username='admin')
            if branches and not admin_user.branch:
                admin_user.branch = branches[0]
                admin_user.save(update_fields=['branch'])
        except User.DoesNotExist:
            pass

        # ── 3. TEACHERS (12) ──
        teachers_by_branch = {b.code: [] for b in branches}
        for t_data in TEACHER_TEMPLATES:
            branch = next((b for b in branches if b.code == t_data['branch_code']), None)
            if not branch:
                continue
            teacher, created = Teacher.objects.get_or_create(
                branch=branch, name=t_data['name'],
                defaults={
                    'email': f"{t_data['name'].split()[0].lower()}.{t_data['name'].split()[-1].lower()}@eklavya.edu",
                    'phone': f"98{random.randint(10000000, 99999999)}",
                    'subject': t_data['subject'],
                    'assigned_standard': t_data['assigned_standard'],
                    'is_active': True,
                },
            )
            teachers_by_branch[branch.code].append(teacher)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created teacher: {teacher.name}"))

        # ── 4. STUDENTS (75) ──
        if Student.objects.count() < 10:
            used_names = set()
            student_records = []
            today = date.today()

            for i in range(75):
                branch = branches[i % 2]  # alternate
                std, batch = random.choice(STANDARDS_DIST)

                # unique name
                while True:
                    if random.random() < 0.5:
                        first = random.choice(FIRST_NAMES_MALE)
                    else:
                        first = random.choice(FIRST_NAMES_FEMALE)
                    last = random.choice(SURNAMES)
                    full = f"{first} {last}"
                    if full not in used_names:
                        used_names.add(full)
                        break

                parent_first = random.choice(PARENT_FIRST_NAMES)
                parent_name = f"{parent_first} {last}"
                contact = f"9{random.randint(100000000, 999999999)}"
                decided_fee = Decimal(str(random.choice([12000, 13000, 14000, 15000, 16000, 17000, 18000])))
                # 60% students have paid something, 20% full, 20% nothing
                r = random.random()
                if r < 0.2:
                    paid_fee = decided_fee
                elif r < 0.8:
                    paid_fee = Decimal(str(random.randint(2000, int(decided_fee) - 1000)))
                else:
                    paid_fee = Decimal('0')

                admission = today - timedelta(days=random.randint(30, 180))
                roll = f"EKL-{branch.code[:2]}-{str(i + 1).zfill(3)}"

                s = Student.objects.create(
                    branch=branch, name=full, parent_name=parent_name,
                    contact_number=contact, standard=std, batch_time=batch,
                    roll_number=roll, admission_date=admission,
                    decided_fee=decided_fee, paid_fee=paid_fee,
                    status='active',
                )
                student_records.append(s)

                # Create fee payment records for students who have paid
                if paid_fee > 0:
                    num_payments = random.randint(1, 3)
                    remaining = paid_fee
                    for p in range(num_payments):
                        if p == num_payments - 1:
                            amt = remaining
                        else:
                            amt = Decimal(str(random.randint(1000, int(remaining) - 1000))) if remaining > 2000 else remaining
                        if amt <= 0:
                            continue
                        remaining -= amt
                        pay_date = admission + timedelta(days=random.randint(0, 60))
                        if pay_date > today:
                            pay_date = today
                        FeePayment.objects.create(
                            student=s, amount=amt,
                            payment_date=pay_date,
                            payment_mode=random.choice(PAYMENT_MODES),
                            reference=f"TXN{random.randint(100000, 999999)}" if random.random() > 0.5 else '',
                            notes='',
                        )

            self.stdout.write(self.style.SUCCESS(f"Created {len(student_records)} students with fee payments"))
        else:
            self.stdout.write(self.style.WARNING('Students already exist. Skipping.'))

        # ── 5. TIMETABLE SLOTS ──
        if TimetableSlot.objects.count() < 5:
            days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            slot_defs = [
                # (standard, batch, start, end, subject)
                ('Class 8',  '07:00 AM - 09:00 AM', '07:00', '08:00', 'Science'),
                ('Class 8',  '07:00 AM - 09:00 AM', '08:00', '09:00', 'Mathematics'),
                ('Class 9',  '09:00 AM - 11:00 AM', '09:00', '10:00', 'Mathematics'),
                ('Class 9',  '09:00 AM - 11:00 AM', '10:00', '11:00', 'English'),
                ('Class 10', '04:00 PM - 06:00 PM', '16:00', '17:00', 'Mathematics'),
                ('Class 10', '04:00 PM - 06:00 PM', '17:00', '18:00', 'Science'),
                ('Class 11 (Science)', '06:00 PM - 08:00 PM', '18:00', '19:00', 'Physics'),
                ('Class 11 (Science)', '06:00 PM - 08:00 PM', '19:00', '20:00', 'Chemistry'),
                ('Class 12 (Science)', '07:00 AM - 09:00 AM', '07:00', '08:00', 'Physics'),
                ('Class 12 (Science)', '07:00 AM - 09:00 AM', '08:00', '09:00', 'Chemistry'),
                ('Class 11 (Commerce)', '11:00 AM - 01:00 PM', '11:00', '12:00', 'Accountancy'),
                ('Class 11 (Commerce)', '11:00 AM - 01:00 PM', '12:00', '13:00', 'Economics'),
                ('Class 12 (Commerce)', '11:00 AM - 01:00 PM', '11:00', '12:00', 'Accountancy'),
            ]
            rooms = ['Room A', 'Room B', 'Room C', 'Room D', 'Hall 1']
            count = 0
            for branch in branches:
                b_teachers = Teacher.objects.filter(branch=branch)
                for std, batch, st, et, subj in slot_defs:
                    for day in random.sample(days, k=random.randint(3, 5)):
                        teacher = b_teachers.filter(subject=subj).first()
                        TimetableSlot.objects.create(
                            branch=branch, standard=std, batch_time=batch,
                            day_of_week=day,
                            start_time=time(*map(int, st.split(':'))),
                            end_time=time(*map(int, et.split(':'))),
                            subject=subj,
                            teacher=teacher,
                            location=random.choice(rooms),
                        )
                        count += 1
            self.stdout.write(self.style.SUCCESS(f"Created {count} timetable slots"))
        else:
            self.stdout.write(self.style.WARNING('Timetable slots exist. Skipping.'))

        # ── 6. TEST SCHEDULES ──
        if TestSchedule.objects.count() < 3:
            test_defs = [
                ('Unit Test 1 — Mathematics', 'Class 10', 7),
                ('Unit Test 1 — Science', 'Class 9', 10),
                ('Mid-Term Physics', 'Class 12 (Science)', 14),
                ('Weekly Chemistry Quiz', 'Class 11 (Science)', 3),
                ('Monthly English Test', 'Class 8', 5),
                ('Accountancy Prelim', 'Class 11 (Commerce)', 12),
                ('Final Revision Test — Maths', 'Class 10', 21),
                ('Board Practice Paper — Physics', 'Class 12 (Science)', 18),
            ]
            today = date.today()
            for branch in branches:
                for title, std, days_ahead in test_defs:
                    TestSchedule.objects.create(
                        branch=branch, standard=std, title=title,
                        description=f"Scheduled test for {std} students at {branch.name}.",
                        test_date=today + timedelta(days=days_ahead),
                        reminder_days_before=2,
                    )
            self.stdout.write(self.style.SUCCESS(f"Created {len(test_defs) * 2} test schedules"))

        # ── 7. WELCOME NOTIFICATIONS ──
        if not Notification.objects.exists():
            for branch in branches:
                Notification.objects.create(
                    branch=branch,
                    title=f'Welcome to {branch.name}',
                    message='System initialized successfully. Manage students, fees, and schedules from your dashboard.',
                    type='system', target_role='all',
                )
            self.stdout.write(self.style.SUCCESS('Created welcome notifications'))

        self.stdout.write(self.style.SUCCESS('--- Initialization Complete ---'))
        self.stdout.write(self.style.SUCCESS('Login: owner / owner@123  |  admin / admin@123'))
