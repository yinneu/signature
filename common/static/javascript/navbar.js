// common \ navbar.js

"use strict"

const navBtn = document.querySelector('.nav-bars');
const navBox = document.querySelector('.navbar-container');
const navList = document.querySelectorAll('.navbar-list');

navBtn.addEventListener('click', () => {
    navBox.classList.toggle("navbar-visible");
    // if (navList.style.height == 300) {
    navList.forEach(element => {
        element.classList.toggle("list-visible");
    });        
    // }
})