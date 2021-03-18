import $ from 'jquery';

import { Constants } from './constants';

function initPopup(): void {
  const $root = $(document.body).find('div#popup').css('width', '300px').css('height', '100px');

  const toggleButton = $('<button>').attr('data-puml-vis-toggle', '');
  toggleButton.on('click', () => {
    chrome.runtime.sendMessage({ command: Constants.commands.toggleExtensionEnabled }, updateExtensionEnabled);
  });
  $root.append(toggleButton);

  $root.append($('<p>'));
  $root.append($('<input>').css('width', '280px'));

  const updateServerButton = $('<button>').attr('data-puml-vis-update-server', '').text('update server');
  updateServerButton.on('click', () => {
    const imgSrcUrl = $root.find('input').val();
    chrome.runtime.sendMessage({ command: Constants.commands.setImgSrcUrl, imgSrcUrl }, updateImgSrcUrl);
  });
  $root.append(updateServerButton);
}

function updateExtensionEnabled(enabled: boolean): void {
  const $root = $(document.body).find('div#popup');
  $root.find('button[data-puml-vis-toggle]').text(`${enabled ? 'disable' : 'enable'} plantuml-visualizer`);
}

function updateImgSrcUrl(imgSrcUrl: string): void {
  const $root = $(document.body).find('div#popup');
  $root.find('p').text(`server: ${imgSrcUrl}`);
  $root.find('input').val(imgSrcUrl);
}

initPopup();
chrome.runtime.sendMessage({ command: Constants.commands.getExtensionEnabled }, updateExtensionEnabled);
chrome.runtime.sendMessage({ command: Constants.commands.getImgSrcUrl }, updateImgSrcUrl);
