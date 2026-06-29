from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import SchoolViewSet, CompanyViewSet, VisitViewSet

router = DefaultRouter()

router.register(r'schools', SchoolViewSet, basename='schools')
router.register(r'companies', CompanyViewSet, basename='companies')
router.register(r'visits', VisitViewSet, basename='visitis')

urlpatterns = [
    path('', include(router.urls)),
]