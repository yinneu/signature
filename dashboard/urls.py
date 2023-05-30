# dashboard \ urls.py

from django.urls import path
from . import views

from dashboard import views
from django.conf.urls.static import static
from django.conf import settings

app_name = 'dashboard'

urlpatterns = [
    # /dashboard
    path('', views.DashboardView.as_view(), name='dashboard'),
    # path('/', views.DashboardView.as_view(), name='dashboard'),
    path('get_data/', views.GetData, name='get_data'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
