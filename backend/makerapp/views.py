from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ModelViewSet, ViewSet
from drf_yasg.utils import swagger_auto_schema, no_body
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta
from makerapp.models import School, Company, Visit, Service, ScheduleBlock
from makerapp.serializers import (
    SchoolSerializer,
    CompanySerializer,
    VisitSerializer,
    VisitStatusUpdateSerializer,
    VisitCloseSerializer,
    BusySlotSerializer,
    ServiceSerializer,
    ScheduleBlockSerializer,
)
from makerapp.services import VisitService, VISIT_CONSTRAINTS, ServiceService
from makerapp.report_service import ReportService
from makerauth.permissions import IsOwner, IsOwnerOrManager, IsVisitManager, VISIT_MANAGER_GROUPS, MANAGER_GROUPS



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

        if not user or not user.is_authenticated:
            return Visit.objects.none()

        if self.action == 'mine':
            return Visit.objects.filter(requester=user)

        if self.action in ['accept', 'reject']:
            return Visit.objects.filter(acceptance_status='pending')

        if self.action == 'close':
            return Visit.objects.filter(acceptance_status='accepted', is_visit_closed=False)

        if user.groups.filter(name__in=VISIT_MANAGER_GROUPS).exists():
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
        if self.action in ['create', 'mine']:
            return [IsAuthenticated()]

        if self.action == 'list':
            return [IsVisitManager()]

        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]

        if self.action in ['accept', 'reject', 'close']:
            return [IsVisitManager()]

        return [IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def mine(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

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

    @action(detail=True, methods=['patch', 'post'])
    def close(self, request, pk=None):
        visit = self.get_object()
        serializer = self.get_serializer(visit, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            closed_visit = VisitService.close_visit(visit, serializer.validated_data)
        except ValidationError as exc:
            return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(VisitSerializer(closed_visit).data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='busy-slots')
    def busy_slots(self, request):
        date_param = request.query_params.get('date')
        if not date_param:
            return Response(
                {'detail': 'The "date" query param is required (YYYY-MM-DD).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'detail': 'Invalid date format, use YYYY-MM-DD.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visits = Visit.objects.filter(scheduling_date__date=target_date).exclude(acceptance_status='rejected')

        slots = [
            {
                'start': visit.scheduling_date,
                'end': visit.scheduling_date + timedelta(
                    minutes=VISIT_CONSTRAINTS[visit.visit_type]['max_duration_minutes']
                ),
                'all_day': False,
                'reason': None,
            }
            for visit in visits
        ]

        # Add schedule blocks (lab closures) that overlap target date
        day_start = timezone.make_aware(datetime.combine(target_date, datetime.min.time()))
        day_end = timezone.make_aware(datetime.combine(target_date, datetime.max.time().replace(microsecond=0)))

        day_start_padded = day_start - timedelta(hours=14)
        day_end_padded = day_end + timedelta(hours=14)

        blocks = ScheduleBlock.objects.filter(
            start_datetime__lt=day_end_padded,
            end_datetime__gt=day_start_padded,
        )

        for block in blocks:
            slots.append({
                'start': block.start_datetime,
                'end': block.end_datetime,
                'all_day': block.all_day,
                'reason': block.reason,
            })

        return Response(BusySlotSerializer(slots, many=True).data)


class ServiceViewSet(ModelViewSet):
    serializer_class = ServiceSerializer
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user

        if not user or not user.is_authenticated:
            return Service.objects.none()

        if self.action == 'mine':
            return Service.objects.filter(requester=user)

        if user.groups.filter(name__in=MANAGER_GROUPS).exists():
            return Service.objects.all()

        return Service.objects.filter(requester=user)

    def get_permissions(self):
        if self.action in ['create', 'mine']:
            return [IsAuthenticated()]

        if self.action == 'list':
            return [IsOwnerOrManager()]

        return [IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def mine(self, request):
        serializer = ServiceSerializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            service = ServiceService.create_service(
                requester=request.user,
                validated_data=serializer.validated_data,
            )
        except ValidationError as exc:
            return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            ServiceSerializer(service).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        service = self.get_object()
        is_manager = request.user.groups.filter(name__in=MANAGER_GROUPS).exists()

        if service.requester != request.user and not is_manager:
            return Response(status=status.HTTP_403_FORBIDDEN)

        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(service, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        service = self.get_object()
        is_manager = request.user.groups.filter(name__in=MANAGER_GROUPS).exists()

        if service.requester != request.user and not is_manager:
            return Response(status=status.HTTP_403_FORBIDDEN)

        service.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReportViewSet(ViewSet):
    """
    Handles report generation (data and PDF) exclusively for Owners.
    """
    permission_classes = [IsOwner]

    def list(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        data = ReportService.get_report_data(year=year, month=month)
        return Response(data)

    @action(detail=False, methods=['get'], url_path='data')
    def get_data(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        data = ReportService.get_report_data(year=year, month=month)
        return Response(data)

    @action(detail=False, methods=['get'], url_path='pdf')
    def export_pdf(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        data = ReportService.get_report_data(year=year, month=month)
        pdf_bytes = ReportService.generate_pdf(data)

        target_year = data['period']['year']
        target_month = data['period']['month']
        suffix = f"{target_year}_{target_month:02d}" if target_month else f"{target_year}_anual"
        filename = f"relatorio_cnat_maker_{suffix}.pdf"

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class ScheduleBlockViewSet(ModelViewSet):
    queryset = ScheduleBlock.objects.all().order_by('start_datetime')
    serializer_class = ScheduleBlockSerializer
    permission_classes = [IsOwner]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        # Support batch list creation: [ {...}, {...} ]
        if isinstance(request.data, list):
            created_blocks = []
            for item in request.data:
                serializer = self.get_serializer(data=item)
                serializer.is_valid(raise_exception=True)
                block = serializer.save(created_by=request.user)
                created_blocks.append(block)
            return Response(
                self.get_serializer(created_blocks, many=True).data,
                status=status.HTTP_201_CREATED,
            )

        # Support batch date range or list of dates
        if isinstance(request.data, dict) and ('dates' in request.data or ('start_date' in request.data and 'end_date' in request.data)):
            data = request.data
            all_day = data.get('all_day', True)
            start_time_str = data.get('start_time')
            end_time_str = data.get('end_time')
            reason = data.get('reason', '')

            dates = []
            if 'start_date' in data and 'end_date' in data:
                try:
                    start_d = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
                    end_d = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
                except ValueError:
                    return Response({'detail': 'Invalid date format, use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
                if end_d < start_d:
                    return Response({'detail': 'End date must be on or after start date.'}, status=status.HTTP_400_BAD_REQUEST)
                curr = start_d
                while curr <= end_d:
                    dates.append(curr)
                    curr += timedelta(days=1)
            elif 'dates' in data:
                raw_dates = data.get('dates', [])
                if not raw_dates:
                    return Response({'detail': 'dates list cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
                for d_str in raw_dates:
                    try:
                        d = datetime.strptime(d_str, '%Y-%m-%d').date() if isinstance(d_str, str) else d_str
                        dates.append(d)
                    except ValueError:
                        return Response({'detail': f'Invalid date format: {d_str}'}, status=status.HTTP_400_BAD_REQUEST)

            if not all_day:
                if not start_time_str or not end_time_str:
                    return Response({'detail': 'start_time and end_time are required when all_day is False.'}, status=status.HTTP_400_BAD_REQUEST)
                try:
                    start_t = datetime.strptime(start_time_str, '%H:%M').time()
                    end_t = datetime.strptime(end_time_str, '%H:%M').time()
                except ValueError:
                    return Response({'detail': 'Invalid time format, use HH:MM.'}, status=status.HTTP_400_BAD_REQUEST)
                if end_t <= start_t:
                    return Response({'detail': 'end_time must be after start_time.'}, status=status.HTTP_400_BAD_REQUEST)

            created_blocks = []
            for d in dates:
                if all_day:
                    start_dt = timezone.make_aware(datetime.combine(d, datetime.min.time()))
                    end_dt = timezone.make_aware(datetime.combine(d, datetime.max.time().replace(microsecond=0)))
                else:
                    start_dt = timezone.make_aware(datetime.combine(d, start_t))
                    end_dt = timezone.make_aware(datetime.combine(d, end_t))

                block = ScheduleBlock.objects.create(
                    start_datetime=start_dt,
                    end_datetime=end_dt,
                    all_day=all_day,
                    reason=reason,
                    created_by=request.user,
                )
                created_blocks.append(block)

            return Response(
                self.get_serializer(created_blocks, many=True).data,
                status=status.HTTP_201_CREATED,
            )

        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        if not isinstance(ids, list):
            return Response({'detail': 'ids must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

        deleted_count, _ = ScheduleBlock.objects.filter(id__in=ids).delete()
        return Response({'deleted': deleted_count}, status=status.HTTP_200_OK)
