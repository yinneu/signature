/** documents \ index.js */
"use strict"

// 로딩 페이지
let body = this.document.querySelector('body');
let loadingScreen = document.getElementById('loadingScreen');
let expItems = document.querySelectorAll('.exp-item');
let submitBtn = document.querySelector('.upload-btn');
let currentIndex = 0;

// 로딩 페이지
function showNextElement() {
    expItems[currentIndex].style.display = 'block';
  
    setTimeout(function() {
      expItems[currentIndex].style.display = 'none';
      currentIndex = (currentIndex + 1) % expItems.length;
      showNextElement();
    }, 5000); // 3초 후에 다음 요소를 보여줌
  }

// form 데이터 post
$(document).ready(function() {

    $('form').submit(function(e) {
      e.preventDefault();
      var formData = new FormData(this);
      
      var fileInput = document.getElementById('csv_file');
      var file = fileInput.files[0];
      NProgress.configure({ showSpinner: true });
  
      // 파일이 선택되지 않았거나 CSV 파일이 아닌 경우
      if (!file || file.type !== 'text/csv') {
        alert('올바른 CSV 파일을 선택해주세요.');
        return;
      }
  
      $.ajax({
        url: '/dashboard/',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function() {
          NProgress.start();
          $('#loadingScreen').show();
          $('body').css('overflow', 'hidden');
          showNextElement();
        },
        success: function(data) {
          window.location.href = '/dashboard/';
        },
        error: function(xhr, status, error) {
          console.log(error);
          alert('올바른 형식의 파일을 선택해주세요.');
          return;
        },
        complete: function() {
          $('#loadingScreen').hide();
          NProgress.done();
        }
      });
    });
  });
  




//자세히보기 버튼 => 하단 설명페이지로 스크롤
const detailBtn = document.querySelector("#detail-btn");
const expBox = document.querySelector('#explanation');
// const currentPosition = expBox.getBoundingClientRect().top + window.pageYOffset;

// 특정 픽셀만큼 추가로 스크롤하기 위한 값
// const additionalScrollAmount = -80;

detailBtn.addEventListener('click', () => {
    expBox.scrollIntoView({ behavior: "smooth", block: "center", inline: "center"});
    // window.scrollTo({
    //     top: currentPosition + additionalScrollAmount,
    //     behavior: "smooth"
    //   });
})



//파일업로드 하러가기
const uploadBtn = document.querySelector(".upload-link-btn");

uploadBtn.addEventListener('click', () => {
    const uploadBox = document.querySelector('#upload');
    uploadBox.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
})