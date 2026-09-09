from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'MedLab API'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('lab.urls')),
    path('api-auth/login/', obtain_auth_token),
    path('health/', health_check),
    path('api/health/', health_check),
]

