from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Patient,LaboratoryTest,LaboratoryResult,AuditLog
from .serializers import PatientSerializer,LaboratoryTestSerializer,LaboratoryResultSerializer,AuditLogSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset=Patient.objects.all().order_by('-created_at')
    serializer_class=PatientSerializer
    permission_classes=[IsAuthenticated]

class LaboratoryTestViewSet(viewsets.ModelViewSet):
    queryset=LaboratoryTest.objects.all().order_by('name')
    serializer_class=LaboratoryTestSerializer
    permission_classes=[IsAuthenticated]

class LaboratoryResultViewSet(viewsets.ModelViewSet):
    queryset=LaboratoryResult.objects.select_related('patient','test','recorded_by').all().order_by('-test_date','-created_at')
    serializer_class=LaboratoryResultSerializer
    permission_classes=[IsAuthenticated]

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=AuditLog.objects.select_related('user').all().order_by('-created_at')
    serializer_class=AuditLogSerializer
    permission_classes=[IsAuthenticated]
