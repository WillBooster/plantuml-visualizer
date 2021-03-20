import $ from 'jquery';

import { Constants } from './constants';
import { PlantUmlEncoder } from './encoder/plantUmlEncoder';

const $root = $(document.body).find('div#popup');

function initPopup(): void {
  $root.find('button.puml-vis-toggle').on('click', () => {
    chrome.runtime.sendMessage({ command: Constants.commands.toggleExtensionEnabled }, updateExtensionEnabled);
  });
  $root.find('button.puml-vis-update-server-url').on('click', () => {
    const imgSrcUrl = $root.find('input').val();
    chrome.runtime.sendMessage({ command: Constants.commands.setImgSrcUrl, imgSrcUrl }, updateImgSrcUrl);
  });
  $root.find('p.puml-vis-loading').hide();
}

function updateExtensionEnabled(enabled: boolean): void {
  $root.find('button.puml-vis-toggle').text(`${enabled ? 'disable' : 'enable'} plantuml-visualizer`);
}

function updateImgSrcUrl(imgSrcUrl: string): void {
  if (!/^https:\/\/.*$/.test(imgSrcUrl)) {
    showImgSrcUrlError(imgSrcUrl, `${imgSrcUrl} does not match https://*`);
    return;
  }

  startLoading();
  (async () => {
    try {
      const res = await fetch(PlantUmlEncoder.getImageUrl(Constants.versionUmlText, imgSrcUrl));
      if (res.ok) updateImgSrcInfo(imgSrcUrl, await res.text());
      else showImgSrcUrlError(imgSrcUrl, `${imgSrcUrl} does not refer a valid plantUML serer`);
    } catch {
      showImgSrcUrlError(imgSrcUrl, `${imgSrcUrl} does not refer a valid plantUML serer`);
    } finally {
      endLoading();
    }
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
