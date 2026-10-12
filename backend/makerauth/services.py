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
    
    @staticmethod
    def add_user_in_managers_group(user):
        group, _ = Group.objects.get_or_create(name="Managers")
        user.groups.add(group)
        user.save()

        return user

    @staticmethod
    def promote_scholarship_student_to_manager(user):
        return UserService.add_user_in_managers_group(user)

    @staticmethod
    def remove_user_from_managers_group(user):
        group, _ = Group.objects.get_or_create(name="Managers")
        user.groups.remove(group)
        user.save()

        return user

    @staticmethod
    def remove_scholarship_student_to_requester(user):
        scholarship_group, _ = Group.objects.get_or_create(name="Scholarship Students")
        manager_group, _ = Group.objects.get_or_create(name="Managers")
        requester_group, _ = Group.objects.get_or_create(name="Requesters")

        user.groups.remove(scholarship_group, manager_group)
        user.groups.add(requester_group)
        user.save()

        return user

    @staticmethod
    def remove_user_from_scholarship_students_group(user):
        return UserService.remove_scholarship_student_to_requester(user)

    @staticmethod
    def demote_scholarship_student_to_requester(user):
        return UserService.remove_scholarship_student_to_requester(user)