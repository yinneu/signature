# -*- coding: utf-8 -*-
"""
Created on Sun Apr  9 16:58:02 2023

@author: rladb

"""

from scapy.all import *
import csv
import time
from datetime import datetime, timezone, timedelta

# CSV 파일 열기
filename = "network_traffic.csv"
with open(filename, 'w', newline='') as csvfile:
    fieldnames = ['Source IP', 'Destination IP', 'Protocol', 'Source Port', 'Destination Port', 'Flow Duration', 'Timestamp',
                  'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count', 'PSH Flag Count', 'ACK Flag Count',
                  'URG Flag Count', 'CWE Flag Count', 'ECE Flag Count', 'SYN_ACK_Count', 'Total Length', 'Flow Bytes/s',
                  'Flow Packets/s', 'Fwd Packets/s', 'Min Packet Length', 'Max Packet Length',
                  'Packet Length Mean', 'Packet Length Std', 'Packet Length Variance', 'IAT']

    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    def packet_callback(packet):
        try:
            source_ip = packet.payload.src
            dest_ip = packet.payload.dst

            # ip = packet.payload
            protocol = packet.payload.proto
            # print("protocol : ",protocol)

            source_port = packet.payload.sport
            dest_port = packet.payload.dport

            flow = (source_ip, dest_ip, protocol, source_port, dest_port)

            FIN_count = 0
            SYN_count = 0
            RST_count = 0
            PSH_count = 0
            ACK_count = 0
            URG_count = 0
            CWE_count = 0
            ECE_count = 0
            SYN_ACK_count = 0  # SYN 비트와 ACK 비트가 모두 설정되어 있는지 확인 후 카운트 증가

            # TCP Flags Count 계산
            flags = packet.payload.flags
            FIN_count += (flags & 0x01) >> 0  # FIN 비트가 설정되어 있는지 확인 후 카운트 증가
            SYN_count += (flags & 0x02) >> 1  # SYN 비트가 설정되어 있는지 확인 후 카운트 증가
            RST_count += (flags & 0x04) >> 2  # RST 비트가 설정되어 있는지 확인 후 카운트 증가
            PSH_count += (flags & 0x08) >> 3  # PSH 비트가 설정되어 있는지 확인 후 카운트 증가
            ACK_count += (flags & 0x10) >> 4  # ACK 비트가 설정되어 있는지 확인 후 카운트 증가
            # SYN 비트와 ACK 비트가 모두 설정되어 있는지 확인 후 카운트 증가
            SYN_ACK_count += (flags & 0x12) == 0x12
            URG_count += (flags & 0x20) >> 5  # URG 비트가 설정되어 있는지 확인 후 카운트 증가
            CWE_count += (flags & 0x40) >> 6  # CWE 비트가 설정되어 있는지 확인 후 카운트 증가
            ECE_count += (flags & 0x80) >> 7  # ECE 비트가 설정되어 있는지 확인 후 카운트 증가

            # Flow Duration 계산
            current_time = time.time()
            if flow in flow_duration_dict:
                flow_duration = int(
                    (current_time - flow_duration_dict[flow]) * 1000)
                timestamp = datetime.now(
                    timezone(timedelta(hours=9))).strftime("%Y-%m-%d %H:%M:%S")
                print(f"{flow}: {flow_duration}, Timestamp: {timestamp}")

                # Flow Bytes/s 계산
                flow_bytes = packet.payload.len
                flow_bytes_per_second = flow_bytes / flow_duration if flow_duration != 0 else 0

                # Flow Packets/s, Fwd Packets/s 계산
                flow_packets_per_second = 1 / flow_duration if flow_duration != 0 else 0
                fwd_packets_per_second = 1 / \
                    flow_duration if flow_duration != 0 and packet.payload.src == flow[0] else 0

                # Packet Length 관련 계산
                packet_lengths = [len(p) for p in packet.payload]
                min_packet_length = min(
                    packet_lengths) if packet_lengths else 0
                max_packet_length = max(
                    packet_lengths) if packet_lengths else 0
                packet_length_mean = sum(
                    packet_lengths) / len(packet_lengths) if packet_lengths else 0
                packet_length_std = (sum([(x - packet_length_mean) ** 2 for x in packet_lengths]) / len(
                    packet_lengths)) ** 0.5 if packet_lengths else 0
                packet_length_variance = packet_length_std ** 2

                # IAT 계산
                if flow in last_packet_dict:
                    iat = current_time - last_packet_dict[flow]
                else:
                    iat = 0

                # Total Length 계산
                total_length = packet.payload.len
                if packet.payload:
                    total_length += len(packet.payload)

                # CSV 파일에 쓰기
                writer.writerow({'Source IP': source_ip, 'Destination IP': dest_ip, 'Protocol': protocol, 'Source Port': source_port,
                                 'Destination Port': dest_port, 'Flow Duration': flow_duration, 'Timestamp': timestamp,
                                 'FIN Flag Count': FIN_count, 'SYN Flag Count': SYN_count, 'RST Flag Count': RST_count,
                                 'PSH Flag Count': PSH_count, 'ACK Flag Count': ACK_count, 'URG Flag Count': URG_count, 'SYN_ACK_Count': SYN_ACK_count,
                                 'CWE Flag Count': CWE_count, 'ECE Flag Count': ECE_count, 'Total Length': total_length,
                                 'Flow Bytes/s': flow_bytes_per_second, 'Flow Packets/s': flow_packets_per_second,
                                 'Fwd Packets/s': fwd_packets_per_second, 'Min Packet Length': min_packet_length,
                                 'Max Packet Length': max_packet_length, 'Packet Length Mean': packet_length_mean,
                                 'Packet Length Std': packet_length_std, 'Packet Length Variance': packet_length_variance,
                                 'IAT': iat})

                del flow_duration_dict[flow]
            else:
                flow_duration_dict[flow] = current_time
                last_packet_dict[flow] = current_time
                last_packet_length_dict[flow] = len(packet)
                last_packet_time_dict[flow] = current_time

        except:
            pass

    # 실시간 캡처 시작
    flow_duration_dict = {}
    last_packet_dict = {}
    last_packet_length_dict = {}
    last_packet_time_dict = {}
    start_time = time.time()
    capture_time = 600  # 캡처할 시간(초)
    while True:
        sniff(prn=packet_callback, timeout=1)
        if time.time() - start_time >= capture_time:
            break
