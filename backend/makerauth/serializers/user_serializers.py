import re
from rest_framework import serializers
from makerauth.models import User


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=255, required=False, allow_blank=False)
    cellphone = serializers.CharField(max_length=20, required=False, allow_blank=False)

    class Meta:
        model = User
        fields = ['name', 'cellphone']

    def validate_name(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("O nome não pode estar em branco.")
        return stripped

    def validate_cellphone(self, value):
        digits = re.sub(r'\D', '', value)
        if len(digits) < 10:
            raise serializers.ValidationError("O telefone deve ter pelo menos 10 dígitos com DDD.")
        return digits
