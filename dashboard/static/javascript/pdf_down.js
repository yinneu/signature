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



// pdf 다운
// pdf_btn.addEventListener('click', downloadPdf);

// function downloadPdf() {
//   var paperSize = 'A2'; // 클라이언트에서 설정한 용지 크기
//   var marginTop = '40mm'; // 클라이언트에서 설정한 여백

//     // CSRF 토큰 가져오기
//     var csrfToken = Cookies.get('csrftoken');

//   $.ajax({
//     url: '/dashboard/download_template/',
//     method: 'POST',
//     data: {
//       paper_size: paperSize,
//       margin_top: marginTop
//     },
//     beforeSend: function(xhr, settings) {
//         // CSRF 토큰을 요청 헤더에 포함
//         xhr.setRequestHeader("X-CSRFToken", csrfToken);
//     },
//     success: function (response) {
//       var blob = new Blob([response], { type: 'application/pdf' });
//       var link = document.createElement('a');
//       link.href = window.URL.createObjectURL(blob);
//       link.download = 'output.pdf';
//       link.click();
//     },
//     error: function (error) {
//       console.error('PDF 다운로드 실패:', error);
//     }
//   });
// }



pdf_btn.addEventListener('click', () => {


    // pdf 다운
    console.log("pdf 다운")
    window.print();

})



// function downloadPdf() {
//     var paperSize = 'A2'; // 클라이언트에서 설정한 용지 크기
//     var marginTop = '40mm'; // 클라이언트에서 설정한 여백
  
//     $.ajax({
//       url: '/download_template/',
//       method: 'POST',
//       data: {
//         paper_size: paperSize,
//         margin_top: marginTop
//       },
//       success: function (response) {
//         var blob = new Blob([response], { type: 'application/pdf' });
//         var link = document.createElement('a');
//         link.href = window.URL.createObjectURL(blob);
//         link.download = 'output.pdf';
//         link.click();
//       },
//       error: function (error) {
//         console.error('PDF 다운로드 실패:', error);
//       }
//     });
//   }



