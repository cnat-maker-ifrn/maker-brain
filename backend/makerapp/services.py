from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
from makerapp.models import Visit

VISIT_CONSTRAINTS = {
    'fast':      {'max_duration_minutes': 20, 'max_visitors': 25},
    'childish':  {'max_duration_minutes': 30, 'max_visitors': 20},
    'technical': {'max_duration_minutes': 30, 'max_visitors': 25},
}

MIN_SCHEDULING_ADVANCE_DAYS = 2


class VisitService:

    @staticmethod
    def _validate_scheduling_date(scheduling_date):
        min_date = timezone.now() + timedelta(days=MIN_SCHEDULING_ADVANCE_DAYS)
        if scheduling_date < min_date:
            raise ValidationError(
                {'scheduling_date': f'Visits must be scheduled at least {MIN_SCHEDULING_ADVANCE_DAYS} days in advance.'}
            )

    @staticmethod
    def _validate_forecast_visitors(visit_type, forecast_number_of_visitors):
        max_visitors = VISIT_CONSTRAINTS[visit_type]['max_visitors']
        if forecast_number_of_visitors > max_visitors:
            raise ValidationError(
                {'forecast_number_of_visitors': f'A {visit_type} visit supports at most {max_visitors} visitors.'}
            )

    @staticmethod
    def create_visit(requester, validated_data: dict) -> Visit:
        scheduling_date = validated_data['scheduling_date']
        visit_type = validated_data['visit_type']
        forecast_number_of_visitors = validated_data['forecast_number_of_visitors']

        VisitService._validate_scheduling_date(scheduling_date)
        VisitService._validate_forecast_visitors(visit_type, forecast_number_of_visitors)

        visit = Visit.objects.create(requester=requester, **validated_data)
        return visit

    @staticmethod
    def accept_visit(visit: Visit) -> Visit:
        if visit.acceptance_status != 'pending':
            raise ValidationError({'acceptance_status': 'Only pending visits can be accepted.'})
        visit.acceptance_status = 'accepted'
        visit.save()
        return visit

    @staticmethod
    def reject_visit(visit: Visit) -> Visit:
        if visit.acceptance_status != 'pending':
            raise ValidationError({'acceptance_status': 'Only pending visits can be rejected.'})
        visit.acceptance_status = 'rejected'
        visit.save()
        return visit

    @staticmethod
    def close_visit(visit: Visit, validated_data: dict) -> Visit:
        if visit.acceptance_status != 'accepted':
            raise ValidationError({'acceptance_status': 'Only accepted visits can be closed.'})
        if visit.is_visit_closed:
            raise ValidationError({'is_visit_closed': 'This visit is already closed.'})

        required_fields = ['has_visited', 'real_number_of_visitors', 'photo', 'observations']
        missing = [f for f in required_fields if not validated_data.get(f)]
        if missing:
            raise ValidationError({f: 'This field is required to close a visit.' for f in missing})

        for attr, value in validated_data.items():
            setattr(visit, attr, value)

        visit.is_visit_closed = True
        visit.save()
        return visit