// 로딩페이지 loading.js

"use strict"


window.addEventListener('DOMContentLoaded', function() {
    var body = this.document.querySelector('body');

    var expItems = document.querySelectorAll('.exp-item');
    var currentIndex = 0;
  
    function showNextExpItem() {
        body.style.overflow = 'hidden';
      if (currentIndex >= expItems.length) {
        clearInterval(interval);
        return;
      }
  
      expItems[currentIndex].style.display = 'block';
      currentIndex++;
    }
  
    function hideExpItem() {
      if (currentIndex <= 0) {
        clearInterval(hideInterval);
        return;
      }
  
      expItems[currentIndex-2].style.display = 'none';
    }
  
    var interval = setInterval(showNextExpItem, 5000);
    var hideInterval = setInterval(hideExpItem, 5000);
});
  
  