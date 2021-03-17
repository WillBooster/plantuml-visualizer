import { Constants } from './constants';

let imgSrcUrl = Constants.defaultImgSrcUrl;
let extensionEnabled = true;
chrome.browserAction.setIcon({ path: 'icon/icon16.png' });

chrome.browserAction.onClicked.addListener((tab) => {
  extensionEnabled = !extensionEnabled;
  chrome.browserAction.setIcon({ path: extensionEnabled ? 'icon/icon16.png' : 'icon/icon16gray.png' });
  if (tab.id) chrome.tabs.reload(tab.id);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === Constants.commands.checkExtensionEnabled) {
    sendResponse(extensionEnabled);
  } else if (request.command === Constants.commands.getImgSrcUrl) {
    sendResponse(imgSrcUrl);
  } else if (request.command === Constants.commands.setImgSrcUrl) {
    imgSrcUrl = request.imgSrcUrl;
    sendResponse(imgSrcUrl);
  }
});
