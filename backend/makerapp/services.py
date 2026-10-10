from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
from makerapp.models import Visit, Service, ScheduleBlock

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
    def _validate_no_schedule_conflict(scheduling_date, visit_type, exclude_pk=None):
        """
        Ensures no other non-rejected visit or schedule block (lab closure)
        overlaps with the requested time slot, using each visit's own duration.
        """
        new_duration = timedelta(minutes=VISIT_CONSTRAINTS[visit_type]['max_duration_minutes'])
        new_start = scheduling_date
        new_end = scheduling_date + new_duration

        conflicting_block = ScheduleBlock.objects.filter(
            start_datetime__lt=new_end,
            end_datetime__gt=new_start,
        ).first()

        if conflicting_block:
            reason = f": {conflicting_block.reason}" if conflicting_block.reason else "."
            raise ValidationError(
                {'scheduling_date': f'The laboratory is unavailable during this time{reason}'}
            )

        same_day_visits = Visit.objects.filter(
            scheduling_date__date=scheduling_date.date()
        ).exclude(acceptance_status='rejected')

        if exclude_pk is not None:
            same_day_visits = same_day_visits.exclude(pk=exclude_pk)

        for existing_visit in same_day_visits:
            existing_start = existing_visit.scheduling_date
            existing_end = existing_start + timedelta(
                minutes=VISIT_CONSTRAINTS[existing_visit.visit_type]['max_duration_minutes']
            )

            if existing_start < new_end and new_start < existing_end:
                raise ValidationError(
                    {'scheduling_date': 'There is already a visit scheduled that overlaps with this time slot.'}
                )


    @staticmethod
    def create_visit(requester, validated_data: dict) -> Visit:
        scheduling_date = validated_data['scheduling_date']
        visit_type = validated_data['visit_type']
        forecast_number_of_visitors = validated_data['forecast_number_of_visitors']

        VisitService._validate_scheduling_date(scheduling_date)
        VisitService._validate_forecast_visitors(visit_type, forecast_number_of_visitors)
        VisitService._validate_no_schedule_conflict(scheduling_date, visit_type)

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

        required_fields = ['real_number_of_visitors', 'photo', 'observations', 'description']
        errors = {}
        for f in required_fields:
            val = validated_data.get(f)
            if val is None or (isinstance(val, str) and not val.strip()):
                errors[f] = 'This field is required to close a visit.'

        real_visitors = validated_data.get('real_number_of_visitors')
        if real_visitors is not None:
            try:
                num = int(real_visitors)
                if num <= 0:
                    errors['real_number_of_visitors'] = 'Real number of visitors must be greater than zero.'
            except (ValueError, TypeError):
                errors['real_number_of_visitors'] = 'Real number of visitors must be a valid number.'

        if errors:
            raise ValidationError(errors)

        for attr, value in validated_data.items():
            setattr(visit, attr, value)

        visit.has_visited = validated_data.get('has_visited', True)
        visit.is_visit_closed = True
        visit.save()
        return visit

class ServiceService:

    @staticmethod
    def _validate_quantity(quantity):
        if quantity <= 0:
            raise ValidationError({'quantity': 'Quantity must be greater than zero.'})

    @staticmethod
    def create_service(requester, validated_data: dict) -> Service:
        ServiceService._validate_quantity(validated_data['quantity'])

        service = Service.objects.create(requester=requester, **validated_data)
        return service