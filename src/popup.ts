import $ from 'jquery';

import { Constants } from './constants';
import { PlantUmlEncoder } from './encoder/plantUmlEncoder';

const $root = $(document.body).find('#popup');

function initPopup(): void {
  $root.find('.puml-vis-toggle').on('click', () => {
    chrome.runtime.sendMessage({ command: Constants.commands.toggleExtensionEnabled }, renderExtensionEnabled);
  });
  $root.find('.puml-vis-update-server-url').on('click', () => {
    let pumlServerUrl = $root.find('input').val()?.toString() || '';
    if (pumlServerUrl.endsWith('/')) {
      pumlServerUrl = pumlServerUrl.substring(0, pumlServerUrl.length - 1);
    }
    $root.find('input').val(pumlServerUrl);
    chrome.runtime.sendMessage({ command: Constants.commands.setPumlServerUrl, pumlServerUrl }, renderPumlServerUrl);
  });
  $root.find('.puml-vis-loading').hide();
}

function renderExtensionEnabled(enabled: boolean): void {
  $root.find('.puml-vis-toggle').text(`${enabled ? 'Disable' : 'Enable'} PlantUML visualization`);
}

function renderPumlServerUrl(pumlServerUrl: string): void {
  if (!/^https:\/\/.*$/.test(pumlServerUrl)) {
    showPumlServerUrlError(pumlServerUrl, `${pumlServerUrl} does not match https://*`);
    return;
  }

  startLoading();
  (async () => {
    try {
      const res = await fetch(PlantUmlEncoder.getImageUrl(Constants.versionUmlText, pumlServerUrl));
      if (res.ok) renderImgSrcInfo(pumlServerUrl, await res.text());
      else showPumlServerUrlError(pumlServerUrl, `${pumlServerUrl} does not refer a valid plantUML serer`);
    } catch {
      showPumlServerUrlError(pumlServerUrl, `${pumlServerUrl} does not refer a valid plantUML serer`);
    } finally {
      endLoading();
    }
  })().then();
}

function renderImgSrcInfo(pumlServerUrl: string, versionUmlText: string): void {
  const encoded = `data:image/svg+xml,${encodeURIComponent(versionUmlText)}`;
  $root.find('.puml-vis-server-url').text(`Current value: ${pumlServerUrl}`);
  $root.find('input').val(pumlServerUrl);
  $root.find('.puml-vis-error').text('');
  $root.find('img').attr('src', encoded);
}

function startLoading(): void {
  $root.find('.puml-vis-server-url').hide();
  $root.find('input').hide();
  $root.find('.puml-vis-error').hide();
  $root.find('button.puml-vis-update-server-url').hide();
  $root.find('img').hide();
  $root.find('.puml-vis-loading').show();
}

function endLoading(): void {
  $root.find('.puml-vis-server-url').show();
  $root.find('input').show();
  $root.find('.puml-vis-error').show();
  $root.find('.puml-vis-update-server-url').show();
  $root.find('img').show();
  $root.find('.puml-vis-loading').hide();
}

function showPumlServerUrlError(pumlServerUrl: string, message: string): void {
  $root.find('input').val(pumlServerUrl);
  $root.find('.puml-vis-error').text(message);
  $root.find('img').removeAttr('src');
}

initPopup();
chrome.runtime.sendMessage({ command: Constants.commands.getExtensionEnabled }, renderExtensionEnabled);
chrome.runtime.sendMessage({ command: Constants.commands.getPumlServerUrl }, renderPumlServerUrl);
