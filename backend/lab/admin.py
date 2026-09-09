from django.contrib import admin
from .models import Patient,LaboratoryTest,LaboratoryResult,AuditLog
admin.site.register([Patient,LaboratoryTest,LaboratoryResult,AuditLog])
