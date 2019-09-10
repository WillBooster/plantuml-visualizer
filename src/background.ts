import { Constants } from './Constants';

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
