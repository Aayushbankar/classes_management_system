<div align="center">

# 🎓 Classes Management System

**A modern, full-stack management platform for coaching institutes and educational institutions.**

Built with React · Django REST Framework · JWT Authentication

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB.svg)](https://python.org)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org)
[![Django 4.2](https://img.shields.io/badge/Django-4.2-092E20.svg)](https://djangoproject.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://reactjs.org)

</div>

---

## ✨ Features

- **📊 Revenue Dashboard** — Power BI-style financial analytics with interactive charts, collection efficiency tracking, and payment mode breakdowns
- **🎓 Student Management** — Full student lifecycle management with enrollment, fee tracking, progress bars, and detailed profiles
- **👩‍🏫 Teacher Portal** — Faculty management with subject assignments, branch allocation, and contact directory
- **💰 Fee & Finance** — Record payments, track pending fees, and generate professional PDF receipts
- **📄 PDF Receipt System** — Dual-mode system: high-performance browser printing + server-side PDF generation for 100% mobile compatibility
- **🏢 Multi-Branch Support** — Operate across multiple branches with branch-level data isolation and filtering
- **📅 Timetable & Scheduling** — Weekly timetable management with teacher conflict detection and batch/standard filtering
- **🔔 Notifications** — In-app notification system with read/unread state and broadcast support
- **📈 Reports & Export** — Export data to Excel, generate fee reports, and analyze student/revenue metrics
- **🔐 Role-Based Access** — Three-tier role system (Owner → Admin → Assistant) with branch-level permissions
- **🎨 Premium UI** — Glassmorphism design with 4+ switchable themes (Azure, Midnight, Royal Velvet, Crimson Sunset)
- **🔍 Global Search** — Search across students, teachers, finances, and records with real-time filtering
- **📱 Mobile-First** — Fully responsive layout with bottom navigation and touch-friendly interactions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vanilla CSS, Recharts, Bootstrap 5 |
| **Backend** | Django 4.2, Django REST Framework, SimpleJWT |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **API Docs** | OpenAPI 3.0 via drf-spectacular (Swagger UI) |
| **PDF Engine** | xhtml2pdf (ReportLab) |
| **Deployment** | Docker, Docker Compose, Render (Single-Container) |

---

## 🚀 Quick Start

### Prerequisites

- [Python 3.11+](https://python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- Git

### One-Command Start

Clone the repository and start both servers with a single command:

```bash
git clone https://github.com/your-username/eklavya-app.git
cd eklavya-app

# Install frontend dependencies
npm install

# Set up backend virtual environment
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cd ..

# Start everything (migrations, seeding, and both servers)
python run.py
```

This will automatically:
- Run database migrations
- Create a default admin user
- Start the Django backend on `http://localhost:8000`
- Start the React frontend on `http://localhost:3001`

### Default Login

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin` |
| Role | Owner (full access) |

> ⚠️ **Change the default password immediately** in a production environment.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/setup.md) | Detailed installation & configuration |
| [Architecture](docs/architecture.md) | System design & module overview |
| [API Reference](docs/api-reference.md) | Full REST API documentation |
| [Frontend Guide](docs/frontend-guide.md) | React components & design system |
| [Deployment](docs/deployment.md) | Docker & production deployment |
| [Contributing](docs/contributing.md) | Development guidelines |
| [Roadmap](docs/roadmap.md) | Feature roadmap & future plans |

Interactive API documentation is also available at `/api/docs/` (Swagger UI) and `/api/redoc/` (ReDoc) when the backend is running.

---

## 📁 Project Structure

```
eklavya-app/
├── backend/                    # Django REST API
│   ├── config/                 # Django settings & URL routing
│   ├── authentication/         # User model, JWT, roles
│   ├── branches/               # Branch CRUD & filtering
│   ├── students/               # Student management
│   ├── teachers/               # Teacher management
│   ├── finance/                # Fee payments & ledger
│   ├── schedule/               # Timetable slots
│   ├── notifications/          # In-app alerts
│   ├── reports/                # Dashboard analytics
│   ├── manage.py
│   └── requirements.txt
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Route-level page components
│   ├── utils/                  # Utilities (export, formatting)
│   ├── App.js                  # Router & app shell
│   ├── Layout.js               # Navigation & theme system
│   ├── api.js                  # API client & auth helpers
│   ├── config.js               # Environment configuration
│   ├── index.css               # Global styles & design tokens
│   └── login.js                # Authentication page
├── docs/                       # Project documentation
├── public/                     # Static assets
├── run.py                      # Development server launcher
├── docker-compose.yml          # Docker orchestration
├── package.json                # Frontend dependencies
└── README.md
```

---

## 🔑 User Roles

| Role | Scope | Capabilities |
|------|-------|-------------|
| **Owner** | Global | Full access, manage all branches, create admins |
| **Admin** | Branch-level | Manage own branch data, create assistants |
| **Assistant** | Branch-level | View-only access to assigned branch |

---

<div align="center">
  <sub>Built with ❤️ for education</sub>
</div>
