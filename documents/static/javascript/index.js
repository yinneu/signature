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
    }, 5000); // 5초 후에 다음 요소를 보여줌
  }
  


//자세히보기 버튼 => 하단 설명페이지로 스크롤
const detailBtn = document.querySelector("#detail-btn");
const expBox = document.querySelector('#explanation');

detailBtn.addEventListener('click', () => {

    expBox.scrollIntoView({ behavior: "smooth", block: "center", inline: "center"});

})



//파일업로드 하러가기
const uploadBtn = document.querySelector(".upload-link-btn");

uploadBtn.addEventListener('click', () => {
    const uploadBox = document.querySelector('#upload');
    uploadBox.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
})