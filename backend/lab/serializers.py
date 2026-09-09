from rest_framework import serializers
from .models import Patient,LaboratoryTest,LaboratoryResult,AuditLog

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model=Patient
        fields='__all__'

class LaboratoryTestSerializer(serializers.ModelSerializer):
    class Meta:
        model=LaboratoryTest
        fields='__all__'
    def validate(self,data):
        if data['upper_reference']<=data['lower_reference']:
            raise serializers.ValidationError('Upper reference must be greater than lower reference.')
        return data

class LaboratoryResultSerializer(serializers.ModelSerializer):
    class Meta:
        model=LaboratoryResult
        fields='__all__'
        read_only_fields=['status','recorded_by']
    def create(self,validated_data):
        test=validated_data['test']; value=validated_data['value']
        status='LOW' if value<test.lower_reference else 'HIGH' if value>test.upper_reference else 'WITHIN RANGE'
        request=self.context.get('request')
        obj=LaboratoryResult.objects.create(**validated_data,status=status,recorded_by=request.user)
        if request:
            AuditLog.objects.create(user=request.user,action=f'Created result {obj.id}: {status}')
        return obj

class AuditLogSerializer(serializers.ModelSerializer):
    user_name=serializers.CharField(source='user.username',read_only=True)
    class Meta:
        model=AuditLog
        fields=['id','user_name','action','created_at']
