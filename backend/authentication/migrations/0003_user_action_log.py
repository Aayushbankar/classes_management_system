from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_user_branch_user_role'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserActionLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('create', 'Create'), ('update', 'Update'), ('delete', 'Delete'), ('password_change', 'Password Change'), ('login', 'Login'), ('logout', 'Logout')], max_length=32)),
                ('details', models.TextField(blank=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='action_logs', to='authentication.user')),
                ('target_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='target_logs', to='authentication.user')),
            ],
            options={
                'ordering': ['-timestamp'],
                'verbose_name': 'User Action Log',
                'verbose_name_plural': 'User Action Logs',
            },
        ),
    ]
