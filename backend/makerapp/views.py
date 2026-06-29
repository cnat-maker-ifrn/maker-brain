from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from drf_yasg.utils import swagger_auto_schema, no_body
from django.core.exceptions import ValidationError

from makerapp.models import School, Company, Visit
from makerapp.serializers import (
    SchoolSerializer,
    CompanySerializer,
    VisitSerializer,
    VisitStatusUpdateSerializer,
    VisitCloseSerializer,
)
from makerapp.services import VisitService
from makerauth.permissions import IsOwnerOrManager


class SchoolViewSet(ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsOwnerOrManager()]


class CompanyViewSet(ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsOwnerOrManager()]


class VisitViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user

        if self.action in ['accept', 'reject']:
            return Visit.objects.filter(acceptance_status='pending')

        if self.action == 'close':
            return Visit.objects.filter(acceptance_status='accepted', is_visit_closed=False)

        if user.groups.filter(name__in=['Owners', 'Managers']).exists():
            return Visit.objects.all()

        return Visit.objects.filter(requester=user)

    def get_serializer_class(self):
        if getattr(self, 'swagger_fake_view', False):
            return VisitSerializer

        if self.action in ['accept', 'reject']:
            return VisitStatusUpdateSerializer

        if self.action == 'close':
            return VisitCloseSerializer

        return VisitSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]

        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]

        if self.action in ['accept', 'reject', 'close']:
            return [IsOwnerOrManager()]

        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            visit = VisitService.create_visit(
                requester=request.user,
                validated_data=serializer.validated_data,
            )
        except ValidationError as exc:
            return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            VisitSerializer(visit).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        visit = self.get_object()

        if visit.acceptance_status != 'pending':
            return Response(
                {'detail': 'Only pending visits can be edited.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if visit.requester != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(visit, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        visit = self.get_object()

        if visit.acceptance_status != 'pending':
            return Response(
                {'detail': 'Only pending visits can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if visit.requester != request.user and not request.user.groups.filter(name__in=['Owners', 'Managers']).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)

        visit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(request_body=no_body)
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        visit = self.get_object()

        try:
            VisitService.accept_visit(visit)
        except ValidationError as exc:
            return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=no_body)
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        visit = self.get_object()

        try:
            VisitService.reject_visit(visit)
        except ValidationError as exc:
            return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'])
    def close(self, request, pk=None):
        visit = self.get_object()
        serializer = self.get_serializer(visit, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            VisitService.close_visit(visit, serializer.validated_data)
        except ValidationError as exc:
            return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_200_OK)