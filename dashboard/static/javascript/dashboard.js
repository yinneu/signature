"use strict"


var bps = echarts.init(document.getElementById('graph_bps'), 'dark');
var pps = echarts.init(document.getElementById('graph_pps'), 'dark');
var iat = echarts.init(document.getElementById('graph_iat'), 'dark');
var sig = echarts.init(document.getElementById('graph_sig'), 'dark');
var qps = echarts.init(document.getElementById('graph_qps'), 'dark');
var rps = echarts.init(document.getElementById('graph_rps'), 'dark');
var scrpro = echarts.init(document.getElementById('graph_scrpro'), 'dark');
var dstpro = echarts.init(document.getElementById('graph_dstpro'), 'dark');
var pal = echarts.init(document.getElementById('graph_pal'), 'dark');
var flag = echarts.init(document.getElementById('graph_flag'), 'dark');
var net = echarts.init(document.getElementById('graph_net'), 'dark');
var won = echarts.init(document.getElementById('graph_won'), 'dark');


//series를 담을 리스트
var sig_series = [];
var bps_series = [];
var pps_series = [];
var iat_series = [];
var qps_series = [];
var rps_series = [];
var scrpro_series = [];
var dstpro_series = [];


// 색 랜덤 지정
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return "#"+(parseInt(Math.random()*0xffffff)).toString(16);
}



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
            var attacks = Object.keys(data.sig_attack);
            var attlen = attacks.length;
            // 시간
            var time = data.bps_attack.map(function(item) { return item.Timestamp; })


      //전체 트래픽 값
      const total_cut =  document.getElementById("total_cnt");
      total_cut.innerHTML = data.total_cnt;

      //normal
      const normal =  document.getElementById("normal");
      normal.innerHTML = data.won[1].count;    // 정상데이터 수
      
      //aormal
      const anormal =  document.getElementById("anormal");
      anormal.innerHTML = data.won[0].count;  // 이상데이터 수
      

      //aormal ratio
      const anormal_ratio =  document.getElementById("anormal_ratio");
      anormal_ratio.innerHTML = data.won[0].ratio + " % "; // 이상데이터 비율




      // 공격유형에 따라 분류된 데이터들 받아오기
      for (var i = 0; i < attlen; i++) {
          // 공격유형
          var atk = attacks[i];

          // 시그니처
          var sig_data = data.sig_attack[atk].map(function(item) {
              return [item.Source_IP, item.Destination_IP, item.Destination_Port, item.Total_Length];
          });
          var sig_serie = {
              name: atk,
              type: 'parallel',
              lineStyle: lineStyle,
              data: sig_data
          };
          sig_series.push(sig_serie);


          //bps
          var bps_data = data.bps_attack.map(function(item) { return item[atk]; })
          var bps_serie = {
              name: atk,
              type: 'line',
              symbol: 'none',
              sampling: 'lttb',
              itemStyle: {
                color: 'rgb(255, 70, 131)'
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
          var pps_data = data.pps_attack.map(function(item) { return item[atk]; })
          var pps_serie = {
              name: atk,
              type: 'line',
              symbol: 'none',
              sampling: 'lttb',
              itemStyle: {
                //겉 라인 색상
                // color: 'rgb(255, 70, 131)'
                color: '#00C20D' 
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
          var iat_data = data.iat_attack.map(function(item) { return item[atk]; })
          var iat_serie = {
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
          var qps_data = data.qps_attack.map(function(item) { return item[atk]; })
          var qps_serie = {
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
          var rps_data = data.rps_attack.map(function(item) { return item[atk]; })
          var rps_serie = {
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
      var legend_size = 12;

      // 공격유형 개수에 따른 그래프 간격조정
      var chart_grid = {
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
      var schema = [
      //세로선
          { name: 'Source_IP', index: 0, text: 'Source IP' },
          { name: 'Destination_IP', index: 1, text: 'Destination IP' },
          { name: 'Destination_Port', index: 2, text: 'Destination Port' },
          { name: 'Length', index: 3, text: 'Length' }
      ];
      var lineStyle = {
          width: 1,
          opacity: 0.5
      };
      var sig_option = {
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
      var bps_option = {
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
      var pps_option = {
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
      var iat_option = {
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
      var qps_option = {
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
      var rps_option = {
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
      var scrpro_option = {
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
      var dstpro_option = {
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
      var pal_data_range = data.pal.map(function(item) { return item.N_Range; })
      var pal_data_cnt = data.pal.map(function(item) { return item.n; })
      var pal_option = {
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
              }
            },
            itemStyle: {
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
      var flag_series = [];
      var flags = Object.keys(data.flag[0]);
      flags.splice(flags.indexOf('Timestamp'), 1);
      console.log(flags);
      for (var i = 0; i < flags.length; i++) {
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
      var flag_option = {
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
      for(var i = 0; i < flag_node.length; i++){
        flag_node[i].innerHTML = data.flag_ratio[i].ratio + " %";
      };

      //분석값
      const flag_node2 = document.querySelectorAll('.flag_data');
      for(var i = 0; i < flag_node2.length; i++){
        flag_node2[i].innerHTML = data.flag_aly[i].value;
      };

      

      // 정상 비정상 비율
      // var won_name = data.won.map(function(item) { return item.attack; })
      var won_ratio = data.won.map(function(item) { return item.ratio; })
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
      var won_option = {
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
      for(var i = 0; i < won_node.length; i++){
        won_node[i].innerHTML = data.won_aly[i].value;
      };




      // conversaion (테이블)
      const con_table = document.querySelector("#table_con table tbody");
      var con_data = data.con.map(function(item) {
        return [item.labels2, item.Source_IP, item.Destination_IP, item.sum, item.mean, item.min, item.max, item.ratio];
      });
      for (var i = 0; i < 10; i++) {
        var trNode = document.createElement("tr");
        var trdata = con_data[i];

        for(var j = 0; j < 8; j++) {
          var tdNode = document.createElement("td");
          tdNode.textContent = trdata[j];
          trNode.appendChild(tdNode);
        }
        con_table.appendChild(trNode);
      }



      //네트워크망
      var net_node = data.net_node.map(function(item) {
        // var col = getRandomColor()
        // var col = "#abf7ffa8"
        var gradient = {
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
        var reSize;
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
      var net_link = data.net.map(function(item) {
        return {
          source: item.Source_IP,
          target: item.Destination_IP,
          value: item.Frequency
        }
      });
      var net_option = {
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
      for(var i = 0; i < iat_Node.length; i++){
        iat_Node[i].innerHTML = data.iat_aly[i].value;
      };


      // 텍스트 영역
      const text1 = document.querySelectorAll('.text-1 span:not(.attk_y)');
      // console.log(text1);
      text1[0].innerHTML = data.won[1].ratio;   //정상데이터 비율
      text1[1].innerHTML = data.won[0].ratio;   //이상데이터 비율
      for(var i = 0; i < 4; i++){               //전체 패킷길이 평균값, 표준편차, 최댓값, 최솟값
        text1[i+2].innerHTML = data.won_aly[i].value;
      };
      text1[6].innerHTML = data.palmax_len;   //
      text1[7].innerHTML = data.palmax_cnt;
      
      //이상 데이터가 있을시 아래
      const attk_text = document.querySelector('.attk_y');
      console.log(attk_text);
      var atext = "이상데이터는 "
      if(attlen > 1) {
        for (var i = 0; i < attlen-1; i++){       //공격 유형만큼 추가
          atext += "<span>" + data.attack_cnt[i].labels2 + " " +data.attack_cnt[i].ratio + "</span>" + "%"
          if (i != attlen-2){
            atext += ","
          }
        }
        atext += "으로 이루어져 있습니다.";
        attk_text.innerHTML =  atext;
      }

      const text2 = document.querySelectorAll('.text-2 span');
      // console.log(text2);

      text2[0].innerHTML = data.max_aly[0].max_value;
      text2[1].innerHTML = data.max_aly[0].time;
      text2[2].innerHTML = data.max_aly[1].max_value;
      text2[3].innerHTML = data.max_aly[1].time;
      

      const text3 = document.querySelectorAll('.text-3 span');
      
      text3[0].innerHTML = data.flag.length;        // flag 총 개수
      text3[1].innerHTML = data.flag_aly[1].value;  // 초당 평균
      text3[2].innerHTML = data.flag_aly[3].value;  // 가장 높은 비율 flag
      text3[3].innerHTML = data.flag_aly[2].value;  // 가장 높은 비율 flag// 가장 낮은 비율 flag
      // 전체 비율
      for(var i = 0; i < flag_node.length; i++){
        text3[i+4].innerHTML = data.flag_ratio[i].ratio;
      };


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
      for(var i = 0; i < 3; i++){     // 평균, 표준편차, 최대값
        text4[i+10].innerHTML = data.iat_aly[i].value;
      };
      text4[13].innerHTML = data.iat_aly[4].value;  //최대값이 찍힌 시간



      //공격 솔루션 : 겹치는거 처리하기

      if(attlen < 2){
        var normalN = document.querySelector('.normal');
        normalN.style.display = 'block';
      } else {
        var attkT = document.querySelector('.attk-t');
        attkT.style.display = 'block';

        if (attacks.includes('DDoS')){
          var ad = document.querySelector('.ddos');
          ad.style.display = 'block';
        }
        if (attacks.includes('PortScan')){
          var ap = document.querySelector('.portscan');
          ap.style.display = 'block';
        }
        if (attacks.includes('Bornet')){
          var ab = document.querySelector('.botnet');
          ab.style.display = 'block';
        }
        if (attacks.includes('Infiltration')){
          var aif = document.querySelector('.infiltration');
          aif.style.display = 'block';
        }
        if (attacks.includes('FTP-Patator')){
          var afp = document.querySelector('.ftp-patator');
          afp.style.display = 'block';
        }
        if (attacks.includes('SSH-Patator')){
          var asp = document.querySelector('.ssh-patator');
          asp.style.display = 'block';
        }
        if (attacks.includes('DoS_Hulk')){
          var adh = document.querySelector('.dos-hulk');
          adh.style.display = 'block';
        }
        if (attacks.includes('Dos_GoldenEye')){
          var adg = document.querySelector('.dos-goldeneye');
          adg.style.display = 'block';
        }
        if (attacks.includes('DoS_slowloris')){
          var ads = document.querySelector('.doS-slowloris');
          ads.style.display = 'block';
        }
        if (attacks.includes('DoS_Slowhttptest')){
          var adst = document.querySelector('.doS-slowhttptest');
          adst.style.display = 'block';
        }
        if (attacks.includes('Heartbleed')){
          var ah = document.querySelector('.heartbleed');
          ah.style.display = 'block';
        }
        if (attacks.includes('ICMP_Flooding')){
          var ai = document.querySelector('.icmp-flooding');
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
  






