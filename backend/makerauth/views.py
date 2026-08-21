from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from drf_yasg.utils import swagger_auto_schema, no_body
from drf_yasg import openapi
from makerauth.models import User
from .serializers.requester_serializers import (
        RequesterRegisterSerializer, 
        RequesterUpdateSerializer, 
        RequesterDetailSerializer, 
        RequesterListSerializer
    )
from .serializers.scholarship_student_serializers import (
        ScholarshipStudentRegisterSerializer, 
        ScholarshipStudentUpdateSerializer, 
        ScholarshipStudentDetailSerializer, 
        ScholarshipStudentListSerializer
    )
from .services import UserService
from makerauth.permissions import IsOwnerOrManager, IsSelfUpdate

class RequesterViewSet(ModelViewSet):
    queryset = User.objects.filter(groups__name="Requesters", is_active=True)

    def get_serializer_class(self):
        if getattr(self, 'swagger_fake_view', False):
            return RequesterListSerializer
        
        if self.action == 'create':
            return RequesterRegisterSerializer

        if self.action == 'list':
            return ScholarshipStudentListSerializer
        
        if self.action == 'retrieve':
            return RequesterDetailSerializer

        if self.action in ['update', 'partial_update']:
            return RequesterUpdateSerializer
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        user.is_active = False
        user.save()

        return Response(status=204)
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        
        if self.action in ['update', 'partial_update']:
            return [IsSelfUpdate()]
        
        return [IsOwnerOrManager()]
    
class ScholarshipStudentViewSet(ModelViewSet):
        
    def get_queryset(self):
        if self.action in ['accept', 'reject']:
            return User.objects.filter(is_active=False)
        
        return User.objects.filter(groups__name="Scholarship Students", is_active=True)

    def get_serializer_class(self):
        if getattr(self, 'swagger_fake_view', False):
            return ScholarshipStudentListSerializer
        
        if self.action == 'create':
            return ScholarshipStudentRegisterSerializer
        
        if self.action == 'list':
            return ScholarshipStudentListSerializer
        
        if self.action == 'retrieve':
            return ScholarshipStudentDetailSerializer
        
        if self.action in ['update', 'partial_update']:
            return ScholarshipStudentUpdateSerializer
        
    @swagger_auto_schema(request_body=no_body)
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        user = self.get_object()
        UserService.add_user_in_scholarship_students_group(user)
        
        return Response(status=200)
    
    @swagger_auto_schema(request_body=no_body)
    @action(detail=True, methods=['delete'])
    def reject(self, request, pk=None):
        user = self.get_object()
        UserService.delete_user_without_group(user)
        
        return Response(status=204)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        queryset = User.objects.filter(is_active=False, groups__isnull=True) | User.objects.filter(
            is_active=False, bond='student'
        )

        queryset = User.objects.filter(is_active=False).exclude(
            groups__name__in=["Owners", "Managers", "Requesters", "Scholarship Students"]
        ).distinct()

        serializer = ScholarshipStudentListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()

        return Response(status=204)

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        
        if self.action in ['update', 'partial_update']:
            return [IsSelfUpdate()]

        return [IsOwnerOrManager()]