import $ from 'jquery';

import { Constants } from './constants';

function initPopup(): void {
  const $root = $(document.body).find('div#popup').css('width', '300px').css('height', '100px');
  $root.append($('<p>').text('server: loading..'));
  $root.append($('<input>').css('width', '280px'));

  const button = $('<button>').text('update server');
  button.on('click', () => {
    const imgSrcUrl = $root.find('input').val();
    chrome.runtime.sendMessage({ command: Constants.commands.setImgSrcUrl, imgSrcUrl }, onUpdateImgSrcUrl);
  });
  $root.append(button);
}

function onUpdateImgSrcUrl(imgSrcUrl: string): void {
  const $root = $(document.body).find('div#popup');
  $root.find('p').text(`server: ${imgSrcUrl}`);
  $root.find('input').val(imgSrcUrl);
}

initPopup();
chrome.runtime.sendMessage({ command: Constants.commands.getImgSrcUrl }, onUpdateImgSrcUrl);
