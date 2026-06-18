from django.db import models


class User(models.Model):
    auth_id = models.IntegerField(unique=True) # id from authentication API
    cpf = models.CharField(max_length=11, unique=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    cellphone = models.CharField(max_length=20)
    bond = models.CharField(max_length=20)
    enrollment = models.CharField(max_length=20, null=True, blank=True)
    groups = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "users"
    
    def __str__(self):
        return f"{self.name} ({self.email})"


class School(models.Model):
    SCHOOL_TYPE_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]

    inep_code = models.IntegerField(unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    school_type = models.CharField(max_length=7, choices=SCHOOL_TYPE_CHOICES)
    city = models.CharField(max_length=100, blank=True) 
    state = models.CharField(max_length=2,  blank=True)

    class Meta:
        db_table = "schools"

    def __str__(self):
        return f"{self.name} ({self.inep_code})"

class Company(models.Model):
    name = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=14, unique=True, null=True, blank=True)
    is_incubated = models.BooleanField(default=False)

    class Meta:
        db_table = "companies"

    def __str__(self):
        return f"{self.name} ({self.cnpj})"

class Visit(models.Model):
    VISIT_TYPE_CHOICES = [
        ('fast', 'Fast'),
        ('childish', 'Childish'),
        ('technical', 'Technical'),
    ]

    ACCEPTANCE_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected')
    ]

    REQUESTER_ORIGIN_CHOICES = [
        ('cnat', 'CNAT'),
        ('school', 'School'),
        ('company', 'Company'),
        ('external', 'External')
    ]
    
    DEPARTMENT_CHOICES = [
        ('diatinf', 'DIATINF'),
        ('diaren', 'DIAREN'),
        ('diacon', 'DIACON'),
        ('diacin', 'DIACIN'),
        ('diac', 'DIAC')
    ]

    visit_type = models.CharField(max_length=9, choices=VISIT_TYPE_CHOICES)
    scheduling_date = models.DateTimeField()
    has_visited = models.BooleanField(default=False)
    forecast_number_of_visitors = models.IntegerField()
    real_number_of_visitors = models.IntegerField(null=True, blank=True)
    is_visit_closed = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='visit_photos/', null=True, blank=True)
    observations = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    acceptance_status = models.CharField(max_length=8, choices=ACCEPTANCE_STATUS_CHOICES, default='pending')
    requester = models.ForeignKey('User', on_delete=models.PROTECT, related_name='visits', null=True, blank=True)
    requester_origin = models.CharField(max_length=8, choices=REQUESTER_ORIGIN_CHOICES)
    cnat_department = models.CharField(max_length=7, choices=DEPARTMENT_CHOICES, null=True, blank=True)
    school = models.ForeignKey('School', on_delete=models.PROTECT, related_name='visits', null=True, blank=True)
    company = models.ForeignKey('Company', on_delete=models.PROTECT, related_name='visits', null=True, blank=True)

    class Meta:
        db_table = "visits"

    def __str__(self):
        return f"Visit {self.visit_type}"    