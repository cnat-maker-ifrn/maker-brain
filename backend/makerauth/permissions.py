from rest_framework.permissions import BasePermission

OWNER_GROUPS = {"Owners"}
MANAGER_GROUPS = {"Owners", "Managers"}
VISIT_MANAGER_GROUPS = {"Owners", "Managers", "Scholarship Students"}

class IsOwner(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user_groups = set(request.user.groups.values_list('name', flat=True))

        return bool(user_groups & OWNER_GROUPS) or getattr(request.user, 'is_superuser', False)

class IsOwnerOrManager(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_groups = set(request.user.groups.values_list('name', flat=True))

        return bool(user_groups & MANAGER_GROUPS)

class IsVisitManager(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user_groups = set(request.user.groups.values_list('name', flat=True))

        return bool(user_groups & VISIT_MANAGER_GROUPS)

class IsSelfUpdate(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj == request.user