"""
Central configuration for system defaults, used by seeders and frontend.
"""

DEFAULT_BRANCHES = [
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

DEFAULT_STANDARDS = [
    'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
    'NEET', 'JEE', 'Foundation', 'Crash Course'
]

DEFAULT_BATCH_TIMINGS = [
    '07:00 AM - 09:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
]

DEFAULT_SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'Science', 'English', 'History', 'Geography',
    'Social Studies', 'Information Technology'
]

TEACHER_TEMPLATES = [
    {'name': 'Riya Sharma', 'subject': 'Mathematics', 'assigned_standard': 'Class 10', 'branch_code': 'CENTRAL'},
    {'name': 'Amit Patel', 'subject': 'Science', 'assigned_standard': 'Class 9', 'branch_code': 'CENTRAL'},
    {'name': 'Sneha Joshi', 'subject': 'English', 'assigned_standard': 'Class 11', 'branch_code': 'CENTRAL'},
    {'name': 'Deepak Singh', 'subject': 'Physics', 'assigned_standard': 'Class 10', 'branch_code': 'EAST'},
    {'name': 'Priya Menon', 'subject': 'Chemistry', 'assigned_standard': 'Class 12', 'branch_code': 'EAST'},
    {'name': 'Nikhil Verma', 'subject': 'Biology', 'assigned_standard': 'Class 9', 'branch_code': 'EAST'},
]
