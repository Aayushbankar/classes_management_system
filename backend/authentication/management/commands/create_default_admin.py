from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a default owner superuser on first run, or print existing superuser info'

    def handle(self, *args, **options):
        # Check if any superuser already exists (i.e. not the first run)
        superusers = User.objects.filter(is_superuser=True)

        if superusers.exists():
            self.stdout.write(self.style.WARNING('Not the first run — superuser(s) already exist:'))
            for su in superusers:
                role = getattr(su, 'role', 'N/A')
                self.stdout.write(
                    f'  👤 Username: {su.username}  |  Email: {su.email}  |  Role: {role}'
                )
            return

        # First run — create the default owner superuser
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin'
        )
        if hasattr(user, 'role'):
            user.role = User.ROLE_OWNER
            user.save(update_fields=['role'])
        self.stdout.write(self.style.SUCCESS(
            '✅ First run — created owner superuser  |  Username: admin  |  Password: admin  |  Role: owner'
        ))
