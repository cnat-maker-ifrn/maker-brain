from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import SchoolViewSet, CompanyViewSet, VisitViewSet, ServiceViewSet

router = DefaultRouter()

router.register(r'schools', SchoolViewSet, basename='schools')
router.register(r'companies', CompanyViewSet, basename='companies')
router.register(r'visits', VisitViewSet, basename='visits')
router.register(r'services', ServiceViewSet, basename='services')

urlpatterns = [
    path('', include(router.urls)),
]