# -*- coding: utf-8 -*-
"""
Created on Fri May  5 22:08:43 2023

@author: rladb
"""

from scapy.all import *
import csv
import time
from datetime import datetime, timezone, timedelta

# CSV 파일 열기
filename = "network_traffic2.csv"
with open(filename, 'w', newline='') as csvfile:
    fieldnames = ['Source IP', 'Destination IP', 'Protocol', 'Source Port', 'Destination Port', 'Timestamp',
                  'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count', 'PSH Flag Count', 'ACK Flag Count',
                  'URG Flag Count', 'CWE Flag Count', 'ECE Flag Count', 'SYN_ACK_Count', 'Length', 'IAT']

    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    # Create the pcap file
    pcap_filename = "traffic_capture2.pcap"
    pcap_writer = PcapWriter(pcap_filename, append=True)

    def packet_callback(packet):
        try:
            source_ip = packet.payload.src
            dest_ip = packet.payload.dst

            protocol = packet.payload.proto
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

            if packet.haslayer(TCP):
                flags = packet.payload.flags | packet[TCP].flags
                FIN_count += (flags & 0x01) >> 0
                SYN_count += (flags & 0x02) >> 1
                RST_count += (flags & 0x04) >> 2
                PSH_count += (flags & 0x08) >> 3
                ACK_count += (flags & 0x10) >> 4
                SYN_ACK_count += (flags & 0x12) == 0x12
                URG_count += (flags & 0x20) >> 5
                CWE_count += (flags & 0x40) >> 6
                ECE_count += (flags & 0x80) >> 7

            elif packet.haslayer(UDP):
                flags = packet.payload.flags
                FIN_count += (flags & 0x01) >> 0
                SYN_count += (flags & 0x02) >> 1
                RST_count += (flags & 0x04) >> 2
                PSH_count += (flags & 0x08) >> 3
                ACK_count += (flags & 0x10) >> 4
                SYN_ACK_count += (flags & 0x12) == 0x12
                URG_count += (flags & 0x20) >> 5
                CWE_count += (flags & 0x40) >> 6
                ECE_count += (flags & 0x80) >> 7

            else:
                FIN_count = 0
                SYN_count = 0
                RST_count = 0
                PSH_count = 0
                ACK_count = 0
                SYN_ACK_count = 0
                URG_count = 0
                CWE_count = 0
                ECE_count = 0

            # Flow Duration 계산
            current_time = time.time()
            if flow in flow_duration_dict:
                flow_duration = int(
                    (current_time - flow_duration_dict[flow]) * 1000)
                timestamp = datetime.now(
                    timezone(timedelta(hours=9))).strftime("%Y-%m-%d %H:%M:%S")
                # print(f"{flow} : {flow_duration}, Timestamp: {timestamp}")

                # Flow Bytes/s 계산
                # flow_bytes = packet.payload.len
                flow_bytes = packet.len
                flow_bytes_per_second = round(
                    flow_bytes / flow_duration) if flow_duration != 0 else 0

                # IAT 계산
                if flow in last_packet_dict:
                    iat = current_time - last_packet_dict[flow]
                else:
                    iat = 0

                # Total Length 계산
                # total_length = len(packet.payload)
                print(f"{flow} :{flow_bytes}")
                # Write packet to pcap file
                pcap_writer.write(packet)
                # CSV 파일에 쓰기
                writer.writerow({'Source IP': source_ip, 'Destination IP': dest_ip, 'Protocol': protocol, 'Source Port': source_port,
                                 'Destination Port': dest_port, 'Timestamp': timestamp,
                                 'FIN Flag Count': FIN_count, 'SYN Flag Count': SYN_count, 'RST Flag Count': RST_count,
                                 'PSH Flag Count': PSH_count, 'ACK Flag Count': ACK_count, 'URG Flag Count': URG_count, 'SYN_ACK_Count': SYN_ACK_count,
                                 'CWE Flag Count': CWE_count, 'ECE Flag Count': ECE_count, 'Length': flow_bytes,
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
    capture_time = 300  # 캡처할 시간(초)
    while True:
        sniff(prn=packet_callback, timeout=1)
        # wrpcap('traffic_capture2.pcap', packets)
        if time.time() - start_time >= capture_time:
            break
    # Close the pcap writer
    pcap_writer.close()
