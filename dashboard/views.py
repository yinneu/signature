# dashboard \ view.py
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.core.serializers.json import DjangoJSONEncoder
from django.views import View
from django.http import JsonResponse
import pandas as pd
import numpy as np
import csv
import json
import joblib  # for ids 모델 적용
import os
from django.conf import settings

# 파일 저장 모델
from .models import UploadedFile
# 사용자 구분
import uuid
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
# 삭제
from django.utils import timezone
from datetime import timedelta

# 데이터 처리 함수 불러오기
from dashboard.dataprocess import dataProcess

# 모델
from documents.models import Vaccine, Vos, Attack

# pdf


class DashboardView(View):
    def get(self, request):
        print('접속')
        return render(request, 'dashboard/dashboard.html')

    def post(self, request):
        if request.method == 'POST' and request.FILES['csv_file']:
            
            
            # request.post[]
            use = request.POST['use']
            user = request.POST['user']
            price = request.POST['price']
            keyword = request.POST['keyword']
            print("\n옵션 정보fewfewf: ",use,user,price,keyword)

                    
            # use : 1,0
            # user: 1,2,3
            # keyword : string
            # price : 0 (상관없음), 1 (저가), 2(고가)
            
            csv_file = request.FILES['csv_file']
            df = pd.read_csv(csv_file)
            
            # 컴퓨터 사양 컬럼 정보 추출
            myos = df.loc[0,['OS']][0]
            myram = df.loc[0,'RAM']
            myhd = df.loc[0,['HD']][0]
            myb = df.loc[0,['Browser']][0]
            print("사용자 정보: ",myos,myram,myhd,myb)
            
            # 컴퓨터 사양 컬럼 제외
            columns_to_drop = ['Payload','OS','RAM','HD','Browser']
            df.drop(columns_to_drop, axis=1, inplace=True)
            

            
            # 사용자 유저 정보 필요 (백신을 추천 받을 경우)
            if (use == '1'):
              
              #os 필터
              #ram 필터
              #hdd 필터
              
              
              #공격이 있을 때, 공격 키워드와 솔루션 키워드 교집합 카운트별 순위화
              
             
              #사용자 키워드 필터
              if(keyword != ''):
                #사용자 키워드 필터
                # yess = Vaccine.objects.all().filter(keyword__contains=keyword)
                print('keyword 출력/////',keyword)
                
            

            # 공격 유형 판별 (ids)
            labels = PreProcessing(df)
            df['labels'] = labels

            # 고유한 식별자 생성
            user_uuid = uuid.uuid4()  # 새로운 UUID 생성
            request.session['user_id'] = str(
                user_uuid)  # UUID를 문자열로 변환하여 세션에 저장

            # DataFrame을 CSV 파일로 저장
            file_content = df.to_csv(index=False)
            file_path = f'upload_files/{user_uuid}.csv'

            # 파일 저장
            saved_file_path = default_storage.save(
                file_path, ContentFile(file_content))

            # 파일과 UUID 연결 및 저장 (만료시간 설정)
            expiration_time = timezone.now() + timedelta(minutes=10)
            uploaded_file = UploadedFile(
                file_path=saved_file_path, user_uuid=user_uuid, expiration_time=expiration_time)
            uploaded_file.save()

            return HttpResponse("파일 업로드가 완료되었습니다.")

        else:
            return render(request, 'document/index.html')


# ids 모델 예측 전 데이터 전처리
def PreProcessing(data):

    # 새로 바뀐 전처리
    cols_to_keep = ['Source IP', 'Destination IP', 'Protocol', 'Source Port', 'Destination Port', 'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count',
                    'PSH Flag Count', 'ACK Flag Count', 'URG Flag Count', 'CWE Flag Count', 'ECE Flag Count', 'Length', 'IAT']

    # 요구하는 컬럼만 추출하여 새로운 DataFrame 생성
    new_dataset = data[cols_to_keep]

    # 숫자형으로 통일 시키기 위해 전처리
    new_dataset['Source IP'] = new_dataset['Source IP'].apply(lambda x: sum(
        [int(i) * (256 ** j) for j, i in enumerate(x.split('.')[::-1])]))
    new_dataset['Destination IP'] = new_dataset['Destination IP'].apply(
        lambda x: sum([int(i) * (256 ** j) for j, i in enumerate(x.split('.')[::-1])]))

    predict_df = new_dataset

    # ids 적용 : 모델 불러오기
    model = joblib.load('./dashboard/media/ids_model.pkl')

    # 예측하기
    y_pred = model.predict(predict_df)

    return y_pred


# 대시보드로 데이터 전달
def GetData(request):

    user_uuid = request.session.get('user_id')  # 세션에서 UUID 가져오기

    try:
        uploaded_file = UploadedFile.objects.get(
            user_uuid=user_uuid)  # UUID에 해당하는 파일 가져오기
        file_path = uploaded_file.file_path

        expired_files = UploadedFile.objects.filter(
            expiration_time__lt=timezone.now())
        for file in expired_files:
            print("파일 삭제:", file)
            file.delete()
            default_storage.delete(file.file_path)

        # 파일 읽기
        with default_storage.open(file_path) as file:

            data = pd.read_csv(file)

            data_fin = dataProcess(data)

            return JsonResponse(data_fin, content_type='application/json')

    except UploadedFile.DoesNotExist:
        return HttpResponse("파일을 찾을 수 없습니다.")

# pdf 다운
