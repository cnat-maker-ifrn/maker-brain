from django.contrib.auth.models import Group
from makerauth.models import User

class UserService:

    @staticmethod
    def create_user_without_group(**data):
        user = User.objects.create_user(bond='student', is_active=False, **data)

        return user

    @staticmethod
    def add_user_in_scholarship_students_group(user):
        group = Group.objects.get(name="Scholarship Students")
        user.is_active = True
        user.groups.add(group)
        user.save()

        return user

    @staticmethod
    def delete_user_without_group(user):
        if not user.groups.filter(name__in=["Owners", "Managers", "Scholarship Students", "Requesters"]).exists():
            user.delete()

    @staticmethod
    def create_requester(**data):
        user = User.objects.create_user(**data)
        group = Group.objects.get(name="Requesters")
        user.groups.add(group)

        return user