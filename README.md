# Classes Management System

A professional, enterprise-grade management system for educational institutions. Built with a React frontend and a Django REST Framework backend.

## 🚀 Features

- **Global Search**: Search through students, teachers, and financial records in real-time.
- **Student Management**: Comprehensive student profiles, enrollment tracking, and performance monitoring.
- **Teacher Portal**: Manage faculty schedules, departments, and payroll.
- **Finance Dashboard**: Power BI-style financial visualization for revenue, fees, and expenses.
- **Branch Management**: Multi-branch support with hierarchical administration.
- **Timetable & Scheduling**: Dynamic scheduling for classes and exams.
- **Automated Notifications**: Real-time alerts for fee payments, schedule changes, and more.

## 🛠️ Technology Stack

- **Frontend**: React, Vanilla CSS, Recharts
- **Backend**: Django, Django REST Framework
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **API**: OpenAPI (Swagger) documented

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the root directory:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```

## 📝 License
This project is licensed under the MIT License.
