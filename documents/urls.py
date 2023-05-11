# documents / urls.py

from django.urls import path
from django.shortcuts import render, redirect
from . import views

from documents import views

app_name = 'documents'


urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),  # 메인 페이지
    path('script_exp/', views.ScriptView.as_view(),     # 스크립트 다운 및 트래픽 캡쳐 설명 페이지
         name='script_exp'),
    path('file_download',
         views.file_download, name='file_download'),
    path('network_exp/', views.NetworkView.as_view(),     # 네트워크 설명 페이지
         name='network_exp'),
    path('protocol_exp/', views.ProtocolView.as_view(),     # 프로토콜 설명 페이지
         name='protocol_exp'),
    path('attack_exp/', views.AttackView.as_view(),     # 프로토콜 설명 페이지
         name='attack_exp'),
]
