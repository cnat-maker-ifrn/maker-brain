from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
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
from makerauth.permissions import IsOwner, IsOwnerOrManager, IsSelfUpdate
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers.token_serializers import CustomTokenObtainPairSerializer
from .serializers.user_serializers import UserProfileUpdateSerializer


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
        if self.action in ['remove_manager', 'demote_manager']:
            return User.objects.filter(groups__name__in=["Scholarship Students", "Managers"], is_active=True).distinct()
        
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

        if self.action in ['demote_to_requester', 'demote']:
            return RequesterDetailSerializer

        return ScholarshipStudentDetailSerializer
        
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

    @swagger_auto_schema(request_body=no_body, responses={200: ScholarshipStudentDetailSerializer})
    @action(detail=True, methods=['post'], url_path='promote')
    def promote(self, request, pk=None):
        user = self.get_object()
        UserService.add_user_in_managers_group(user)
        return Response(ScholarshipStudentDetailSerializer(user).data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=no_body, responses={200: ScholarshipStudentDetailSerializer})
    @action(detail=True, methods=['post'], url_path='promote-to-manager')
    def promote_to_manager(self, request, pk=None):
        return self.promote(request, pk=pk)

    @swagger_auto_schema(methods=['post', 'delete'], request_body=no_body, responses={200: ScholarshipStudentDetailSerializer})
    @action(detail=True, methods=['post', 'delete'], url_path='remove-manager')
    def remove_manager(self, request, pk=None):
        user = self.get_object()
        if not user.groups.filter(name="Managers").exists():
            return Response(
                {"detail": "O usuário não pertence ao grupo Managers."},
                status=status.HTTP_400_BAD_REQUEST
            )
        UserService.remove_user_from_managers_group(user)
        return Response(ScholarshipStudentDetailSerializer(user).data, status=status.HTTP_200_OK)

    @swagger_auto_schema(methods=['post', 'delete'], request_body=no_body, responses={200: ScholarshipStudentDetailSerializer})
    @action(detail=True, methods=['post', 'delete'], url_path='demote-manager')
    def demote_manager(self, request, pk=None):
        return self.remove_manager(request, pk=pk)

    @swagger_auto_schema(methods=['post', 'delete'], request_body=no_body, responses={200: RequesterDetailSerializer})
    @action(detail=True, methods=['post', 'delete'], url_path='demote-to-requester')
    def demote_to_requester(self, request, pk=None):
        user = self.get_object()
        if not user.groups.filter(name="Scholarship Students").exists():
            return Response(
                {"detail": "O usuário não pertence ao grupo Scholarship Students."},
                status=status.HTTP_400_BAD_REQUEST
            )
        UserService.remove_scholarship_student_to_requester(user)
        return Response(RequesterDetailSerializer(user).data, status=status.HTTP_200_OK)

    @swagger_auto_schema(methods=['post', 'delete'], request_body=no_body, responses={200: RequesterDetailSerializer})
    @action(detail=True, methods=['post', 'delete'], url_path='demote')
    def demote(self, request, pk=None):
        return self.demote_to_requester(request, pk=pk)
    
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

        if self.action in [
            'promote',
            'promote_to_manager',
            'remove_manager',
            'demote_manager',
            'demote_to_requester',
            'demote',
        ]:
            return [IsOwner()]

        return [IsOwnerOrManager()]

class ManagerViewSet(ModelViewSet):
    queryset = User.objects.filter(groups__name="Managers", is_active=True)
    serializer_class = ScholarshipStudentListSerializer
    permission_classes = [IsOwner]

    @swagger_auto_schema(methods=['post', 'delete'], request_body=no_body, responses={200: ScholarshipStudentListSerializer})
    @action(detail=True, methods=['post', 'delete'], url_path='remove')
    def remove(self, request, pk=None):
        user = self.get_object()
        UserService.remove_user_from_managers_group(user)
        return Response(ScholarshipStudentListSerializer(user).data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        UserService.remove_user_from_managers_group(user)
        return Response(status=status.HTTP_204_NO_CONTENT)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(responses={200: RequesterDetailSerializer})
    def get(self, request):
        serializer = RequesterDetailSerializer(request.user)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=UserProfileUpdateSerializer,
        responses={200: RequesterDetailSerializer}
    )
    def patch(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(RequesterDetailSerializer(request.user).data)