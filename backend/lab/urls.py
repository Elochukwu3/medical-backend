from rest_framework.routers import DefaultRouter
from django.urls import path,include
from .views import PatientViewSet,LaboratoryTestViewSet,LaboratoryResultViewSet,AuditLogViewSet
router=DefaultRouter()
router.register('patients',PatientViewSet)
router.register('tests',LaboratoryTestViewSet)
router.register('results',LaboratoryResultViewSet)
router.register('audit-logs',AuditLogViewSet)
urlpatterns=[path('',include(router.urls))]
