from django.contrib.auth.models import Group
from authentication.models import User
from authentication.events.publisher import publish_event
from authentication.events.payloads import build_user_payload

class UserService:

    @staticmethod
    def create_user_without_group(**data):
        user = User.objects.create_user(bond='student', is_active=False, **data)
        publish_event("user.created", build_user_payload(user))

        return user

    @staticmethod
    def add_user_in_scholarship_students_group(user):
        group = Group.objects.get(name="Scholarship Students")
        user.is_active = True
        user.groups.add(group)
        user.save()
        publish_event("user.updated", build_user_payload(user))

        return user

    @staticmethod
    def delete_user_without_group(user):
        if not user.groups.filter(name__in=["Owners", "Managers", "Scholarship Students", "Requesters"]).exists():
            publish_event("user.deleted", {"id": user.id})
            user.delete()

    @staticmethod
    def create_requester(**data):
        user = User.objects.create_user(**data)
        group = Group.objects.get(name="Requesters")
        user.groups.add(group)
        publish_event("user.created", build_user_payload(user))

        return user