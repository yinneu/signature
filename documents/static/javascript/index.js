/** documents \ index.js */
"use strict"

// a.html
$(document).ready(function() {
    // 로딩 화면을 숨김
    // $('#loadingScreen').hide();
  
    $('form').submit(function(e) {
      e.preventDefault();
      var formData = new FormData(this);

        // 파일이 선택되지 않은 경우 에러 처리
        if (!formData.has('csv_file')) {
            alert('파일을 선택해주세요.');
            return;
        }

        NProgress.configure({ showSpinner: true }); // 스피너를 사용하지 않을 경우
        NProgress.start(); // 로딩 상태 시작


        // 폼 전송 전에 로딩 화면을 보여줌
        $('#loadingScreen').show();
    
        $.ajax({
            url: '/dashboard/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                // 데이터 처리 후 페이지 이동
                window.location.href = '/dashboard/';
            },
            error: function(xhr, status, error) {
                console.log(error);
            },
            complete: function() {
                // 작업이 완료된 후 로딩 화면을 숨김
                $('#loadingScreen').hide();
                NProgress.done(); // 로딩 상태 종료
            }
        });
  

    });
  });



//자세히보기 버튼 => 하단 설명페이지로 스크롤
const detailBtn = document.querySelector("#detail-btn");
const expBox = document.querySelector('#explanation');
const currentPosition = expBox.getBoundingClientRect().top + window.pageYOffset;

// 특정 픽셀만큼 추가로 스크롤하기 위한 값
const additionalScrollAmount = -80;

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