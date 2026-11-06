import re
from rest_framework import serializers
from makerauth.models import User
from makerauth.services import UserService


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=255, required=False, allow_blank=False)
    cellphone = serializers.CharField(max_length=20, required=False, allow_blank=False)
    current_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        label="Senha atual",
    )
    new_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        label="Nova senha",
    )

    class Meta:
        model = User
        fields = ['name', 'cellphone', 'current_password', 'new_password']

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

    def validate(self, attrs):
        current_password = attrs.get('current_password', '') or ''
        new_password = attrs.get('new_password', '') or ''

        has_password_change = bool(current_password.strip() or new_password.strip())
        if has_password_change:
            if not current_password.strip():
                raise serializers.ValidationError({'current_password': 'A senha atual é obrigatória para alterar a senha.'})
            if not new_password.strip():
                raise serializers.ValidationError({'new_password': 'A nova senha é obrigatória.'})
            if len(new_password) < 8:
                raise serializers.ValidationError({'new_password': 'A nova senha deve ter no mínimo 8 caracteres.'})
            if not self.instance.check_password(current_password):
                raise serializers.ValidationError({'current_password': 'A senha atual está incorreta.'})
            if current_password == new_password:
                raise serializers.ValidationError({'new_password': 'A nova senha deve ser diferente da senha atual.'})

            attrs['new_password'] = new_password

        return attrs

    def update(self, instance, validated_data):
        validated_data.pop('current_password', None)
        new_password = validated_data.pop('new_password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if new_password and new_password.strip():
            instance.set_password(new_password)

        instance.save()
        return instance


class DeleteAccountSerializer(serializers.Serializer):
    """
    Validates the user's password before allowing account deletion
    (soft-delete with data anonymization).
    """

    password = serializers.CharField(
        write_only=True,
        label="Senha",
        help_text="Informe sua senha atual para confirmar a exclusão da conta.",
    )

    def validate_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Senha incorreta.")
        return value

