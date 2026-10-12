from rest_framework import serializers
from makerapp.models import School, Company, Visit, Service, ScheduleBlock


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = '__all__'


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class VisitSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.name', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Visit
        fields = '__all__'
        read_only_fields = ['acceptance_status', 'has_visited', 'is_visit_closed', 'real_number_of_visitors']

    def validate(self, data):
        requester_origin = data.get('requester_origin', getattr(self.instance, 'requester_origin', None))
        school = data.get('school', getattr(self.instance, 'school', None))
        company = data.get('company', getattr(self.instance, 'company', None))
        cnat_department = data.get('cnat_department', getattr(self.instance, 'cnat_department', None))

        if requester_origin == 'school' and not school:
            raise serializers.ValidationError({'school': 'School is required when requester origin is school.'})

        if requester_origin == 'company' and not company:
            raise serializers.ValidationError({'company': 'Company is required when requester origin is company.'})

        if requester_origin == 'cnat' and not cnat_department:
            raise serializers.ValidationError({'cnat_department': 'Department is required when requester origin is CNAT.'})

        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            is_staff_or_manager = request.user.groups.filter(
                name__in=['Owners', 'Managers', 'Scholarship Students']
            ).exists()
            if not is_staff_or_manager and instance.is_visit_closed:
                data['photo'] = None
                data['observations'] = None
                data['description'] = None
                data['real_number_of_visitors'] = None
        return data


class VisitStatusUpdateSerializer(serializers.ModelSerializer):
    """Handles acceptance/rejection of visits by staff."""

    class Meta:
        model = Visit
        fields = ['acceptance_status']


class VisitCloseSerializer(serializers.ModelSerializer):
    """Handles closing a visit after it occurs."""

    class Meta:
        model = Visit
        fields = ['has_visited', 'real_number_of_visitors', 'photo', 'observations', 'description', 'is_visit_closed']

    def validate(self, data):
        if data.get('is_visit_closed') and data.get('real_number_of_visitors') is None:
            raise serializers.ValidationError({
                'real_number_of_visitors': 'Real number of visitors is required when closing a visit.'
            })
        return data

class BusySlotSerializer(serializers.Serializer):
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    all_day = serializers.BooleanField(required=False, default=False)
    reason = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class ScheduleBlockSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = ScheduleBlock
        fields = [
            'id',
            'start_datetime',
            'end_datetime',
            'all_day',
            'reason',
            'created_by',
            'created_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at']

    def validate(self, data):
        start = data.get('start_datetime', getattr(self.instance, 'start_datetime', None))
        end = data.get('end_datetime', getattr(self.instance, 'end_datetime', None))
        if start and end and end <= start:
            raise serializers.ValidationError({'end_datetime': 'End datetime must be after start datetime.'})
        return data


class ServiceSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.name', read_only=True)

    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['requester']