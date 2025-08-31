from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os


class Command(BaseCommand):
    help = 'Ensure a superuser exists using DJANGO_SUPERUSER_* env vars.'


    def handle(self, *args, **options):
        User = get_user_model()
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        if not (username and email and password):
            self.stdout.write('DJANGO_SUPERUSER_* not set; skipping.')
            return
        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Created superuser {username}'))
        else:
            self.stdout.write('Superuser already exists; skipping.')