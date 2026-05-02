# 8. Setup and Role Management Updates

This document tracks recent changes made to the project's developer setup and role management.

## Setup Script Improvements (`run.py`)

The root `run.py` script has been upgraded to act as a complete onboarding script for new developers. When executed, it now automatically:
1. Runs database migrations (`makemigrations` and `migrate`).
2. Creates the default superuser account.
3. Seeds the database with initial sample data (branches, students, teachers, etc.).
4. Starts both the Django backend and React frontend concurrently.

## Role Management Update

Previously, the default superuser was assigned the `admin` role. We modified the `create_default_admin` management command so that:
- On the first run, it creates a superuser with the **`owner`** role (`admin` / `admin`).
- On subsequent runs, it checks for existing superusers and prints their credentials instead of attempting to recreate them or failing.
