from rest_framework.permissions import BasePermission

MANAGER_GROUPS = {"Owners", "Managers"}
VISIT_MANAGER_GROUPS = {"Owners", "Managers", "Scholarship Students"}

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