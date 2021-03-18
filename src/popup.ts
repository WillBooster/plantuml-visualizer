import $ from 'jquery';

import { Constants } from './constants';
import { PlantUmlEncoder } from './encoder/plantUmlEncoder';

function initPopup(): void {
  const $root = $(document.body).find('div#popup').css('width', '500px');

  const toggleButton = $('<button>').attr('class', 'puml-vis-toggle');
  toggleButton.on('click', () => {
    chrome.runtime.sendMessage({ command: Constants.commands.toggleExtensionEnabled }, updateExtensionEnabled);
  });
  $root.append(toggleButton);

  $root.append($('<p>').attr('class', 'puml-vis-server-url'));
  $root.append($('<input>').css('width', '100%'));
  $root.append($('<p>').attr('class', 'puml-vis-error'));

  const updateServerButton = $('<button>').attr('class', 'puml-vis-update-server-url').text('update server');
  updateServerButton.on('click', () => {
    const imgSrcUrl = $root.find('input').val();
    chrome.runtime.sendMessage({ command: Constants.commands.setImgSrcUrl, imgSrcUrl }, updateImgSrcUrl);
  });
  $root.append(updateServerButton);

  $root.append($('<img>').css('width', '100%'));
}

function updateExtensionEnabled(enabled: boolean): void {
  const $root = $(document.body).find('div#popup');
  $root.find('button.puml-vis-toggle').text(`${enabled ? 'disable' : 'enable'} plantuml-visualizer`);
}

function updateImgSrcUrl(imgSrcUrl: string): void {
  const $root = $(document.body).find('div#popup');
  if (!/^https:\/\/.*$/.test(imgSrcUrl)) {
    $root.find('p.puml-vis-error').text(`${imgSrcUrl} does not match https://*`);
    return;
  }

  (async () => {
    const res = await fetch(PlantUmlEncoder.getImageUrl(Constants.versionUmlText, imgSrcUrl));
    if (res.ok) {
      const encoded = `data:image/svg+xml,${encodeURIComponent(await res.text())}`;
      $root.find('p.puml-vis-server-url').text(`server: ${imgSrcUrl}`);
      $root.find('input').val(imgSrcUrl);
      $root.find('img').attr('src', encoded);
      $root.find('p.puml-vis-error').text('');
    } else {
      $root.find('input').val(imgSrcUrl);
      $root.find('img').removeAttr('src');
      $root.find('p.puml-vis-error').text(`${imgSrcUrl} does not refer a valid plantUML serer`);
    }
  })().then();
}

initPopup();
chrome.runtime.sendMessage({ command: Constants.commands.getExtensionEnabled }, updateExtensionEnabled);
chrome.runtime.sendMessage({ command: Constants.commands.getImgSrcUrl }, updateImgSrcUrl);
