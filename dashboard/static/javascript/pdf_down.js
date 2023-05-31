// dashboard \ pdf_down.js
// import { jsPDF } from "jspdf";
// const doc = new jsPDF();

const pdf_btn = document.querySelector('.down_btn');

// 출력 전 실행
window.onbeforeprint = function () { 
    $("#navbar").css("display", "none"); 

    $(".intro").css("margin-top", "40px"); 

    $(".down_pdf").css("display", "none"); 

    $("#data_aly").css("margin-top", "80px"); 

    $("#arrow-up").css("display", "none"); 

    $("#table_con").css("margin-top", "100px"); 

    // $("#security_rd").css("margin-top", "100px");
};


// 출력 후 실행
window.onafterprint = function () { 
      

    // 초기 body 복구 
    $("#navbar").css("display", "flex"); 

    $(".intro").css("margin-top", "116px"); 

    $(".down_pdf").css("display", "block"); 

    $("#data_aly").css("margin-top", "20px"); 

    $("#arrow-up").css("display", "block"); 

    $("#table_con").css("margin-top", "0"); 

    // $("#security_rd").css("margin-top", "20px");


}; 



// pdf_btn.addEventListener('click', () => {
//     // pdf 다운
//     console.log("dd")
//     window.print();

// })

pdf_btn.addEventListener('click', () => {
    // pdf 다운
    const mediaQueryList = window.matchMedia('print');
    const originalSize = {
        width: document.body.style.width,
        height: document.body.style.height
    };
    document.body.style.width = '420mm'; // A2 너비 (기본 단위는 mm입니다)
    document.body.style.height = '594mm'; // A2 높이 (기본 단위는 mm입니다)
    const listener = function (mql) {
        if (!mql.matches) {
            // 인쇄 취소 시 원래 크기로 복구
            document.body.style.width = originalSize.width;
            document.body.style.height = originalSize.height;
            mediaQueryList.removeEventListener('change', listener);
        }
    };
    mediaQueryList.addEventListener('change', listener);
    window.print();
});


