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

    // $("#security_rd").css("margin-top", "1000px");
};


// 출력 후 실행
window.onafterprint = function () { 
      

    // 초기 body 복구 
    $("#navbar").css("display", "flex"); 

    $(".intro").css("margin-top", "116px"); 

    $(".down_pdf").css("display", "block"); 

    $("#data_aly").css("margin-top", "20px"); 

    // $("#security_rd").css("margin-top", "20px");


}; 



pdf_btn.addEventListener('click', () => {
    // pdf 다운
    console.log("dd")
    window.print();

})


