"""
Management command: create_owner

Creates the initial Owner user on first server setup.
Reads credentials from environment variables and is safe to run
multiple times — it skips creation if an Owner already exists.

Usage:
    python manage.py create_owner

Environment variables (all required):
    OWNER_CPF         — 11-digit CPF (digits only, no formatting)
    OWNER_EMAIL       — email address used to log in
    OWNER_NAME        — full name
    OWNER_CELLPHONE   — cellphone number
    OWNER_BOND        — one of: student, teacher, public_servant, external
    OWNER_PASSWORD    — initial password
    OWNER_ENROLLMENT  — enrollment number (required for student/teacher bonds)
"""

import os

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = (
        "Creates the initial Owner user. "
        "Safe to run multiple times — skips if an Owner already exists."
    )

    # ------------------------------------------------------------------ #
    # Required environment variables and their human-readable labels       #
    # ------------------------------------------------------------------ #
    _REQUIRED_ENV_VARS = {
        "OWNER_CPF": "CPF (11 digits, no formatting)",
        "OWNER_EMAIL": "e-mail address",
        "OWNER_NAME": "full name",
        "OWNER_CELLPHONE": "cellphone number",
        "OWNER_BOND": "bond type (student | teacher | public_servant | external)",
        "OWNER_PASSWORD": "password",
    }

    def handle(self, *args, **options):
        User = get_user_model()

        # ---------------------------------------------------------------- #
        # 1. Guard: abort early if any Owner already exists                #
        # ---------------------------------------------------------------- #
        try:
            owners_group = Group.objects.get(name="Owners")
        except Group.DoesNotExist:
            raise CommandError(
                'The "Owners" group does not exist. '
                "Make sure all migrations have been applied before running this command."
            )

        if owners_group.user_set.exists():
            self.stdout.write(
                self.style.WARNING(
                    "An Owner user already exists. Skipping creation."
                )
            )
            return

        # ---------------------------------------------------------------- #
        # 2. Read and validate environment variables                       #
        # ---------------------------------------------------------------- #
        env = {}
        missing = []

        for var, label in self._REQUIRED_ENV_VARS.items():
            value = os.environ.get(var, "").strip()
            if not value:
                missing.append(f"  {var}  ({label})")
            else:
                env[var] = value

        # OWNER_ENROLLMENT is optional but required for student / teacher
        env["OWNER_ENROLLMENT"] = os.environ.get("OWNER_ENROLLMENT", "").strip() or None

        if missing:
            raise CommandError(
                "The following required environment variables are not set:\n"
                + "\n".join(missing)
            )

        # ---------------------------------------------------------------- #
        # 3. Create the user                                               #
        # ---------------------------------------------------------------- #
        try:
            user = User.objects.create_user(
                cpf=env["OWNER_CPF"],
                email=env["OWNER_EMAIL"],
                name=env["OWNER_NAME"],
                cellphone=env["OWNER_CELLPHONE"],
                bond=env["OWNER_BOND"],
                enrollment=env["OWNER_ENROLLMENT"],
                password=env["OWNER_PASSWORD"],
                is_staff=True,
            )
        except Exception as exc:
            raise CommandError(f"Failed to create the Owner user: {exc}") from exc

        # ---------------------------------------------------------------- #
        # 4. Assign to the Owners group                                    #
        # ---------------------------------------------------------------- #
        user.groups.add(owners_group)

        self.stdout.write(
            self.style.SUCCESS(
                f'Owner user "{user.name}" ({user.email}) created and added to "Owners" group.'
            )
        )
