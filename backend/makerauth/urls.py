from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import RequesterViewSet, ScholarshipStudentViewSet
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView)

router = DefaultRouter()

router.register(r'requesters', RequesterViewSet, basename='requesters')
router.register(r'scholarship-students', ScholarshipStudentViewSet, basename='scholarship-students')

urlpatterns = [
    path('', include(router.urls)),

    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]