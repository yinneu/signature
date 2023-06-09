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
