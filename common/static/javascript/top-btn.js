// common top-btn.js

const topBtn = document.querySelector('#arrow-up');

window.addEventListener('scroll', (e) => {
    let roll = window.scrollY;
    if (roll > 400) {
        topBtn.style.display = 'block';
    }else {
        topBtn.style.display = 'none';
    }
})


topBtn.addEventListener('click', () => {
    // body2.scrollTop(0)
    window.scrollTo({
        top: 100,
        left: 100,
        behavior: "smooth",
    });
})


// window.innerHeight