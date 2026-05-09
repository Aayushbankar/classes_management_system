"""
Central configuration for system defaults, used by seeders and frontend.
Eklavya Classes — Bhavnagar, Gujarat
"""

DEFAULT_BRANCHES = [
    {
        'name': 'Anandnagar Branch',
        'code': 'ANAND',
        'address': 'Near Anandnagar Circle, Anandnagar Road',
        'city': 'Bhavnagar',
    },
    {
        'name': 'Khaniwad Branch',
        'code': 'KHANI',
        'address': 'Khaniwad Main Road, Nr. Ambaji Temple',
        'city': 'Bhavnagar',
    },
]

DEFAULT_STANDARDS = [
    'Class 8', 'Class 9', 'Class 10',
    'Class 11 (Science)', 'Class 11 (Commerce)',
    'Class 12 (Science)', 'Class 12 (Commerce)',
]

DEFAULT_BATCH_TIMINGS = [
    '07:00 AM - 09:00 AM',
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
]

DEFAULT_SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Science', 'English', 'Gujarati', 'Hindi',
    'Social Studies', 'Accountancy', 'Economics',
    'Computer Science',
]

# 12 teachers — 6 per branch, covering all key subjects
TEACHER_TEMPLATES = [
    # --- Anandnagar Branch (6) ---
    {'name': 'Jayesh Trivedi',    'subject': 'Mathematics',    'assigned_standard': 'Class 10',            'branch_code': 'ANAND'},
    {'name': 'Komal Bhatt',       'subject': 'Science',        'assigned_standard': 'Class 9',             'branch_code': 'ANAND'},
    {'name': 'Hardik Joshi',      'subject': 'Physics',        'assigned_standard': 'Class 12 (Science)',  'branch_code': 'ANAND'},
    {'name': 'Meera Raval',       'subject': 'Chemistry',      'assigned_standard': 'Class 11 (Science)',  'branch_code': 'ANAND'},
    {'name': 'Rakesh Solanki',    'subject': 'English',        'assigned_standard': 'Class 10',            'branch_code': 'ANAND'},
    {'name': 'Priya Gajera',      'subject': 'Accountancy',    'assigned_standard': 'Class 11 (Commerce)', 'branch_code': 'ANAND'},
    # --- Khaniwad Branch (6) ---
    {'name': 'Nilesh Parmar',     'subject': 'Mathematics',    'assigned_standard': 'Class 10',            'branch_code': 'KHANI'},
    {'name': 'Hetal Makwana',     'subject': 'Science',        'assigned_standard': 'Class 8',             'branch_code': 'KHANI'},
    {'name': 'Vishal Dudhat',     'subject': 'Physics',        'assigned_standard': 'Class 12 (Science)',  'branch_code': 'KHANI'},
    {'name': 'Snehal Vyas',       'subject': 'Chemistry',      'assigned_standard': 'Class 11 (Science)',  'branch_code': 'KHANI'},
    {'name': 'Divya Chauhan',     'subject': 'Gujarati',       'assigned_standard': 'Class 9',             'branch_code': 'KHANI'},
    {'name': 'Amit Kathiriya',    'subject': 'Economics',      'assigned_standard': 'Class 12 (Commerce)', 'branch_code': 'KHANI'},
]
