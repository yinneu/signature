// document \ network_exp.js

"use strict"

// 카테고리와 콘텐츠를 변수에 저장
const categoriesBtn = document.querySelectorAll('.category p');
const categories = document.querySelectorAll('.category')
const contents = document.querySelectorAll('.content-container .content');


// 카테고리를 클릭할 때마다 콘텐츠를 필터링하는 함수
function filterContents(event) {
    // 선택된 카테고리의 data-category 값을 가져옴
    const category = event.target.parentElement.dataset.category;


    // 모든 카테고리와 콘텐츠를 초기화
    categories.forEach(category => {
        category.classList.remove('active');
        category.style.width = '32px';
    });
    contents.forEach(content => {
        content.style.display = 'none';
    });

    // 선택된 카테고리에 active 클래스를 추가하고 해당하는 콘텐츠만 보여줌
    event.target.parentElement.classList.add('active');

    var filteredContent = document.querySelector(`.content[data-category="${category}"]`);
    var filterCategory = document.querySelector(`li[data-category="${category}"]`);
    filteredContent.style.display = 'block';
    filterCategory.style.width = '48px';
}

// 각 카테고리에 클릭 이벤트를 추가
categoriesBtn.forEach(category => {
    category.addEventListener('click', filterContents);
});

// 초기 화면 설정
// categories[0].classList.add('active');
contents[0].style.display = 'block';

  