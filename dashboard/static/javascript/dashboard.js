"use strict"


let bps = echarts.init(document.getElementById('graph_bps'), 'dark');
let pps = echarts.init(document.getElementById('graph_pps'), 'dark');
let iat = echarts.init(document.getElementById('graph_iat'), 'dark');
let sig = echarts.init(document.getElementById('graph_sig'), 'dark');
let qps = echarts.init(document.getElementById('graph_qps'), 'dark');
let rps = echarts.init(document.getElementById('graph_rps'), 'dark');
let scrpro = echarts.init(document.getElementById('graph_scrpro'), 'dark');
let dstpro = echarts.init(document.getElementById('graph_dstpro'), 'dark');
let pal = echarts.init(document.getElementById('graph_pal'), 'dark');
let flag = echarts.init(document.getElementById('graph_flag'), 'dark');
let net = echarts.init(document.getElementById('graph_net'), 'dark');
let won = echarts.init(document.getElementById('graph_won'), 'dark');


//series를 담을 리스트
let sig_series = [];
let bps_series = [];
let pps_series = [];
let iat_series = [];
let qps_series = [];
let rps_series = [];
let scrpro_series = [];
let dstpro_series = [];


// 색 랜덤 지정
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return "#"+(parseInt(Math.random()*0xffffff)).toString(16);
}

// 공격유형별 색상이 다르게
const colorlt = {
  'DDoS': '#E06280',
  'DoS Slowhttptest': '#32C5E9',
  'DoS slowloris': '#67E0E3',
  'DoS Hulk': '#9FE6B8',
  'DoS GoldenEye': '#FFDB5C',
  'PortScan': '#FF9F7F',
  'Heartbleed': '#FB7293',
  'Botnet': '#E062AE',
  'Infiltration': '#E690D1',
  'ICMP flooding': '#E7BCF3',
  'FTP-Patator': '#9D96F5',
  'SSH-Patator': '#8378EA',
  'QPS': '#96BFFF',
  'ICMP': '#F5C3CB',
  'UDP': '#FADEA5',
  'TCP': '#A5FAD2',
  'signature': '#4CA6FF'
};


$.ajax({
    url: '/dashboard/get_data/',
    type: 'GET',
    dataType: 'json',
    beforeSend: function() {
      // Ajax 요청 시작 전에 로딩 화면을 보여줌
      $('#loading_sc').show();
    },
    success: function(data) {

      console.log(data);

      // 공격 데이터 시리즈 리스트 (딕셔너리)
      let attacks = Object.keys(data.sig_attack);
      let attlen = attacks.length;
      // 시간
      let time = data.bps_attack.map(function(item) { return item.Timestamp; })


      //전체 트래픽 값
      const total_cut =  document.getElementById("total_cnt");
      total_cut.innerHTML = data.total_cnt;

      //normal
      const normal =  document.getElementById("normal");
      normal.innerHTML = data.won[1].count.toLocaleString();;    // 정상데이터 수
      
      //aormal
      const anormal =  document.getElementById("anormal");
      anormal.innerHTML = data.won[0].count.toLocaleString();;  // 이상데이터 수
      

      //aormal ratio
      const anormal_ratio =  document.getElementById("anormal_ratio");
      anormal_ratio.innerHTML = data.won[0].ratio + " % "; // 이상데이터 비율

      //분석일
      const aly_date =  document.getElementById("aly_date");
      let currentDate = new Date();
      let year = currentDate.getFullYear();
      let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      let day = currentDate.getDate().toString().padStart(2, '0');
      let hours = currentDate.getHours().toString().padStart(2, '0');
      let minutes = currentDate.getMinutes().toString().padStart(2, '0');
      let seconds = currentDate.getSeconds().toString().padStart(2, '0');
      let currentDateTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
      aly_date.innerHTML = currentDateTime;




      // 공격유형에 따라 분류된 데이터들 받아오기
      for (let i = 0; i < attlen; i++) {
          // 공격유형
          let atk = attacks[i];
          // let atkcol = '#4CA6FF';
          let atkcol = 'white';

          // 공격유형별색
          if (atk != "Normal") {
            atkcol = colorlt[atk];
          }
          

          // 시그니처
          if (atk == "Normal") {
            atkcol = '#4CA6FF';
          }
          let sig_data = data.sig_attack[atk].map(function(item) {
              return [item.Source_IP, item.Destination_IP, item.Destination_Port, item.Length];
          });
          let sig_serie = {
              name: atk,
              type: 'parallel',
              // lineStyle: lineStyle,
              lineStyle : {
                color: atkcol
              },
              data: sig_data
          };
          sig_series.push(sig_serie);


          //bps
          if (atk == "Normal") {
            atkcol = 'rgb(255, 70, 131)';
          }
          let bps_data = data.bps_attack.map(function(item) { return item[atk]; })
          let bps_serie = {
              name: atk,
              type: 'line',
              symbol: 'none',
              sampling: 'lttb',
              itemStyle: {
                color: 'rgb(255, 70, 131)'
                // color: atkcol
                // color: '#00C20D'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                    // color: '#00AD26'
                  },
                  {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                    // color: '#00C20D'
                  }
                ])
              },
              data: bps_data  //세로 데이터
            }            
          bps_series.push(bps_serie);

          //pps
          if (atk == "Normal") {
            atkcol = '#00C20D';
          }
          let pps_data = data.pps_attack.map(function(item) { return item[atk]; })
          let pps_serie = {
              name: atk,
              type: 'line',
              symbol: 'none',
              sampling: 'lttb',
              itemStyle: {
                //겉 라인 색상
                // color: 'rgb(255, 70, 131)'
                color: '#00C20D' 
                // color: atkcol
              },
              areaStyle: {
                // 내부영역 색상
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    // color: 'rgb(255, 158, 68)'
                    color: '#00AD26'
                  },
                  {
                    offset: 1,
                    // color: 'rgb(255, 70, 131)'
                    color: '#00C20D'
                  }
                ])
              },
              data: pps_data  //세로 데이터
          }
          pps_series.push(pps_serie);


          // iat
          let iat_data = data.iat_attack.map(function(item) { return item[atk]; })
          let iat_serie = {
            name: atk,
            type: 'line',
            symbol: 'none',
            sampling: 'lttb',
            itemStyle: {
              //겉 라인 색상
              // color: 'rgb(255, 70, 131)'
              // color: '#00C20D' 
              color : '#c835e3'
            },
            areaStyle: {
              // 내부영역 색상
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  // color: 'rgb(255, 158, 68)'
                  // color: '#00AD26'
                  color : '#c835e369'
                },
                {
                  offset: 1,
                  // color: 'rgb(255, 70, 131)'
                  // color: '#00C20D'
                  color : '#c835e3'
                }
              ])
            },
            data: iat_data  //세로 데이터
          }
          iat_series.push(iat_serie);


          //qps
          let qps_data = data.qps_attack.map(function(item) { return item[atk]; })
          let qps_serie = {
            name: atk,
            type: 'line',
            symbol: 'none',
            sampling: 'lttb',
            itemStyle: {
              //겉 라인 색상
              // color: 'rgb(255, 70, 131)'
              // color: '#00C20D' 
              color : '#238fff'
            },
            areaStyle: {
              // 내부영역 색상
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  // color: 'rgb(255, 158, 68)'
                  // color: '#00AD26'
                  color : '#238fff9e'
                },
                {
                  offset: 1,
                  // color: 'rgb(255, 70, 131)'
                  // color: '#00C20D'
                  color : '#238fff'
                }
              ])
            },
            data: qps_data  //세로 데이터
          }
          qps_series.push(qps_serie);


          //rps
          let rps_data = data.rps_attack.map(function(item) { return item[atk]; })
          let rps_serie = {
            name: atk,
            type: 'line',
            symbol: 'none',
            sampling: 'lttb',
            itemStyle: {
              //겉 라인 색상
              // color: 'rgb(255, 70, 131)'
              // color: '#00C20D' 
              color : '#d3bd21'
            },
            areaStyle: {
              // 내부영역 색상
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  // color: 'rgb(255, 158, 68)'
                  // color: '#00AD26'
                  color : '#d3bd218c'
                },
                {
                  offset: 1,
                  // color: 'rgb(255, 70, 131)'
                  // color: '#00C20D'
                  color : '#d3bd21'
                }
              ])
            },
            data: rps_data  //세로 데이터
          }
          rps_series.push(rps_serie);

      }


      // 범례 간격
      let legend_size = 12;

      // 공격유형 개수에 따른 그래프 간격조정
      let chart_grid = {
        left: 14,
        right: 13,
        top: 50,
        bottom: 75,
        containLabel: true
      };
      if(attlen > 3){
        chart_grid = {
          left: 18,
          right: 30,
          top: 50,
          bottom: 95,
          containLabel: true
        }
      } 
    


      ///// 그래프 옵션
      // 시그니처
      let schema = [
      //세로선
          { name: 'Source_IP', index: 0, text: 'Source IP' },
          { name: 'Destination_IP', index: 1, text: 'Destination IP' },
          { name: 'Destination_Port', index: 2, text: 'Destination Port' },
          { name: 'Length', index: 3, text: 'Length' }
      ];
      let lineStyle = {
          width: 1,
          opacity: 0.5
      };
      let sig_option = {
          backgroundColor: 'black', // 배경색
          legend: {
              //index (범례)
              bottom: 20,
              data: attacks,  //트래픽별
              itemGap: 26,    
              textStyle: {
                color: '#fff',
                fontSize: 14
              },
              bottom : 20
              // left: '40%'
          },
          tooltip: {
              backgroundColor: '#222',
              borderColor: '#777',
              borderWidth: 1,
              //수정하기
              //formatter: function(params) {
              // const node = params.data;
              // const nodeName = node.name;
              // const value = node.value;
              // const iconStyle = 'display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:#5ff0ffa8;';
              // return `<span style=${iconStyle}></span> Node <br>IP: <b>${nodeName}</b>   Value: <b>${value}</b>`;
              tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} {d} {e}'
              },
              textStyle: {
                color: 'lightgrey'
              }
          },
          parallelAxis: [
              {
                  dim: 0, //소스ip
                  name: schema[0].text,
                  axisLabel: {
                      //축을 투명으로 지정
                      textStyle: {
                          color: 'transparent'
                      }
                  },
                  type: 'category',
                  inverse: true,
                  nameLocation: 'start'
              },
              {
                  dim: 1, //도착ip
                  name: schema[1].text,
                  // axisLabel: {
                  //     //축을 투명으로 지정
                  //     textStyle: {
                  //         color: 'transparent'
                  //     }
                  // },
                  type: 'category'
                  // data: ['192.168.100.50']
              },
              {
                  dim: 2, //포트
                  name: schema[2].text,
                  min: 0,
                  max: 65535
                  // type: 'category'
                  //  data: ['ICMP']
              },
              {
                  dim: 3,
                  name: schema[3].text,
                  // type: 'category'
                  // data: ['1442']
              } //size
          ],
          parallel: {
              left: '5%',
              right: '18%',
              bottom: 100,
              parallelAxisDefault: {
                  type: 'value',
                  name: 'ALL',
                  nameLocation: 'end',
                  nameGap: 20,
                  nameTextStyle: {
                      color: '#fff',
                      fontSize: 12
                  },
                  axisLine: {
                      lineStyle: {
                          color: '#aaa'
                      }
                  },
                  axisTick: {
                      lineStyle: {
                          color: '#777'
                      }
                  },
                  splitLine: {
                      show: false
                  },
                  axisLabel: {
                      color: '#fff'
                      // padding: [10, 20, 10, 20]
                  }
              }
          },
          series: sig_series
      };
      

      // bps
      let bps_option = {
          backgroundColor: 'black',
          legend: {
            //index (범례)
            bottom: 45,
            data:  attacks,  // 공격유형
            itemGap: 15,    //?
            textStyle: {
              color: '#fff',
              fontSize: legend_size
            }
          },
          grid: chart_grid,
          tooltip: {
            trigger: 'axis',
            position: function (pt) {
              return [pt[0], '10%'];
            }
          },
          title: {
            top: 3,
            left: 'center',
            text: 'BPS'
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: time,  //가로 데이터
            axisLabel: {
              fontSize: 10
            }
          },
          yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            axisLabel: {
              fontSize: 10
            }
          },
          dataZoom: [
            {
              type: 'inside',
              start: 0,
              end: 100 //초기 zoom 최대 100 (%)
            },
            {
              height: 26,
              right: 28,
              bottom: 12,
              start: 0,
              end: 10
            }
          ],
          series: bps_series
      };

      //pps
      let pps_option = {
          backgroundColor: 'black',
          legend: {
            //index (범례)
            bottom: 45,
            data:  attacks,  // 공격유형
            itemGap: 15,    //?
            textStyle: {
              color: '#fff',
              fontSize: legend_size
            }
          },
          grid: chart_grid,
          tooltip: {            // 데이터 view 위치설정
            trigger: 'axis',
            position: function (pt) {
              return [pt[0] - 250, '10%'];
            }
          },
          title: {
            top: 3,
            left: 'center',
            text: 'PPS'
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: time,  //가로 데이터
            axisLabel: {
              fontSize: 10
            }
          },
          yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            axisLabel: {
              fontSize: 10
            }
          },
          dataZoom: [
            {
              type: 'inside',
              start: 0,
              end: 100 //초기 zoom 최대 100 (%)
            },
            {
              height: 26,
              right: 28,
              bottom: 12,
              start: 0,
              end: 10
            }
          ],
          series: pps_series
      };

      //iat
      let iat_option = {
        backgroundColor: 'black',
        legend: {
          //index (범례)
          bottom: 45,
          data:  attacks,  // 공격유형
          itemGap: 15,    //?
          textStyle: {
            color: '#fff',
            fontSize: legend_size
          }
        },
        grid: chart_grid,
        tooltip: {
          trigger: 'axis',
          position: function (pt) {
            return [pt[0], '10%'];
          }
        },
        title: {
          top: 3,
          left: 'center',
          text: 'IAT'
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: time  //가로 데이터
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%']
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100 //초기 zoom 최대 100 (%)
          },
          {
            height: 26,
            right: 28,
            bottom: 12,
            start: 0,
            end: 10
          }
        ],
        series: iat_series
      };

      //qps
      let qps_option = {
        backgroundColor: 'black',
        legend: {
          //index (범례)
          bottom: 45,
          data:  attacks,  // 공격유형
          itemGap: 16,    //?
          textStyle: {
            color: '#fff',
            fontSize: legend_size
          }
        },
        grid: chart_grid,
        tooltip: {
          trigger: 'axis',
          position: function (pt) {
            return [pt[0], '10%'];
          }
        },
        title: {
          top: 3,
          left: 'center',
          text: 'QPS'
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: time  //가로 데이터
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%']
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100 //초기 zoom 최대 100 (%)
          },
          {
            height: 26,
            right: 28,
            bottom: 12,
            start: 0,
            end: 10
          }
        ],
        series: qps_series
      };

      //rps
      let rps_option = {
        backgroundColor: 'black',
        legend: {
          //index (범례)
          bottom: 45,
          data:  attacks,  // 공격유형
          itemGap: 16,    //?
          textStyle: {
            color: '#fff',
            fontSize: legend_size
          }
        },
        tooltip: {
          trigger: 'axis',
          position: function (pt) {
            return [pt[0], '10%'];
          }
        },
        title: {
          top: 3,
          left: 'center',
          text: 'RPS'
        },
        grid: chart_grid,
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: time  //가로 데이터
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%']
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100 //초기 zoom 최대 100 (%)
          },
          {
            height: 26,
            right: 28,
            bottom: 12,
            start: 0,
            end: 10
          }
        ],
        series: rps_series
      };
      

      //// 프로토콜 빈도 데이터 생성
      const protocolMap = new Map();
      const protocolMap2 = new Map();

      // scrpro 데이터를 protocol로 그룹화
      data.scrpro.forEach((scrpro) => {
        if (!protocolMap.has(scrpro.Protocol2)) {
          protocolMap.set(scrpro.Protocol2, new Map());
        }
        const protocolGroup = protocolMap.get(scrpro.Protocol2);
        
        // 그룹화된 데이터에서 source_port로 그룹화
        if (!protocolGroup.has(scrpro.Source_Port)) {
          protocolGroup.set(scrpro.Source_Port, 0);
        }
        protocolGroup.set(scrpro.Source_Port, protocolGroup.get(scrpro.Source_Port) + scrpro.n);
      });     
      protocolMap.forEach((protocolGroup, protocol2) => {  
        const protocolData = {
          name: protocol2,
          itemStyle: {
            // color: '#a87b64'
            color: getRandomColor()
          },
          children: []
        };
        
        protocolGroup.forEach((value, sourcePort) => {
          protocolData.children.push({
            name: sourcePort.toString(),
            value: value,
            itemStyle: {
              // color: '#c78869'
              color: getRandomColor()
            }
          });
        });
        scrpro_series.push(protocolData);
      });
      console.log('k:', scrpro_series);


      function calculateTotalValue(data) {
        let totalValue = 0;
        data.forEach(item => {
          if (item.children) {
            totalValue += calculateTotalValue(item.children);
          } else {
            totalValue += item.value;
          }
        });
        return totalValue;
      }

      let totalValue = calculateTotalValue(scrpro_series);

      scrpro_series.forEach(item => {
        let percentage = (item.value / totalValue) * 100;
        item.label = {
          formatter: function (params) {
            return params.name + ' (' + (isNaN(percentage) ? 0 : percentage.toFixed(2)) + '%)';
          }
        };
      });

      console.log('k:', scrpro_series);
      

      let scrpro_option = {
        backgroundColor: 'black',
        series: {
          type: 'sunburst',
          data: scrpro_series,
          radius: [0, '95%'],
          sort: undefined,
          emphasis: {
            focus: 'ancestor',
            scale: 2
          },
          levels: [
            {
            },
            {
              r0: '15%',
              r: '35%',
              itemStyle: {
                borderWidth: 1,
                borderColor: '#000'
              },
              label: {
                rotate: 'tangential'
              }
            },
            {
              r0: '35%',
              r: '70%',
              label: {
                position: 'outside',
                align: 'right'
              },
              itemStyle: {
                borderWidth: 1,
                borderColor: '#000'
              }
            }
          ]
        }
      };        


      // dstpro
      data.dstpro.forEach((dstpro) => {
        if (!protocolMap2.has(dstpro.Protocol2)) {
          protocolMap2.set(dstpro.Protocol2, new Map());
        }
        const protocolGroup2 = protocolMap2.get(dstpro.Protocol2);
        
        // 그룹화된 데이터에서 source_port로 그룹화
        if (!protocolGroup2.has(dstpro.Destination_Port)) {
          protocolGroup2.set(dstpro.Destination_Port, 0);
        }
        protocolGroup2.set(dstpro.Destination_Port, protocolGroup2.get(dstpro.Destination_Port) + dstpro.n);
      });
      protocolMap2.forEach((protocolGroup2, protocol2) => {
        const protocolData2 = {
          name: protocol2,
          itemStyle: {
            // color: '#a87b64'
            color: getRandomColor()
          },
          children: []
        };
        
        protocolGroup2.forEach((value, destinationPort) => {
          protocolData2.children.push({
            name: destinationPort.toString(),
            value: value,
            itemStyle: {
              // color: '#c78869'
              color: getRandomColor()
            }
          });
        });
        dstpro_series.push(protocolData2);
      });     
      let dstpro_option = {
        backgroundColor: 'black',
        series: {
          type: 'sunburst',
          data: dstpro_series,
          radius: [0, '95%'],
          sort: undefined,
          emphasis: {
            focus: 'ancestor',
            scale: 2
          },
          levels: [
            {
            },
            {
              r0: '15%',
              r: '35%',
              itemStyle: {
                borderWidth: 1,
                borderColor: '#000'
              },
              label: {
                rotate: 'tangential'
              }
            },
            {
              r0: '35%',
              r: '70%',
              label: {
                position: 'outside',
                align: 'right'
              },
              itemStyle: {
                borderWidth: 1,
                borderColor: '#000'
              }
            }
          ]
        }
      };



      //패킷 길이 빈도
      let pal_data_range = data.pal.map(function(item) { return item.N_Range; })
      let pal_data_cnt = data.pal.map(function(item) { return item.n; })
      let pal_option = {
        backgroundColor: "black",
        title: {
          top: 3,
          left: 'center',
          text: 'Packet Length Frequency',
          textStyle: {
            fontSize: 16
            // align: 'center'
          },
        },
        grid: {
          top: 45,
          left: 43,
          right: 8,
          bottom: 35
        },
        xAxis: {
          type: 'category',
          data: pal_data_range,
          axisLabel: {
            fontSize: 9.5
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: 10
          }
        },
        series: [
          {
            label: {
              position: 'top',
              show: true, // 강조될 때 label 표시
              textStyle: {
                color: 'white' // 라벨 텍스트 컬러
              },
              formatter: function(params) {
                const value = params.value;
                return value.toLocaleString();
              }
            },
            itemStyle: {
              color: '#9D96F5',
              emphasis: {
                color: 'yellow' // 강조된 바 색상
              }
            },
            emphasis: {
              // label: {
              //   show: true, // 강조될 때 label 표시
              // }
            },
            data: pal_data_cnt,
            type: 'bar'
          }
        ]
      };



      // flag count
      let flag_series = [];
      let flags = Object.keys(data.flag[0]);
      flags.splice(flags.indexOf('Timestamp'), 1);
      console.log(flags);
      for (let i = 0; i < flags.length; i++) {
        var fn = flags[i]
        var flag_data = data.flag.map(function(item) { return item[fn]; })
        var flag_serie = {
          name: fn,
          type: 'bar',
          stack: 'flag',
          emphasis: {
            focus: 'series'
          },
          data: flag_data
        }
        flag_series.push(flag_serie);
      }
      let flag_option = {
        backgroundColor : 'black',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
          // position: function (pt) {
          //   return [pt[0], '10%'];
          // }
        },
        legend: {
          top: 32
        },
        title: {
          top: 3,
          left: 'center',
          text: 'Flag Count'
        },
        grid: {
          left: 30,
          right: 50,
          top: 120,
          bottom: 10,
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: time
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        // dataZoom: [
        //   {
        //     type: 'inside',
        //     start: 0,
        //     end: 100 //초기 zoom 최대 100 (%)
        //   },
        //   {
        //     right: 50,
        //     start: 0,
        //     end: 10
        //   }
        // ],
        series: flag_series
      };

      // 비율
      const flag_node = document.querySelectorAll('.ratio-data');
      for(let i = 0; i < flag_node.length; i++){
        flag_node[i].innerHTML = data.flag_ratio[i].ratio + " %";
      };

      //분석값
      const flag_node2 = document.querySelectorAll('.flag_data');
      for(let i = 0; i < flag_node2.length; i++){
        flag_node2[i].innerHTML = data.flag_aly[i].value;
      };

      

      // 정상 비정상 비율
      // var won_name = data.won.map(function(item) { return item.attack; })
      let won_ratio = data.won.map(function(item) { return item.ratio; })
      // console
      const won_data = [
        {
          value: won_ratio[0],
          name: "Attack",
          title: {
            offsetCenter: ['0%', '-38%'],
            fontSize: 12
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ['0%', '-18%']
          },
          itemStyle: { // 아이템 스타일 설정
            color: 'pink'
          }
        },
        {
          value: won_ratio[1],
          name: "Normal",
          title: {
            offsetCenter: ['0%', '13%'],
            fontSize: 12
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ['0%', '33%']
          },
          itemStyle: { // 아이템 스타일 설정
            color: 'lightgreen'
          }
        }
      ];
      let won_option = {
        backgroundColor : "black",
        title: {
          top: 2,
          left: 'center',
          text: '정상 비정상 Traffic',
          textStyle: {
            fontSize: 16,
            align: 'center'
          },
        },
        series: [
          {
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            pointer: {
              show: false
            },
            progress: {
              show: true,
              overlap: false,
              roundCap: true,
              clip: false,
              itemStyle: {
                borderWidth: 1,
                borderColor: '#464646'
              }
            },
            axisLine: {
              lineStyle: {
                width: 30     //게이지 굵기
              }
            },
            splitLine: {
              show: false,
              distance: 0,
              length: 10
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false,
              distance: 50
            },
            data: won_data,
            title: {
              fontSize: 12
            },
            detail: {
              width: 35,      // 비율 아이템
              height: 12,
              fontSize: 12,
              color: 'white',
              borderColor: 'inherit',
              borderRadius: 20,
              borderWidth: 1,
              formatter: '{value}%'
            }
          }
        ]
      };

      // 테이블
      const won_node = document.querySelectorAll('.won_data');
      const won_unit = document.querySelectorAll('.won_unit');
      for(let i = 0; i < won_node.length; i++){
        let value = data.won_aly[i].value;
        if (value < 100) {
          won_node[i].innerHTML = data.won_aly[i].value;
          won_unit[i].innerHTML = 'byte';
        } else {
          value = (value / 1000).toFixed(2); // 소수점 두 자리까지 표시
          won_node[i].innerHTML = value.replace(/\.?0+$/, ''); // 소수 부분이 0으로 끝나면 제거
          won_unit[i].innerHTML = 'kbyte';
        }
      };




      // conversaion (테이블)
      const con_table = document.querySelector("#table_con table tbody");
      let con_data = data.con.map(function(item) {
        return [item.labels2, item.Source_IP, item.Destination_IP, item.min, item.mean, item.max, item.sum, item.ratio+" %"];
      });
      for (let i = 0; i < 10; i++) {
        let trNode = document.createElement("tr");
        let trdata = con_data[i];

        for(let j = 0; j < 8; j++) {
          let tdNode = document.createElement("td");
          tdNode.textContent = trdata[j];
          trNode.appendChild(tdNode);
        }
        con_table.appendChild(trNode);
      }



      //네트워크망
      let net_node = data.net_node.map(function(item) {
        // var col = getRandomColor()
        // var col = "#abf7ffa8"
        let gradient = {
          type: 'radial',
          colorStops: [
          {
            offset: 0,
            color: '#5ff0ffa8'
            // color: '#5C90F7' // 시작 색상
          }, 
          // {
          //   offset: 0.5,
          //   color: '#5C90F7' // 시작 색상
          // }, 
          // {
          //   offset: 0.7,
          //   color: '#84c4fb'
          // },
          {
            offset: 1,
            color: '#abf7ffa8' // 종료 색상
          }],
          global: false // 그라데이션 적용 범위
        };
        let reSize;
        reSize = item.count
        if (item.count > 50) {
          reSize = 50
        }
        return {
          name: item.IP,
          symbolSize: reSize,
          draggable: "true",
          itemStyle: {
            // background: col 
            color: gradient
          },
          value: item.count
        }
      });
      let net_link = data.net.map(function(item) {
        return {
          source: item.Source_IP,
          target: item.Destination_IP,
          value: item.Frequency
        }
      });
      let net_option = {
        backgroundColor: "black",
        // tooltip: {},
        tooltip: {
          position: function (pt) {
            return [pt[0] + 10, pt[1] - 90];
          },
          formatter: function(params) {
            if (params.dataType === 'node') { // 노드가 강조됐을 때
              const node = params.data;
              const nodeName = node.name;
              const value = node.value;
              const iconStyle = 'display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:#5ff0ffa8;';
              return `<span style=${iconStyle}></span> Node <br>IP: <b>${nodeName}</b>   Value: <b>${value}</b>`;
            } else { // 링크가 강조됐을 때
              const link = params.data;
              const sourceNodeName = link.source;
              const targetNodeName = link.target;
              const value = link.value;
              const iconStyle = 'display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:#dee2a2;';
              return `<span style=${iconStyle}></span>Link <br> Source: <b>${sourceNodeName}</b>   Target: <b>${targetNodeName}</b>   Value: <b>${value}</b>`;
            }
          }
        },
        series: [
          {
            name: 'IP',
            type: 'graph',
            layout: 'force',
            data: net_node,
            links: net_link,
            roam: true,
            label: {
              position: 'right'
            },
            // emphasis: {
            //   lineStyle: {
            //     width: 3  // 링크 굵기
            //   },
            //   edgeLabel: {
            //     show: true  // 링크에 라벨 표시
            //   },
            //   edgeLabel: {
            //     show: true  // 링크에 라벨 표시
            //   },
            //   itemStyle: {
            //     color: 'pink'  // 링크와 연결된 노드의 색상
            //   },
            //   focus: 'adjacency'  // 강조된 링크와 연결된 노드만 색상 변경
            // },
            force: {
              repulsion: 100
            },
            lineStyle: {
              color: "#dee2a2",
            }
          }
        ]
      };


      //qrps-pro 테이블
      const qprs_Node = document.querySelectorAll('.qrps-data .value');
      qprs_Node[0].innerHTML = data.max_aly[2].max_value;
      qprs_Node[1].innerHTML = data.max_aly[3].max_value;

      const maxpro_Node = document.querySelectorAll('.pro-data .value');
      maxpro_Node[0].innerHTML = data.pro_max[0].value;
      maxpro_Node[1].innerHTML = data.pro_max[1].value;


      //iat 테이블
      const iat_Node = document.querySelectorAll('#iat-table .value');
      for(let i = 0; i < iat_Node.length; i++){
        iat_Node[i].innerHTML = data.iat_aly[i].value;
      };


      // 데이터 분석 레포트 영역
      const text1 = document.querySelectorAll('.text-1 span:not(.attk_y)');
      // console.log(text1);
      text1[0].innerHTML = data.won[1].ratio;   //정상데이터 비율
      text1[1].innerHTML = data.won[0].ratio;   //이상데이터 비율
      for(var i = 0; i < 4; i++){               //전체 패킷길이 평균값, 표준편차, 최댓값, 최솟값
        text1[i+2].innerHTML = data.won_aly[i].value;
      };
      text1[6].innerHTML = data.palmax_len; 
      text1[7].innerHTML = data.palmax_cnt;
      
      //이상 데이터가 있을시 아래
      const attk_text = document.querySelector('.attk_y');
      console.log(attk_text);
      let atext = "이상데이터는 "
      if(attlen > 1) {
        for (let i = 0; i < attlen-1; i++){       //공격 유형만큼 추가
          atext += "<span>" + data.attack_cnt[i].labels2 + " " +data.attack_cnt[i].ratio + "</span>" + "%"
          if (i != attlen-2){
            atext += ","
          }
        }
        atext += "으로 이루어져 있습니다.";
        attk_text.innerHTML =  atext;
      }

      // 두번째 문단
      const text2 = document.querySelectorAll('.text-2 span');
      // console.log(text2);
      for (let i = 0; i < 7; i+=2){
        text2[i].innerHTML = data.max_aly[i/2].max_value;
        text2[i+1].innerHTML = data.max_aly[i/2].time;
      }

      
      // 세번째 문단
      const text3 = document.querySelectorAll('.text-3 span');
      text3[0].innerHTML = data.flag.length;        // flag 총 개수
      text3[1].innerHTML = data.flag_aly[1].value;  // 초당 평균
      text3[2].innerHTML = data.flag_aly[3].value;  // 가장 높은 비율 flag
      text3[3].innerHTML = data.flag_aly[2].value;  // 가장 높은 비율 flag// 가장 낮은 비율 flag
      // 전체 비율
      for(let i = 0; i < flag_node.length; i++){
        text3[i+4].innerHTML = data.flag_ratio[i].ratio;
      };

      // 네번째 문단
      const text4 = document.querySelectorAll('.text-4 span');
      console.log(text4);
      text4[0].innerHTML = data.con[0].Source_IP;          //교류량이 가장 많은 소스ip
      text4[1].innerHTML = data.con[0].Destination_IP;    //도착ip
      text4[2].innerHTML = data.con[0].count;             //교류횟수
      text4[3].innerHTML = data.con[0].sum;               //해당 패킷 길이
      text4[4].innerHTML = data.con[0].mean;              // 평균
      text4[5].innerHTML = data.con[0].max;               // 최대
      text4[6].innerHTML = data.con[0].min;               // 최소
      text4[7].innerHTML = data.con[0].ratio;             // 비율
      text4[8].innerHTML = data.pro_max[0].value;         //최대 프로토콜
      text4[9].innerHTML = data.pro_max[1].value;         //비율



      //iat 데이터
      for(let i = 0; i < 3; i++){     // 평균, 표준편차, 최대값
        text4[i+10].innerHTML = data.iat_aly[i].value;
      };
      text4[13].innerHTML = data.iat_aly[4].value;  //최대값이 찍힌 시간



      // 네번째 문단: 공격 발견시 공격 문단 생성
      const attk_box = document.querySelector('.attk_section');
      let add_node='<p class="text-1">현재 이상 데이터 <span></span> 는 <span></span> - <span></span>에서 발견 되었으며, 현재 데이터의 최고값 BPS는 <span></span> bytes/s, PPS는 <span></span> packets/s, QPS는 <span></span> queries/s, RPS는 <span></span> rquests/s입니다. 이상 데이터로 찍히는 Source IP는 <span></span>이며, Destination IP는 <span></span> 입니다. 해당 프로토콜은 <span></span>입니다.</p><p class="text-3">아래 표는 <span></span> 공격이 탐지된 데이터의 정보입니다. 아래 표를 확인하여, 해당 IP를 차단하세요</p>'
      +'<div class="attk_table"><table><tr><td colspan="2">IP</td><td colspan="4">Length</td><td rowspan="2">Time</td></tr><tr><td>Source</td><td>Destination</td><td>Mean</td><td>Min</td><td>Max</td><td>Sum</td></tr><!-- 데이터 추가 --></table></div>';
      
      

      // 공격 유형 box 생성
      if(attlen > 1) {
        let att_text = document.createElement("p");
        att_text.classList.add('sm-gr');
        att_text.innerHTML = "이상 데이터에 대해 자세하게 설명드리겠습니다."
        att_text.classList.add('rd');
        attk_box.appendChild(att_text);

        for (let i = 0; i < attlen-1; i++){       //공격 유형만큼 추가
          let att_node = document.createElement("div");
          att_node.classList.add('attk_box');
          att_node.innerHTML = add_node;

          attk_box.appendChild(att_node);
        }
      }

    
      // 공격 유형 별 데이터 추가
      const attk_boxs = document.querySelectorAll('.attk_box');
      console.log(attk_boxs);
      let attk_index = 0;

      // for (let i = 0; i < attk_boxs.length; i++) {
      for (const atk in data.attack_aly) {
        const attk_box = attk_boxs[attk_index];
        console.log(attk_box);
        
        // attk_box의 자식 요소들을 가져와서 사용
        const t1 = attk_box.querySelectorAll('.text-1 span');
        console.log(t1);
        t1[0].innerHTML = atk;      //공격
        t1[0].classList.add('rd');
        t1[1].innerHTML = data.attack_time[attk_index].FirstTimestamp;          //공격 시작시간
        t1[2].innerHTML = data.attack_time[attk_index].LastTimestamp;          //공격 마지막 시간
        for (let j = 0; j < 4; j++){                                   //최고 bps, pps, qps, rps
          t1[j+3].innerHTML = data.attack_max_aly[atk][j].value.toLocaleString();;
        }

        // const t2 = attk_box.querySelectorAll('.text-2 span');
        // t2[0].innerHTML = data.attack_aly[atk][0].Source_IP;
        // t2[1].innerHTML = data.attack_aly[atk][0].Destination_IP;
        t1[7].innerHTML = data.attack_aly[atk][0].Source_IP;
        t1[8].innerHTML = data.attack_aly[atk][0].Destination_IP;


        const t3 = attk_box.querySelectorAll('.text-3 span');
        t3[0].innerHTML = atk;
        t3[0].classList.add('rd');


        // 공격별 테이블
        const attk_table = attk_box.querySelector(".attk_table tbody");
        let atk_data = data.attack_aly[atk].map(function(item) {
          return [item.Source_IP, item.Destination_IP, item.min, item.mean, item.max, item.sum, item.Timestamp];
        });
        for (let i = 0; i < atk_data.length; i++) {
          let trNode = document.createElement("tr");
          let trdata = atk_data[i];
  
          for(let j = 0; j < 7; j++) {
            let tdNode = document.createElement("td");
            tdNode.textContent = trdata[j];
            trNode.appendChild(tdNode);
          }
          attk_table.appendChild(trNode);
        }


        attk_index++;
      }









      //공격 솔루션 : 겹치는거 처리하기 및 내용 수정
      if(attlen < 2){
        let normalN = document.querySelector('.normal');
        normalN.style.display = 'block';
      } else {
        let attkT = document.querySelector('.attk-t');
        attkT.style.display = 'block';

        if (attacks.includes('DDoS')){
          let ad = document.querySelector('.ddos');
          ad.style.display = 'block';
        }
        if (attacks.includes('PortScan')){
          let ap = document.querySelector('.portscan');
          ap.style.display = 'block';
        }
        if (attacks.includes('Bornet')){
          let ab = document.querySelector('.botnet');
          ab.style.display = 'block';
        }
        if (attacks.includes('Infiltration')){
          let aif = document.querySelector('.infiltration');
          aif.style.display = 'block';
        }
        if (attacks.includes('FTP-Patator')){
          let afp = document.querySelector('.ftp-patator');
          afp.style.display = 'block';
        }
        if (attacks.includes('SSH-Patator')){
          let asp = document.querySelector('.ssh-patator');
          asp.style.display = 'block';
        }
        if (attacks.includes('DoS_Hulk')){
          let adh = document.querySelector('.dos-hulk');
          adh.style.display = 'block';
        }
        if (attacks.includes('Dos_GoldenEye')){
          let adg = document.querySelector('.dos-goldeneye');
          adg.style.display = 'block';
        }
        if (attacks.includes('DoS_slowloris')){
          let ads = document.querySelector('.doS-slowloris');
          ads.style.display = 'block';
        }
        if (attacks.includes('DoS_Slowhttptest')){
          let adst = document.querySelector('.doS-slowhttptest');
          adst.style.display = 'block';
        }
        if (attacks.includes('Heartbleed')){
          let ah = document.querySelector('.heartbleed');
          ah.style.display = 'block';
        }
        if (attacks.includes('ICMP_Flooding')){
          let ai = document.querySelector('.icmp-flooding');
          ai.style.display = 'block';
        }

      }


      bps_option && bps.setOption(bps_option);
      pps_option && pps.setOption(pps_option);
      iat_option && iat.setOption(iat_option);
      sig_option && sig.setOption(sig_option);
      qps_option && qps.setOption(qps_option);
      rps_option && rps.setOption(rps_option);
      scrpro_option && scrpro.setOption(scrpro_option);
      dstpro_option && dstpro.setOption(dstpro_option);
      pal_option && pal.setOption(pal_option);
      flag_option && flag.setOption(flag_option);
      net_option && net.setOption(net_option);
      won_option && won.setOption(won_option);

  },
  error: function (xhr, errmsg, err) {
      console.log(xhr.status + ': ' + xhr.responseText);
      console.log("error")
  },
  complete: function() {
    // Ajax 요청이 완료된 후 로딩 화면을 숨김
    $('#loading_sc').hide();
  }

    
});
  






