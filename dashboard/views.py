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
from django.db.models import Q, Sum, F
from django.db.models.functions import Coalesce
from documents.models import Vaccine, Vos, Attack, VaccinePriority




class DashboardView(View):
    def get(self, request):
        print('접속')
        stored_data_json = request.session.get('stored_data', None)
        
        if stored_data_json:
          stored_data = json.loads(stored_data_json)
          use_value = stored_data['use']
          price_value = stored_data['price']
          vaccine_list = stored_data['vaccine']
          
        vs = list(Vaccine.objects.filter(id__in=vaccine_list).values('id','name','price_str','exp','image','link'))
          
        data = {
          "use": use_value,
          "vc_list": vs
        }  
        
        
        return render(request, 'dashboard/dashboard.html', data)

    def post(self, request):
        if request.method == 'POST' and request.FILES['csv_file']:
            
            
            # request.post[]
            use = request.POST['use']  # use : 1,0
            user = request.POST['user'] # user: 1,2,3
            price = request.POST['price'] # price : 0 (상관없음), 1 (저가), 2(고가)
            keyword = request.POST['keyword'] # keyword : string
            print("\n옵션 정보: ",use,user,price,keyword)
            
            # csv to df
            csv_file = request.FILES['csv_file']
            df = pd.read_csv(csv_file)
            
            # 컴퓨터 사양 컬럼 정보 추출
            myos = df.loc[0,['OS']][0]
            myram = df.loc[0,'RAM']
            myhd = df.loc[0,['HDD']][0] 
            myb = df.loc[0,['Browser']][0]
            print("사용자 정보: ",myos,myram,myhd,myb)
            
            
            # 컴퓨터 사양 컬럼 제외
            columns_to_drop = ['OS','RAM','HDD','Browser']
            df.drop(columns_to_drop, axis=1, inplace=True)
              
            

            # 공격 유형 판별 (ids)
            labels = PreProcessing(df)
            # attacks = labels.unique()
            df['labels'] = labels
            att_type = df['labels'].unique()
            print('att_type',att_type)
            

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
            expiration_time = timezone.now() + timedelta(minutes=60)
            uploaded_file = UploadedFile(
                file_path=saved_file_path, user_uuid=user_uuid, expiration_time=expiration_time)
            uploaded_file.save()
            
            
            # 백신 필터링
            # 백신 추천 받는 경우 => dashboard로 넘겨야하는 
            # att_type
            vc_id_list = [] # 백신 id 리스트
            if (use == '1'):

              if "Windows" in myos:
                user_os = 0
              elif "Darwin" in myos:
                user_os = 1
              else : #linux
                user_os = 2
              # print('user_os =', user_os)

              # 사용유저 필터 (가정, 개인, 기업) / 키워드 없는 백신 데이터도 제외
              ok_user = list(Vaccine.objects.filter(category=int(user),keyword__isnull=False).values_list('id',flat=True))
              # print('ok_user:',ok_user)

              
              # 해당 백신 아이디를 한 os 정보를 가져와야 함.
              q = Q() #os 필터 , ram 필터 ,hdd 필터
              q.add(Q(vc_id__in=ok_user), q.AND)
              q.add(Q(os_type=user_os)|Q(os_type=3), q.AND)
              q.add(Q(ram__lte = myram), q.AND)
              q.add(Q(hdd__lte = myhd), q.AND)
              
              # ok_os = Vos.objects.all().filter(q).values('vc_id')
              ok_op = list(Vos.objects.all().filter(q).values_list('vc_id',flat=True))
              # print('ok_os:',ok_op)
              
              
              # 키워드 검사 
              
              # 특정 키워드가 포함된 백신들 가져오기
              if(keyword != ''):
                  ok_keyword = Vaccine.objects.filter(id__in=ok_op, keyword__icontains=keyword)
                  if ok_keyword.exists():
                      print(ok_keyword) #있을 경우 ok_op에 백신 id를 담음
                      ok_op = list(ok_keyword.values_list('id',flat=True))
              # print('ok_key:',ok_op)
              
              
              
              # 탐지된 공격 유형별, 필터된 백신의 매칭도로 정렬
              # 백신별 priority 합 구하기
              vaccine_priority_sums = VaccinePriority.objects.filter(vaccine_id__in=ok_op,attack__a_num__in=att_type).values('vaccine').annotate(priority_sum=Sum('priority'))
              
              
              # 결과를 사전으로 저장하고 리스트에 추가
              vc_list = []
              for entry in vaccine_priority_sums:
                vaccine_id = entry['vaccine']
                priority_sum = entry['priority_sum']
                
                vaccine = Vaccine.objects.get(pk=vaccine_id)  # 해당 백신 가져오기
                vc_price = vaccine.price
                
                vc_list.append({'vaccine_id': vaccine_id, 'priority_sum': priority_sum, 'price': vc_price})
                
              # print(vc_list)
              

              
              
              # 가격필터 ) 저가, 고가순으로 정렬 # 다시하기 => 이거 필터 순서를 어떻게 할지 생각해보자
              if price != '0':
                if price == '1':
                  print('저가 정렬')
                  sorted_vc_list = sorted(vc_list, key=lambda x: (-x['priority_sum'], x['price']))
                else:
                  print('고가 정렬')
                  sorted_vc_list = sorted(vc_list, key=lambda x: (-x['priority_sum'], -x['price']))
              else:
                print('상관없음')
                sorted_vc_list = sorted(vc_list, key=lambda x: (-x['priority_sum']))
              
              
              # print(sorted_vc_list)


              # 정렬된 리스트에서 백신 id만 가져오기
              vaccine_ids = [entry['vaccine_id'] for entry in sorted_vc_list]

              # 리스트 길이가 3개보다 많을 때는 앞에 3개만 가져오기
              if len(vaccine_ids) > 3:
                  vc_id_list = vaccine_ids[:3]
              else:
                  vc_id_list = vaccine_ids

              # print(vc_id_list)


            data_to_store = {
                "use": use,
                "price": price,
                "vaccine": vc_id_list
            }
            # JSON 데이터를 문자열로 변환하여 세션에 저장
            request.session['stored_data'] = json.dumps(data_to_store)

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

    #request 로 해당 백신 정보 받아오기?
    
    user_uuid = request.session.get('user_id')  # 세션에서 UUID 가져오기
    # stored_data_json = request.session.get('stored_data', None)
    
    
    # if stored_data_json:
    #     stored_data = json.loads(stored_data_json)
    #     use_value = stored_data['use']
    #     price_value = stored_data['price']
    #     vaccine_list = stored_data['vaccine']


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
            
            
            # 백신 데이터 추가
            # data_fin['use'] = use_value
            # data_fin 여기에 백신 정보 추가해서 넘기면 됨.
            # vs = list(Vaccine.objects.filter(id__in=vaccine_list).values('id','name','price_str','exp','image','link'))
            # print(vs)
            # 여기서 정렬
            
            # data_fin['vc'] = vs
            
            ### 백신 정보 카드리스트 가져와서 넣기
            
            
            return JsonResponse(data_fin, content_type='application/json')

    except UploadedFile.DoesNotExist:
        return HttpResponse("파일을 찾을 수 없습니다.")
    except Vaccine.DoesNotExist:
        return HttpResponse("백신을 찾을 수 없습니다.")

# pdf 다운
