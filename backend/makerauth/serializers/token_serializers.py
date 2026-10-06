from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['name'] = user.name
        token['email'] = user.email
        groups = list(user.groups.values_list('name', flat=True))
        if getattr(user, 'is_superuser', False) and 'Owners' not in groups:
            groups.append('Owners')
        token['groups'] = groups
        return token