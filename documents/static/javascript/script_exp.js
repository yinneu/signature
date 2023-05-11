/** document \ script_exp.js */
"use strict"

// 코드 박스 (Code copy)
const codeBlocks = document.querySelectorAll('.code-box');
codeBlocks.forEach((block) => {
  const code = block.querySelector('code');
  const copyButton = block.querySelector('.copy-button');

  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(code.innerText)
    .then(() => {

      copyButton.innerHTML = "Copied!"
      setTimeout(() => {
        copyButton.innerHTML = "Copy";
      }, 1000);

    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    })
  });
});


// 네트워크 트래픽 캡쳐 스크립트 다운로드
const download =  document.querySelectorAll('.download');
download.forEach((block) => {

  block.addEventListener('click',() => {

    window.location.href = '/file_download';

  });
});