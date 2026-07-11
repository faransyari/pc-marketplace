from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    owner_field = 'seller'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, getattr(view, 'owner_field', self.owner_field), None)
        return owner == request.user
