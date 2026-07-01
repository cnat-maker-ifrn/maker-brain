from rest_framework import serializers
from makerauth.models import User
from makerauth.services import UserService

class RequesterRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'cpf',
            'email',
            'name',
            'cellphone',
            'bond',
            'enrollment',
            'profile_picture',
            'accepts_marketing_contact',
            'password'
        ]

    def validate(self, attrs):
        bond = attrs.get('bond')
        enrollment = attrs.get('enrollment')

        if bond in ['student', 'teacher'] and not enrollment:
            raise serializers.ValidationError({'enrollment': 'Enrollment is required'})
        
        if bond == 'student' and enrollment:
            if len(enrollment) != 14:
                raise serializers.ValidationError({'enrollment': 'Then enrollment of a student must have 14 characters'})
        
        return attrs

    def create(self, validated_data):
        return UserService.create_requester(**validated_data)

class RequesterUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=False)

    class Meta:
        model = User
        fields = [
            'email',
            'name',
            'cellphone',
            'bond',
            'enrollment',
            'profile_picture',
            'accepts_marketing_contact',
            'password'
        ]

    def validate(self, attrs):
        bond = attrs.get('bond')
        enrollment = attrs.get('enrollment')

        if bond in ['student', 'teacher'] and not enrollment:
            raise serializers.ValidationError({'enrollment': 'Enrollment is required'})
        
        if bond == 'student' and enrollment:
            if len(enrollment) != 14:
                raise serializers.ValidationError({'enrollment': 'Then enrollment of a student must have 14 characters'})
        
        return attrs
            
class RequesterDetailSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    class Meta:
        model = User
        fields = [
            'id',
            'cpf',
            'email',
            'name',
            'cellphone',
            'bond',
            'enrollment',
            'profile_picture',
            'accepts_marketing_contact',
            'groups'
        ]

class RequesterListSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    class Meta:
        model = User
        fields = [
            'cpf',
            'email',
            'name',
            'cellphone',
            'bond',
            'enrollment',
            'profile_picture',
            'accepts_marketing_contact',
            'groups'
        ]

