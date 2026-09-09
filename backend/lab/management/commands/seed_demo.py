from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from lab.models import Patient,LaboratoryTest,LaboratoryResult
from datetime import date
class Command(BaseCommand):
    def handle(self,*args,**kwargs):
        u,_=User.objects.get_or_create(username='labadmin',defaults={'email':'admin@medlab.demo','is_staff':True})
        u.set_password('demo123'); u.save()
        if not u.is_staff: u.is_staff=True; u.save()
        tests=[
          ('T001','Glucose','mg/dL',70,99,'Chemistry'),
          ('T002','Haemoglobin','g/dL',12,17,'Haematology'),
          ('T003','WBC','×10⁹/L',4,11,'Haematology'),
          ('T004','Creatinine','mg/dL',0.6,1.3,'Chemistry')]
        for x in tests: LaboratoryTest.objects.get_or_create(test_id=x[0],defaults=dict(name=x[1],unit=x[2],lower_reference=x[3],upper_reference=x[4],category=x[5]))
        patients=[('P001','Amaka Okafor','Female',date(1998,4,12)),('P002','Chinedu Eze','Male',date(1995,9,20)),('P003','Ada Nwosu','Female',date(2001,2,15))]
        for x in patients: Patient.objects.get_or_create(patient_id=x[0],defaults={'full_name':x[1],'sex':x[2],'date_of_birth':x[3]})
        self.stdout.write(self.style.SUCCESS('Demo data ready. Login: labadmin / demo123'))
