import $ from 'jquery';

import { Constants } from './constants';
import { PlantUmlEncoder } from './encoder/plantUmlEncoder';

const $root = $(document.body).find('div#popup');

function initPopup(): void {
  $root.css('width', '500px');
  const toggleButton = $('<button>').attr('class', 'puml-vis-toggle').css('margin-bottom', '10px');
  const serverUrlBox = $('<p>').attr('class', 'puml-vis-server-url');
  const serverUrlInput = $('<input>').css('width', '100%');
  const errorBox = $('<p>').attr('class', 'puml-vis-error');
  const updateServerButton = $('<button>').attr('class', 'puml-vis-update-server-url').text('update server');
  const versionUmlImg = $('<img>').css('width', '100%');
  const loadingBox = $('<p>').attr('class', 'puml-vis-loading').text('Loading...');

  $root.append(toggleButton, serverUrlBox, serverUrlInput, errorBox, updateServerButton, versionUmlImg, loadingBox);
  loadingBox.hide();

  toggleButton.on('click', () => {
    chrome.runtime.sendMessage({ command: Constants.commands.toggleExtensionEnabled }, updateExtensionEnabled);
  });
  updateServerButton.on('click', () => {
    const imgSrcUrl = $root.find('input').val();
    chrome.runtime.sendMessage({ command: Constants.commands.setImgSrcUrl, imgSrcUrl }, updateImgSrcUrl);
  });
}

function updateExtensionEnabled(enabled: boolean): void {
  $root.find('button.puml-vis-toggle').text(`${enabled ? 'disable' : 'enable'} plantuml-visualizer`);
}

function updateImgSrcUrl(imgSrcUrl: string): void {
  if (!/^https:\/\/.*$/.test(imgSrcUrl)) {
    showImgSrcUrlError(imgSrcUrl, `${imgSrcUrl} does not match https://*`);
    return;
  }

  (async () => {
    startLoading();
    const res = await fetch(PlantUmlEncoder.getImageUrl(Constants.versionUmlText, imgSrcUrl));
    if (!res.ok) showImgSrcUrlError(imgSrcUrl, `${imgSrcUrl} does not refer a valid plantUML serer`);
    updateImgSrcInfo(imgSrcUrl, await res.text());
    endLoading();
  })().then();
}

function updateImgSrcInfo(imgSrcUrl: string, versionUmlText: string): void {
  const encoded = `data:image/svg+xml,${encodeURIComponent(versionUmlText)}`;
  $root.find('p.puml-vis-server-url').text(`server: ${imgSrcUrl}`);
  $root.find('input').val(imgSrcUrl);
  $root.find('p.puml-vis-error').text('');
  $root.find('img').attr('src', encoded);
}

function startLoading(): void {
  $root.find('p.puml-vis-server-url').hide();
  $root.find('input').hide();
  $root.find('p.puml-vis-error').hide();
  $root.find('button.puml-vis-update-server-url').hide();
  $root.find('img').hide();
  $root.find('p.puml-vis-loading').show();
}

function endLoading(): void {
  $root.find('p.puml-vis-server-url').show();
  $root.find('input').show();
  $root.find('p.puml-vis-error').show();
  $root.find('button.puml-vis-update-server-url').show();
  $root.find('img').show();
  $root.find('p.puml-vis-loading').hide();
}

function showImgSrcUrlError(imgSrcUrl: string, message: string): void {
  $root.find('input').val(imgSrcUrl);
  $root.find('p.puml-vis-error').text(message);
  $root.find('img').removeAttr('src');
}

initPopup();
chrome.runtime.sendMessage({ command: Constants.commands.getExtensionEnabled }, updateExtensionEnabled);
chrome.runtime.sendMessage({ command: Constants.commands.getImgSrcUrl }, updateImgSrcUrl);
