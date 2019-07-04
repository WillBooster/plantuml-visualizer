import { Constants } from './Constants';

/**
 * This code rewrites response headers to allow this extension to embed images from www.plantuml.com
 */
chrome.webRequest.onHeadersReceived.addListener(
  details => {
    const headers = details.responseHeaders;
    if (headers) {
      for (const header of headers) {
        const name = header.name.toLowerCase();
        if (
          name !== 'content-security-policy' &&
          name !== 'content-security-policy-report-only' &&
          name !== 'x-webkit-csp'
        ) {
          continue;
        }
        if (header.value) {
          header.value = header.value.replace('img-src', `img-src ${Constants.imgSrcUrl}`);
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
chrome.browserAction.setIcon({ path: 'icon/icon16.png' });

chrome.browserAction.onClicked.addListener(tab => {
  extensionEnabled = !extensionEnabled;
  chrome.browserAction.setIcon({ path: extensionEnabled ? 'icon/icon16.png' : 'icon/icon16gray.png' });
  if (tab.id) chrome.tabs.reload(tab.id);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === Constants.toggleEnabled) {
    sendResponse(extensionEnabled);
  }
});
