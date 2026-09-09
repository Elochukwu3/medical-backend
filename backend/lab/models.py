from django.db import models
from django.contrib.auth.models import User

class Patient(models.Model):
    patient_id=models.CharField(max_length=30,unique=True)
    full_name=models.CharField(max_length=150)
    sex=models.CharField(max_length=20)
    date_of_birth=models.DateField()
    phone=models.CharField(max_length=30,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self): return f'{self.patient_id} - {self.full_name}'

class LaboratoryTest(models.Model):
    test_id=models.CharField(max_length=30,unique=True)
    name=models.CharField(max_length=150)
    unit=models.CharField(max_length=50)
    lower_reference=models.FloatField()
    upper_reference=models.FloatField()
    category=models.CharField(max_length=100,blank=True)
    def __str__(self): return self.name

class LaboratoryResult(models.Model):
    STATUS_CHOICES=[('LOW','LOW'),('WITHIN RANGE','WITHIN RANGE'),('HIGH','HIGH')]
    patient=models.ForeignKey(Patient,on_delete=models.PROTECT,related_name='results')
    test=models.ForeignKey(LaboratoryTest,on_delete=models.PROTECT,related_name='results')
    value=models.FloatField()
    test_date=models.DateField()
    status=models.CharField(max_length=20,choices=STATUS_CHOICES)
    recorded_by=models.ForeignKey(User,on_delete=models.PROTECT)
    created_at=models.DateTimeField(auto_now_add=True)

class AuditLog(models.Model):
    user=models.ForeignKey(User,on_delete=models.PROTECT)
    action=models.CharField(max_length=255)
    created_at=models.DateTimeField(auto_now_add=True)
