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

# import table
# from dashboard.models import time_use, signature, length_frequency, tel_network, flag_count
# db 저장 전 전처리 함수
# from dashboard.dataprocess import TimeTable, SigTable, NetworkTable, FlagTable, PacketTable


class DashboardView(View):
    def get(self, request):
        return render(request, 'dashboard/dashboard.html')

    def post(self, request):
        if request.method == 'POST' and request.FILES['csv_file']:

            csv_file = request.FILES['csv_file']
            # CSV 파일에서 데이터를 읽어서 원하는 작업을 수행 / 데이터프레임
            df = pd.read_csv(csv_file)
            # ids 모델 예측전 데이터 전처리
            labels = PreProcessing(df)
            df['labels'] = labels

            # df => csv 파일로 저장
            # 파일 경로 설정
            file_path = os.path.join(settings.MEDIA_ROOT, 'data.csv')

            # 사용자별 테이블 생성하기
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f'{file_path} 이전 파일 삭제.')
            else:
                df.to_csv(file_path, index=False)
                print(f'{file_path} 파일 저장.')

            # DataFrame을 CSV 파일로 저장
            df.to_csv(file_path, index=False)

            return redirect('/dashboard')

        # 파일이 안 들어왔을 경우 : 메인페이지 랜더링 -> 이후 alert메세지 등 추가하기
        else:
            return render(request, 'document/index.html')

#
#
#
# 데이터 전처리 및 ids 예측


def PreProcessing(data):

    # IDS는 컬럼이 23으로 이루어져 있으므로 그에 맞게 컬럼을 추출함.
    # 추출할 컬럼 리스트
    # cols_to_keep = ['Source IP', 'Destination IP', 'Protocol', 'Source Port', 'Destination Port', 'IAT',
    #                 'Min Packet Length', 'Max Packet Length', 'Packet Length Mean', 'Packet Length Std']

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
    # model = joblib.load('./dashboard/media/model.pkl')
    model = joblib.load('./dashboard/media/new_model.pkl')

    # 예측하기
    y_pred = model.predict(predict_df)

    return y_pred


######################################## 데이터 전처리 ########################################


def MakeTable(labels):
    filtered_df = data[data['labels2'] == labels]
    grouped_df = filtered_df.groupby(['labels2', 'Source_IP', 'Destination_IP']).agg(
        sum=('Length', 'sum'),
        mean=('Length', 'mean'),
        min=('Length', 'min'),
        max=('Length', 'max')
    ).apply(lambda x: round(x, 2)).sort_values(by='sum', ascending=False).reset_index()
    grouped_df[['sum', 'mean', 'min', 'max']] = grouped_df[[
        'sum', 'mean', 'min', 'max']].applymap(lambda x: format(x, ','))
    return grouped_df.iloc[0:10, :]


# 대시보드로 데이터 전달
def GetData(request):

    # csv 파일 받아오기
    data = pd.read_csv(os.path.join(settings.MEDIA_ROOT, 'data.csv'))

    data.rename(columns={'Min Packet Length': 'Length'}, inplace=True)

    # 파이썬 정규표현식 + 열 이름 전환
    cols = data.columns
    cols = cols.str.replace(' ', '_')
    data.columns = cols

    # 프로토콜 라벨 맵핑
    protocol_mapping = {0: "ICMP", 1: "ICMP", 6: "TCP",  # ICMP는 1 아닌가
                        17: "UDP"}  # 레이블에 대한 매핑 정보
    data['Protocol2'] = data['Protocol'].map(
        protocol_mapping).fillna("undetermined")

    #  공격유형 라벨 맵핑 : labels2
    attacks_mapping = {0: "Normal", 1: "DDoS", 2: "PortScan", 3: "Bornet", 4: "Infiltration", 5: "FTP-Patator",
                       6: "SSH-Patator", 7: "DoS_Hulk", 8: "Dos_GoldenEye", 9: "DoS_slowloris",
                       10: "DoS_Slowhttptest", 11: "Heartbleed", 12: "ICMP_Flooding"}  # 레이블에 대한 매핑 정보
    data['labels2'] = data['labels'].map(
        attacks_mapping).fillna("undetermined")
    # 공격유형 가져오기
    attacks = data['labels2'].unique()
    print(attacks)

    # 시간 가져오기
    time = data['Timestamp'].tolist()

    # 1.  시그니처
    sig = data[['Source_IP', 'Destination_IP',
                'Destination_Port', 'Length', 'labels2']]
    print(sig)
    sig_attack = {}
    for atk in attacks:
        # 시그니처
        filtered_sig = sig[sig['labels2'] == atk]
        sig_attack[atk] = filtered_sig.to_dict('records')

    # 2. bps
    # inf 값 nan으로 교체- inf값이 아니고 nan값 있을 때는 평균이나 중간값 처리.
    if np.isinf(data['Length']).any():
        data.loc[np.isinf(data['Length']), 'Length'] = np.nan
        # nan을 최댓값으로 교차
        max_value = data['Length'].max(skipna=True)
        data['Length'].fillna(max_value, inplace=True)

    # Group by 'Timestamp' and 'labels' columns and calculate the mean of 'Flow.Bytes/s' column
    bps = data.groupby(['Timestamp', 'labels2']).agg(
        {'Length': 'sum'}).reset_index()
    bps_pivot = pd.pivot(data=bps, index='Timestamp',
                         columns='labels2', values='Length').fillna(0)
    bps_pivot = bps_pivot.reset_index().rename_axis(None, axis=1).to_dict('records')

    # 3. pps
    # inf 값 nan으로 교체
    pps = data.groupby(['Timestamp', 'labels2']).size().reset_index(name="pps")
    pps_pivot = pd.pivot(data=pps, index='Timestamp',
                         columns='labels2', values='pps').fillna(0)
    pps_pivot = pps_pivot.reset_index().rename_axis(None, axis=1).to_dict('records')

    # 4. iat : 패킷 도착 시간 간격
    if (data['IAT'] < 0).any():  # 음수 값이 나올 시 0으로 대체
        data.loc[(data['IAT'] < 0), ['IAT']] = 0
    elif np.isinf(data['IAT']).any():  # inf값이 나올 경우 최댓값으로 대체
        data.loc[np.isinf(data['IAT']), ['IAT']] = np.nan
        data['IAT'].fillna(data['IAT'].max(), inplace=True)

    iat = data.groupby(['Timestamp', 'labels2'])['IAT'].mean().reset_index()
    iat_pivot = pd.pivot(data=iat, index='Timestamp',
                         columns='labels2', values='IAT').fillna(0)
    iat_pivot = iat_pivot.reset_index().rename_axis(None, axis=1).to_dict('records')

    # iat 분석값
    iat_mean = format(round(iat['IAT'].mean(), 1), ',')
    iat_std = format(round(iat['IAT'].std(), 1), ',')
    iat_min = format(round(iat['IAT'].min(), 1), ',')
    iat_max = format(round(iat['IAT'].max(), 1), ',')
    iat_maxtime = iat.loc[iat['IAT'].idxmax(), ['Timestamp']]['Timestamp']
    iat_aly = pd.DataFrame({
        'name': ['mean', 'std', 'max', 'min', 'maxtime'],
        'value': [iat_mean, iat_std, iat_max, iat_min, iat_maxtime]
    })
    iat_aly = iat_aly.to_dict('records')

    # 5.qps
    # dns count
    data['dns'] = np.where((data['Protocol'] == 17) & (
        (data['Source_Port'] == 53) | (data['Destination_Port'] == 53)), 1, 0)
    qps = data.groupby(["Timestamp", "labels2"]).agg(
        Qps=("dns", "sum")).reset_index()
    qps_pivot = pd.pivot(data=qps, index='Timestamp',
                         columns='labels2', values='Qps').fillna(0)
    qps_pivot = qps_pivot.reset_index().rename_axis(None, axis=1).to_dict('records')

    # round(data[['Max_Packet_Length']].max()['Max_Packet_Length'], 1)

    # 6. rps
    # http & https count
    data["https"] = np.where((data["Protocol"] == 6) & ((data["Source_Port"] == 443) | (
        data["Destination_Port"] == 443) | (data["Source_Port"] == 80) | (data["Destination_Port"] == 80)), 1, 0)
    rps = data.groupby(["Timestamp", "labels2"]).agg(
        Rps=("https", "sum")).reset_index()
    # rps_max = str(rps['Rps'].max())
    rps_pivot = pd.pivot(data=rps, index='Timestamp',
                         columns='labels2', values='Rps').fillna(0)
    rps_pivot = rps_pivot.reset_index().rename_axis(None, axis=1).to_dict('records')

    # 6. 프로토콜 빈도
    scrpro = data.groupby(['Protocol2', 'Source_Port'], as_index=False).agg(
        n=('Protocol2', 'count')).sort_values(by='n', ascending=False).head(10).reset_index(drop=True).to_dict('records')

    dstpro = data.groupby(['Protocol2', 'Destination_Port'], as_index=False).agg(
        n=('Protocol2', 'count')).sort_values(by='n', ascending=False).head(10).reset_index(drop=True).to_dict('records')

    # protocol frequency (프로토콜별 ratio)
    pro_ratio = data.groupby('Protocol2', as_index=True).agg(
        n=('Protocol2', 'count')).sort_values(by='n', ascending=False).reset_index()
    pro_ratio['ratio'] = round(pro_ratio['n']/pro_ratio['n'].sum()*100, 2)

    max_pro = pro_ratio.loc[pro_ratio['ratio'].idxmax(), [
        'Protocol2']]['Protocol2']
    pro_max_ratio = pro_ratio['ratio'].max()

    pro_max = pd.DataFrame({
        'name': ['pro', 'ratio'],
        'value': [max_pro, pro_max_ratio]
    })
    pro_max = pro_max.to_dict('records')

    # 7. 패킷길이 빈도
    pal = data.groupby('Length').size().reset_index(
        name='Count').sort_values('Count', ascending=False)

    pal['N_Range'] = pd.cut(pal['Length'], bins=[0, 10, 100, 1000, 10000], labels=[  # 수정
                            '0~10', '11~99', '101~999', '1000~1500'], include_lowest=True)
    palnew = pal.groupby('N_Range').agg(
        n=("Count", "sum")).reset_index()

    palmax_len = str(palnew.loc[palnew['n'].idxmax(), ['N_Range']]['N_Range'])
    palmax_cnt = format(palnew.max()["n"], ',')
    palnew = palnew.to_dict('records')

    # 9. flag count
    # RST_ACK 확인하는 열 추가
    data['RST_ACK_Count'] = np.where(
        (data['RST_Flag_Count'] == 1) & (data['ACK_Flag_Count'] == 1), 1, 0)

    # 시간별 flag 데이터 프레임
    flag = data.groupby('Timestamp').agg(
        FIN_Flag=('FIN_Flag_Count', 'sum'),
        SYN_Flag=('SYN_Flag_Count', 'sum'),
        RST_Flag=('RST_Flag_Count', 'sum'),
        PSH_Flag=('PSH_Flag_Count', 'sum'),
        ACK_Flag=('ACK_Flag_Count', 'sum'),
        URG_Flag=('URG_Flag_Count', 'sum'),
        CWE_Flag=('CWE_Flag_Count', 'sum'),
        ECE_Flag=('ECE_Flag_Count', 'sum'),
        SYN_ACK=('SYN_ACK_Count', 'sum'),
        RST_ACK=('RST_ACK_Count', 'sum')
    ).reset_index()
    flag_cnt = flag.to_dict('records')

    # flag mean per time
    flag = flag.assign(t_sum=flag.iloc[:, 1:].sum(axis=1))
    flag_mean = format(round(flag[['t_sum']].mean()['t_sum'], 1), ',')

    # flag ratio
    col_sum = flag.drop(["Timestamp", "t_sum"],
                        axis=1).sum().to_frame().reset_index()
    col_sum.columns = ["flag", "sum"]
    col_sum['ratio'] = round(col_sum['sum']/col_sum['sum'].sum() * 100, 3)
    flag_total = format(col_sum['sum'].sum(), ',')  # sum 합계

    flag_min = col_sum.loc[col_sum['ratio'].idxmin(), 'flag']
    flag_max = col_sum.loc[col_sum['ratio'].idxmax(), 'flag']

    flag_aly = pd.DataFrame({
        'name': ['total', 'mean', 'min', 'max'],
        'value': [flag_total, flag_mean, flag_min, flag_max]
    })
    flag_aly = flag_aly.to_dict('records')
    flag_ratio = col_sum.to_dict('records')

    # 10. 네트워크망
    network = data.groupby(['Source_IP', 'Destination_IP']).size(
    ).reset_index(name='Frequency').to_dict('records')

    # Source_IP 별 count
    source_count = data.groupby('Source_IP').size().reset_index(name='count')

    # Destination_IP 별 count
    destination_count = data.groupby(
        'Destination_IP').size().reset_index(name='count')

    # 유니크한 IP와 count 값을 하나의 데이터프레임으로 합치기
    net_node = pd.concat([
        source_count.rename(columns={'Source_IP': 'IP'}),
        destination_count.rename(columns={'Destination_IP': 'IP'})
    ]).groupby('IP')['count'].sum().reset_index()
    net_node = net_node.to_dict('records')

    # 11. 정상 / 비정상 비율
    data['attack'] = ['normal' if x == 0 else 'attack' for x in data['labels']]
    df2 = pd.DataFrame({'attack': ["attack", "normal"]})
    # data에서 attack이 'attack' 또는 'normal'인 행만 추출하여 group_data 생성
    group_data = data.groupby('attack').agg(
        count=('labels', 'count')).reset_index()
    # df2에서 attack 열과 group_data에서 count 열만 추출하여 merge
    df2 = pd.merge(df2[['attack']], group_data[[
                   'attack', 'count']], on='attack', how="left").fillna(0)
    df2[['count']] = df2[['count']].astype(int)
    df2['ratio'] = round(df2['count'] / df2['count'].sum()*100, 1)
    df2 = df2.to_dict('records')

    # + Total Traffic Length Analysis, 이걸 그냥 total.length기준으로 하는 것도 나쁘지 않을듯
    # mean
    won_mean = format(data[['Length']].mean()['Length'].round(2), ',')
    # std
    won_std = format(data[['Length']].std()['Length'].round(2), ',')
    # min
    won_min = format(data[['Length']].min()['Length'].round(2), ',')
    # max
    won_max = format(data[['Length']].max()['Length'].round(2), ',')

    won_aly = pd.DataFrame({
        'name': ['mean', 'std', 'max', 'min'],
        'value': [won_mean, won_std, won_max, won_min]
    })
    won_aly = won_aly.to_dict('records')

    # 12. 트래픽 수 (전체, 공격유형별 등)
    attack_count = data.groupby('labels2').agg(
        count=('labels2', 'count')).reset_index()
    # ratio 구하기
    attack_count['ratio'] = round(
        attack_count['count'] / data.shape[0] * 100, 3)
    total_count = format(data.shape[0], ',')

    # Normal 삭제
    attack_count = attack_count[attack_count['labels2'] != 'Normal']
    attack_count['count'] = attack_count['count'].apply(
        lambda x: format(x, ','))  # 반점 처리
    attack_count = attack_count.to_dict('records')

    # 프로토콜 빈도
    protocol_count = data.groupby("Protocol").agg(
        count=('Protocol', 'count')).reset_index()
    protocol_count['count'] = protocol_count['count'].apply(
        lambda x: format(x, ','))
    protocol_count = protocol_count.to_dict('records')

    # 13. conversation + 통계
    con = data.groupby(['labels2', 'Source_IP', 'Destination_IP']).agg(sum=('Length', 'sum'), mean=(
        'Length', 'mean'), min=('Length', 'min'), max=('Length', 'max'), count=('Source_IP', 'count')).apply(lambda x: round(x, 2)).reset_index()
    total_length = con['sum'].sum()
    con['mean'] = con['mean'].round(2)
    con['ratio'] = (con['sum'] / total_length * 100).round(2)
    con = con.sort_values('sum', ascending=False).head(
        10).reset_index(drop=True)
    con[['sum', 'mean', 'max', 'count']] = con[['sum', 'mean',
                                                'max', 'count']].applymap(lambda x: format(x, ','))
    con = con.to_dict('records')

    # max 값
    bps_max = format(bps[['Length']].max()['Length'], ',')
    bps_maxtime = bps.loc[bps['Length'].idxmax(), 'Timestamp']

    pps_max = format(pps[['pps']].max()['pps'], ',')
    pps_maxtime = pps.loc[pps['pps'].idxmax(), 'Timestamp']

    qps_max = format(qps['Qps'].max(), ',')
    qps_maxtime = qps.loc[qps['Qps'].idxmax(), 'Timestamp']

    rps_max = format(rps['Rps'].max(), ',')
    rps_maxtime = rps.loc[rps['Rps'].idxmax(), 'Timestamp']

    max_aly = pd.DataFrame({
        'name': ['bps', 'pps', 'qps', 'rps'],
        'max_value': [bps_max, pps_max, qps_max, rps_max],
        'time': [bps_maxtime, pps_maxtime, qps_maxtime, rps_maxtime]
    })
    max_aly = max_aly.to_dict('records')

    # attack 별 aly
    # 공격 시작, 마감 타임
    new_df = pd.DataFrame(
        columns=['labels2', 'FirstTimestamp', 'LastTimestamp'])

    # 각 labels2 값별로 첫 번째 시간값 저장
    for label in attacks:
        filtered_row = data.loc[data['labels2'] == label, 'Timestamp'].iloc[0]
        filtered_row2 = data.loc[data['labels2']
                                 == label, 'Timestamp'].iloc[-1]
        new_df = pd.concat([new_df, pd.DataFrame({'labels2': [
                           label], 'FirstTimestamp': filtered_row, 'LastTimestamp': filtered_row2})], ignore_index=True)
    new_df = new_df[new_df['labels2'] != 'Normal']
    attk_only = new_df['labels2'].unique()
    new_df = new_df.to_dict('records')

    attack_aly = {}
    attack_max_aly = {}
    for atk in attk_only:
        # 시그니처
        filtered_df = data[data['labels2'] == atk]
        grouped_df = filtered_df.groupby(['Timestamp', 'labels2', 'Source_IP', 'Destination_IP']).agg(
            sum=('Length', 'sum'),
            mean=('Length', 'mean'),
            min=('Length', 'min'),
            max=('Length', 'max')
        ).apply(lambda x: round(x, 2)).sort_values(by='sum', ascending=False).reset_index()
        grouped_df[['sum', 'mean', 'min', 'max']] = grouped_df[[
            'sum', 'mean', 'min', 'max']].applymap(lambda x: format(x, ','))
        # grouped_df = grouped_df.iloc[0:10, :]

        mb = bps.loc[bps['labels2'] == atk].max()['Length']
        mp = pps.loc[pps['labels2'] == atk].max()['pps']
        mq = qps.loc[qps['labels2'] == atk].max()['Qps']
        mr = rps.loc[rps['labels2'] == atk].max()['Rps']
        attk_max = pd.DataFrame({
            'name': ['bps', 'pps', 'qps', 'rps'],
            'value': [mb, mp, mq, mr]
        })

        attack_aly[atk] = grouped_df.to_dict('records')
        attack_max_aly[atk] = attk_max.to_dict('records')

    # 데이터 변환
    data = {
        # 'attacks': attacks.tolist(),    # 공격 유형
        'attack_time': new_df,
        'attack_aly': attack_aly,
        'attack_max_aly': attack_max_aly,
        'sig_attack': sig_attack,       # 시그니처 공격별 분류
        'bps_attack': bps_pivot,        # bps
        'pps_attack': pps_pivot,        # pps
        'iat_attack': iat_pivot,        # 패킷 도착지연시간
        'iat_aly': iat_aly,             # iat 통계
        'qps_attack': qps_pivot,
        'rps_attack': rps_pivot,
        'max_aly': max_aly,
        'scrpro': scrpro,               # 프로토콜 빈도
        'dstpro': dstpro,                # 프로토콜 빈도
        'pro_max': pro_max,
        'pal': palnew,
        'palmax_len': palmax_len,
        'palmax_cnt': palmax_cnt,
        'flag': flag_cnt,
        'flag_ratio': flag_ratio,
        'flag_aly': flag_aly,
        'net': network,
        'net_node': net_node,
        'won': df2,
        'won_aly': won_aly,
        'total_cnt': total_count,
        'attack_cnt': attack_count,
        'protocol_cnt': protocol_count,
        'con': con                         # conversation
    }

    return JsonResponse(data, content_type='application/json')
