import pandas as pd
import numpy as np
from datetime import datetime


# import table
# from dashboard.models import time_use, signature, length_frequency, tel_network, flag_count


# 1. TimeStemp 사용하는 그래프 데이터 전처리
def TimeTable(data):

    # Bps
    # inf 값 nan으로 교체
    data.loc[np.isinf(data['Flow Bytes/s']), 'Flow Bytes/s'] = np.nan
    # nan을 최댓값으로 교차
    max_value = data['Flow Bytes/s'].max(skipna=True)
    data['Flow Bytes/s'].fillna(max_value, inplace=True)
    # Group by 'Timestamp' and 'labels' columns and calculate the mean of 'Flow.Bytes/s' column
    Bps = data.groupby(['Timestamp', 'labels']).agg(
        {'Flow Bytes/s': 'mean'}).reset_index()

    # pps
    # inf 값 nan으로 교체
    data.loc[np.isinf(data['Flow Packets/s']), 'Flow Packets/s'] = np.nan
    # nan을 최댓값으로 교차
    max_value = data['Flow Packets/s'].max(skipna=True)
    data['Flow Packets/s'].fillna(max_value, inplace=True)
    # Group by 'Timestamp' and 'labels' columns and calculate the mean of 'Flow Packets/s' column
    pps = data.groupby(['Timestamp', 'labels']).agg(
        {'Flow Packets/s': 'mean'}).reset_index()

    # iat
    IAT = data.groupby(['Timestamp', 'labels'])['IAT'].mean().reset_index()

    # qrps dataframe
    qrps = pd.DataFrame({"Timestamp": data["Timestamp"],
                        "labels": data["labels"],
                         "Protocol": data["Protocol"],
                         "Source Port": data["Source Port"],
                         "Destination Port": data["Destination Port"]})
    # dns count
    qrps['dns'] = np.where((data['Protocol'] == 17) & (
        (data['Source Port'] == 53) | (data['Destination Port'] == 53)), 1, 0)
    # 최종 데이터 프레임
    qps = qrps.groupby(["Timestamp", "labels"]).agg(
        Qps=("dns", "sum")).reset_index()

    # http & https count
    qrps["https"] = np.where((data["Protocol"] == 6) & ((data["Source Port"] == 443) | (
        data["Destination Port"] == 443) | (data["Source Port"] == 80) | (data["Destination Port"] == 80)), 1, 0)
    # 최종 데이터 프레임
    rps = qrps.groupby(["Timestamp", "labels"]).agg(
        Rps=("https", "sum")).reset_index()

    Times = pd.concat([IAT, Bps['Flow Bytes/s'],
                      pps['Flow Packets/s'], qps[['Qps']], rps[['Rps']]], axis=1)

    print(Times)

    return 0


# 2.  시그니처 => 이상탐지 버전 추가할 예정
def SigTable(data):

    sig = data[['Source IP', 'Destination IP',
                'Destination Port', 'Total Length', 'labels']]
    for i in range(0, len(sig), 1):
        row = sig.iloc[i]
        signature.objects.create(
            Source_IP=row[0],
            Destination_IP=row[1],
            Destination_Port=row[2],
            Total_Length=row[3],
            Labels=row[4]
        )

    return 0


# 3. 네트워크 망
def NetworkTable(data):
    network = data.groupby(["Source IP", "Destination IP"]
                           ).size().reset_index(name='Frequency')

    for i in range(0, len(network), 1):
        row = network.iloc[i]
        tel_network.objects.create(
            Source_IP=row[0],
            Destination_IP=row[1],
            Frequency=row[2]
        )
    return 0


# 4. flag count
def FlagTable(data):
    # flag 용 데이터 프레임 생성
    forflag = pd.DataFrame({
        'Timestamp': data['Timestamp'],
        'FIN.Flag': data['FIN Flag Count'],
        'SYN.Flag': data['SYN Flag Count'],
        'RST.Flag': data['RST Flag Count'],
        'PSH.Flag': data['PSH Flag Count'],
        'ACK.Flag': data['ACK Flag Count'],
        'URG.Flag': data['URG Flag Count'],
        'CWE.Flag': data['CWE Flag Count'],
        'ECE.Flag': data['ECE Flag Count'],
        'SYN_ACK': data['SYN_ACK_Count']
    })

    # RST_ACK 확인하는 열 추가
    forflag['RST_ACK'] = np.where(
        (forflag['RST.Flag'] == 1) & (forflag['ACK.Flag'] == 1), 1, 0)

    # 시간별 flag 데이터 프레임
    flag = forflag.groupby('Timestamp').agg(
        FIN_Flag_n=('FIN.Flag', 'sum'),
        SYN_Flag_n=('SYN.Flag', 'sum'),
        RST_Flag_n=('RST.Flag', 'sum'),
        PSH_Flag_n=('PSH.Flag', 'sum'),
        ACK_Flag_n=('ACK.Flag', 'sum'),
        URG_Flag_n=('URG.Flag', 'sum'),
        CWE_Flag_n=('CWE.Flag', 'sum'),
        ECE_Flag_n=('ECE.Flag', 'sum'),
        SYN_ACK_n=('SYN_ACK', 'sum'),
        RST_ACK_n=('RST_ACK', 'sum')
    ).reset_index()

    for i in range(0, len(flag), 1):
        row = flag.iloc[i]
        flag_count.objects.create(
            Datetime=datetime.strptime(row[0], '%Y-%m-%d %H:%M:%S'),
            FIN_Flag_n=row[1],
            SYN_Flag_n=row[2],
            RST_Flag_n=row[3],
            PSH_Flag_n=row[4],
            ACK_Flag_n=row[5],
            URG_Flag_n=row[6],
            CWE_Flag_n=row[7],
            ECE_Flag_n=row[8],
            SYN_ACK_n=row[9],
            RST_ACK_n=row[10],
        )

    return 0


# 5번 패킷 길이 빈도
def PacketTable(data):
    pal = data.groupby('Total Length').agg(
        count=('Total Length', 'size')).reset_index()
    pal.sort_values('count', ascending=False).head(10).reset_index(drop=True)

    pal = data.groupby('Total Length').size().reset_index(
        name='Count').sort_values('Count', ascending=False)
    pal['N_Range'] = pd.cut(pal['Total Length'], bins=[0, 10, 100, 1000, 10000, np.inf], labels=[
                            '0~10', '11~99', '101~999', '1000~9999', '10000~'], include_lowest=True)
    pal = pal.reset_index(drop=True)

    for i in range(0, len(pal), 1):
        row = pal.iloc[i]
        length_frequency.objects.create(
            Total_Length=row[0],
            Count=row[1],
            N_Range=row[2],

        )

    return 0
