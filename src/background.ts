import { Constants } from './Constants';

/**
 * This code rewrites response headers to allow this extension to embed images from www.plantuml.com
 */
chrome.webRequest.onHeadersReceived.addListener(
  details => {
    const headers = details.responseHeaders;
    if (headers) {
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const name = header.name.toLowerCase();
        if (
          name !== 'content-security-policy' &&
          name !== 'content-security-policy-report-only' &&
          name !== 'x-webkit-csp'
        ) {
          continue;
        }
        if (header.value) {
          header.value = header.value.replace('img-src', 'img-src www.plantuml.com');
        }
        return { responseHeaders: details.responseHeaders };
      }
    }
  },
  {
    urls: ['*://*/*'],
    types: ['main_frame', 'sub_frame'],
  },
  ['blocking', 'responseHeaders']
);

let extensionEnabled = true;
chrome.browserAction.setBadgeText({ text: 'ON' });

chrome.browserAction.onClicked.addListener(tab => {
  extensionEnabled = !extensionEnabled;
  chrome.browserAction.setBadgeText({ text: extensionEnabled ? 'ON' : '' });
  if (tab.id) chrome.tabs.reload(tab.id);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === Constants.toggleEnabled) {
    sendResponse(extensionEnabled);
  }
});
