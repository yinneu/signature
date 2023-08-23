# document \ view.py

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.core.serializers.json import DjangoJSONEncoder
from django.views import View
from django.http import JsonResponse
from django.conf import settings
import pandas as pd
import numpy as np
import csv
import json
import os
from documents.models import Vaccine, Vos


class IndexView(View):  # 메인페이지
    def get(self, request):
        return render(request, "documents/index.html")


class ScriptView(View):  # 스크립트 다운 및 네트워크 트래픽 캡쳐 페이지
    def get(self, request):
        return render(request, "documents/script_exp.html")


class NetworkView(View):  # 네트워크 설명 페이지
    def get(self, request):
        return render(request, "documents/network_exp.html")


class ProtocolView(View):  # 프로토콜 설명 페이지
    def get(self, request):
        return render(request, "documents/protocol_exp.html")


class AttackView(View):  # 공격 유형 설명 페이지
    def get(self, request):
        return render(request, "documents/attack_exp.html")
    
    
class VaccineView(View):  # 백신 데이터 테스트 페이지
    def get(self, request):
        
    # name = models.CharField(max_length=100)     # 백신 이름
    # exp = models.TextField()                    # 한줄소개
    # image = models.CharField(max_length=255,null=True)   # 제품사진1
    # price = models.IntegerField() # 가격비교
    # price_str = models.CharField(max_length=50) #가격 string
    # link = models.URLField(max_length = 255)    #링크
    # created_at = models.DateTimeField(auto_now_add=True, auto_now=False) #등록일
    # category = models.ManyToManyField(Category)
    # browers = models.CharField(max_length=100,null=True)
        
        return render(request, "documents/vaccine.html")


def file_download(request):
    # 파일 경로
    file_path = os.path.join(settings.MEDIA_ROOT, 'traffic_capture_script.py')
    # 파일 이름
    file_name = os.path.basename(file_path)
    # 파일 객체 열기
    with open(file_path, 'rb') as f:
        # HttpResponse 객체 생성
        response = HttpResponse(f.read(), content_type='application/pdf')
        # 파일 다운로드 대화상자 표시
        response['Content-Disposition'] = 'attachment; filename="{}"'.format(
            file_name)
        return response
