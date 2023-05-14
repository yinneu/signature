// 로딩페이지 loading.js

"use strict"


// window.addEventListener('DOMContentLoaded', function() {
//     var body = this.document.querySelector('body');

//     var expItems = document.querySelectorAll('.exp-item');
//     var currentIndex = 0;
  
//     function showNextExpItem() {
//         body.style.overflow = 'hidden';
//       if (currentIndex >= expItems.length) {
//         clearInterval(interval);
//         return;
//       }
  
//       expItems[currentIndex].style.display = 'block';
//       currentIndex++;
//     }
  
//     function hideExpItem() {

//       if (currentIndex <= 0) {
//         clearInterval(hideInterval);
//         return;
//       }
  
//       expItems[currentIndex-2].style.display = 'none';

//     }
  
//     var interval = setInterval(showNextExpItem, 5000);
//     var hideInterval = setInterval(hideExpItem, 5000);
// });


// let body = this.document.querySelector('body');
// let loadingScreen = document.getElementById('loadingScreen');
// let expItems = document.querySelectorAll('.exp-item');
// let submitBtn = document.querySelector('.upload-btn');
// let currentIndex = 0;

// function showNextElement() {
//   expItems[currentIndex].style.display = 'block';

//   setTimeout(function() {
//     expItems[currentIndex].style.display = 'none';
//     currentIndex = (currentIndex + 1) % expItems.length;
//     showNextElement();
//   }, 5000); // 3초 후에 다음 요소를 보여줌
// }

// submitBtn.addEventListener('click', () => {

//   body.style.overflow = 'hidden';
//   showNextElement();

// });