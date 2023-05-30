/** documents \ index.js */
"use strict"
  


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