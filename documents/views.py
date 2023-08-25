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
from documents.models import Vaccine, Vos, Attack, VaccinePriority


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
      
      # 일단 모든 데이터 넘기기
      # 만약 request 안에 해당 값들이 있다면 필터링 하는거임
      # 여기서 request get으로 들어오는거 받아서 필터링
      #1. 검색 => 한줄소개랑, 키워드 있는 백신만
      #1. 추천순, 최신순, 저가순, 고가순
      #2. 윈도우, 맥, 안드로이드, ios
      #3. 개인용, 가정용, 기업용
      sort_option = request.GET.get('sort_option', None)
      os = request.GET.get('os', None)
      user = request.GET.get('user', None)
      price = request.GET.get('price', None)

      # 백신 필터링 로직
      vaccines = Vaccine.objects.all().values('id','name','price_str','exp','image','link','category')
      # 백신 전체 가지고 온다.

      data = {

          "vc_list": vaccines

      }  
      
      return render(request, "documents/vaccine.html",data)
    
    
 





def get_filtered_results(request):
    if request.method == 'GET':
        selected_filters = request.GET  # 전달된 데이터를 모두 가져옴
        
        print(selected_filters)  # 전달된 데이터를 콘솔에 출력 (디버깅용)
        sort = selected_filters['sort_filter']
        user = selected_filters['user_filter']
        os = selected_filters['os_filter']
        price = selected_filters['price_filter']
        
        
        vaccines = Vaccine.objects.all().values('id','name','price','price_str','exp','image','link','category','created_at')
        
        
        # os 필터링
        if os != "OS":
          if os == "Windows":
              vaccines = vaccines.filter(vos__os_type=0)  # window
          elif os == "Mac":
              vaccines = vaccines.filter(vos__os_type=1)  # mac
              # print(vaccines)
          elif os == "Linux":
              vaccines = vaccines.filter(vos__os_type=2)  # linux
        else: 
          print("pass1")
          pass
              
        # 가격 필터
        if price != "가격" :
          if price == "저가순":
              vaccines = vaccines.order_by('price')
          elif price == "고가순":
              vaccines = vaccines.order_by('-price')
        else: 
          print("pass2")
          pass        
        
        # user 필터링
        if user != "사용자":
            if user == "가정용" :
              # vaccines = vaccines.filter(category=str(user))  # 필드 이름에 맞게 변경
              vaccines = vaccines.filter(category__id=1)
            elif user == "개인용" :
              vaccines = vaccines.filter(category__id=2)
            elif user == "기업용" :
              vaccines = vaccines.filter(category__id=3)
        else: 
          print("pass3")
          pass              
              
        # 정렬 필터링
        if sort != "추천순" :
            vaccines = vaccines.order_by('-created_at')
        else: 
          print("pass4")
          pass
        
        # print(vaccines)
  
        # 데이터를 JSON 형식으로 변환하여 반환
        data = {
            "vc_list": list(vaccines),
            "sort": sort,
            "os": os,
            "user": user,
            "price": price
        }

        return JsonResponse(data)



      
      
def get_vc_detail(request):
  
    
    vc_id = request.GET['vc_id']
    
    vc_link = Vaccine.objects.get(pk=vc_id).link
    
    
    # 디테일 이미지는 detail_{{ id }} 로 저장해서 받자 ㅇㅇ
    data = {
      "vc_id" : vc_id,
      "vc_link" : vc_link
      # 백신 아이디
      # 링크
    }
    
    
    return render(request, "documents/vc_detail.html" ,data)

    
    


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
