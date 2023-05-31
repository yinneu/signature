const pdf_btn = document.querySelector('.down_btn');

// 출력 전 실행
// window.onbeforeprint = function () { 
//     $("#navbar").css("display", "none"); 

//     $(".intro").css("margin-top", "40px"); 

//     $(".down_pdf").css("display", "none"); 

//     $("#data_aly").css("margin-top", "80px"); 

//     $("#arrow-up").css("display", "none"); 

//     $("#table_con").css("margin-top", "100px"); 

//     // $("#security_rd").css("margin-top", "100px");
// };


// // 출력 후 실행
// window.onafterprint = function () { 
      

//     // 초기 body 복구 
//     $("#navbar").css("display", "flex"); 

//     $(".intro").css("margin-top", "116px"); 

//     $(".down_pdf").css("display", "block"); 

//     $("#data_aly").css("margin-top", "20px"); 

//     $("#arrow-up").css("display", "block"); 

//     $("#table_con").css("margin-top", "0"); 

//     // $("#security_rd").css("margin-top", "20px");


// }; 



pdf_btn.addEventListener('click', () => {


    // pdf 다운
    console.log("pdf 다운")
    window.print();

})



