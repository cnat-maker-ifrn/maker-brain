from rest_framework import serializers
from authentication.models import User
from authentication.services import UserService

class ScholarshipStudentRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'cpf',
            'email',
            'name',
            'cellphone',
            'enrollment',
            'profile_picture',
            'password'
        ]
    
    def validate_enrollment(self, value):
        if not value:
            raise serializers.ValidationError('Enrollment is required for students')
        if len(value) != 14:
            raise serializers.ValidationError('The enrollment of a student must have 14 characters.')
        return value
    
    def create(self, validated_data):
        return UserService.create_user_without_group(**validated_data)

class ScholarshipStudentUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'email',
            'name',
            'cellphone',
            'profile_picture',
            'password'
        ]
    
    def validate_enrollment(self, value):
        if value and len(value) != 14:
            raise serializers.ValidationError("The enrollment of a student must have 14 characters.")
        return value
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class ScholarshipStudentDetailSerializer(serializers.ModelSerializer):
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
            'groups'
        ]

class ScholarshipStudentListSerializer(serializers.ModelSerializer):
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
            'groups'
        ]