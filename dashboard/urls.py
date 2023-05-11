# dashboard \ urls.py

from django.urls import path
from . import views

from dashboard import views

app_name = 'dashboard'

urlpatterns = [
    # /dashboard
    path('', views.DashboardView.as_view(), name='dashboard'),
    path('get_data/', views.GetData, name='get_data'),
]
