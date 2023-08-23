// document \ send_data.js

"use strict"
// 로딩 페이지
let body = this.document.querySelector('body');
let loadingScreen = document.getElementById('loadingScreen');
let expItems = document.querySelectorAll('.exp-item');
// let submitBtn = document.querySelector('.upload-btn');
let submitBtn = document.querySelector('.submit-btn');


let currentIndex = 0;

function showNextElement() {
    expItems[currentIndex].style.display = 'block';
  
    setTimeout(function() {
      expItems[currentIndex].style.display = 'none';
      currentIndex = (currentIndex + 1) % expItems.length;
      showNextElement();
    }, 5000); // 5초 후에 다음 요소를 보여줌
}



// form 데이터 post
$(document).ready(function() {
    
    
    
    // 파일 입력 후 (이거 검사할거?)추가 입력 창 띄우기
     $('.add-file').click(function(e) {  
        var fileInput = document.getElementById('csv_file');
        var file = fileInput.files[0];
        if (!file || file.type !== 'text/csv') {
            alert('CSV 파일을 넣어주세요.');
            // $('#add-area').css("display", "none");
        return;
      }
        $('#add-area').css("display", "block");
         console.log('cl');
 
     });
    
    
    // 추가 입력 여부
    $('.use-check').on('click', function() {
        let valueCheck = $('.use-check:checked').val(); //체크된 value 값 가져오기

        if ( valueCheck == 1 ) {
            $('.input-data').attr('disabled', false); // input 활성화
        } else {
            $('#keyword').val('');
            $('.input-data').attr('disabled', true);
        }
    });
    
    
    // 추가입력 창닫기
    $('.exit').click(function(e) {
         $('#add-area').css("display", "none");
     });
    
    
    
    $('form').submit(function(e) {
      e.preventDefault();
      var formData = new FormData(this);
      
      var fileInput = document.getElementById('csv_file');
      var file = fileInput.files[0];
      NProgress.configure({ showSpinner: true });

      // 파일이 선택되지 않았거나 CSV 파일이 아닌 경우
      if (!file || file.type !== 'text/csv') {
        alert('CSV 파일을 넣어주세요.');
        $('#add-area').css("display", "none");
        return;
      }
        
        var formData = new FormData(this);
        // 백신 추천 서비스 사용 라디오 버튼 값
        var useRecommendation = $('input[name="use"]:checked').val();
        // 사용자 유형 라디오 버튼 값
        var selectedUser = $('input[name="user"]:checked').val();
        // 가격 라디오 버튼 값
        var selectedPrice = $('input[name="price"]:checked').val();
        // 특정 공격 및 키워드 (널값 검사?)
        var specificKeyword = $('#keyword').val();
        
        // FormData 객체에 라디오 버튼 값 추가
        formData.append('user', selectedUser);
        formData.append('price', selectedPrice);
        formData.append('use', useRecommendation);
        formData.append('keyword', specificKeyword);
  
  
      var reader = new FileReader();
      reader.onload = function(e) {
        var csvContent = e.target.result;
        var csvData = parseCSV(csvContent); // CSV 파싱 함수 호출
        var hasAllColumns = checkColumns(csvData); // 컬럼 검사 함수 호출
  
        if (hasAllColumns) {
          // 모든 컬럼을 가지고 있는 경우 서버로 전송
          $.ajax({
            url: '/dashboard/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function() {
              NProgress.start();
              $('#add-area').css("display", "none");
              $('#loadingScreen').show();
              $('body').css('overflow', 'hidden');
              $('#arrow-up').css('display', 'none');
              showNextElement();
            },
            success: function(data) {
              window.location.href = '/dashboard/';
              console.log('성공');
            },
            error: function(xhr, status, error) {
              console.log(error);
                $('#add-area').css("display", "none");
              alert('올바른 형식의 파일을 선택해주세요.');
              return;
            },
            complete: function() {
              $('#loadingScreen').hide();
              NProgress.done();
            }
          });
        } else {
          // 모든 컬럼을 가지고 있지 않은 경우 오류 처리
          alert('CSV 파일에 필요한 모든 컬럼을 포함해야 합니다. 시그니처에서 제공하는 네트워크 트래픽 캡쳐 스크립트를 사용해주세요.');
        }
      };
      reader.readAsText(file);
    });
  
    function parseCSV(csvContent) {
      // CSV 파싱 로직 구현
      var lines = csvContent.split('\r\n');
      var csvData = [];
      for (var i = 0; i < lines.length; i++) {
        var columns = lines[i].split(',');
        csvData.push(columns);
      }
      return csvData;
    }
  
    function checkColumns(csvData) {
        // CSV 데이터에서 컬럼 검사 로직 구현
        // 최근 스크립트
          var expectedColumns = ['Source IP', 'Destination IP', 'Protocol', 'Source Port', 'Destination Port', 'Timestamp','FIN Flag Count',
                                 'SYN Flag Count', 'RST Flag Count', 'PSH Flag Count', 'ACK Flag Count','URG Flag Count', 'CWE Flag Count',
                                 'ECE Flag Count', 'SYN_ACK_Count', 'Length', 'IAT','Payload','OS','RAM','HD','Browser']
        // 구버전 스크립트
        // let expectedColumns = ['Source IP', 'Destination IP', 'Protocol', 'Source Port', 'Destination Port', 'Flow Duration', 'Timestamp',
        // 'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count','PSH Flag Count', 'ACK Flag Count','URG Flag Count', 'SYN ACK Count','CWE Flag Count', 'ECE Flag Count'
        // ,'Total Length', 'Flow Bytes/s','Flow Packets/s', 'Min Packet Length', 'Max Packet Length','Packet Length Mean', 'Packet Length Std', 'IAT']
        var headers = csvData[0];
        console.log(csvData[0]);
        for (var i = 0; i < expectedColumns.length; i++) {
            if (headers.indexOf(expectedColumns[i]) === -1) {
                console.log(expectedColumns[i]);
                return false;
            }
        }
        return true;

    }
  });
  

