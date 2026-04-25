from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a default admin user if it does not exist'

    def handle(self, *args, **options):
        # Check if admin user already exists
        if User.objects.filter(username='admin').exists():
            self.stdout.write(self.style.WARNING('Admin user already exists'))
            return

        # Create the default admin user
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin'
        )
        if hasattr(user, 'role'):
            user.role = getattr(user, 'ROLE_ADMIN', 'admin')
            user.save(update_fields=['role'])
        self.stdout.write(self.style.SUCCESS('Successfully created admin user (admin:admin)'))
