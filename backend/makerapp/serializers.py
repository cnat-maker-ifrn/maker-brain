from rest_framework import serializers
from makerapp.models import School, Company, Visit


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


class VisitStatusUpdateSerializer(serializers.ModelSerializer):
    """Handles acceptance/rejection of visits by staff."""

    class Meta:
        model = Visit
        fields = ['acceptance_status']


class VisitCloseSerializer(serializers.ModelSerializer):
    """Handles closing a visit after it occurs."""

    class Meta:
        model = Visit
        fields = ['has_visited', 'real_number_of_visitors', 'photo', 'observations', 'is_visit_closed']

    def validate(self, data):
        if data.get('is_visit_closed') and data.get('real_number_of_visitors') is None:
            raise serializers.ValidationError({
                'real_number_of_visitors': 'Real number of visitors is required when closing a visit.'
            })
        return data