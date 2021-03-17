import { Constants } from './constants';

let imgSrcUrl = Constants.defaultImgSrcUrl;
let extensionEnabled = true;
chrome.browserAction.setIcon({ path: 'icon/icon16.png' });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.command) {
    case Constants.commands.getExtensionEnabled:
      sendResponse(extensionEnabled);
      break;
    case Constants.commands.toggleExtensionEnabled:
      extensionEnabled = !extensionEnabled;
      sendResponse(extensionEnabled);
      chrome.browserAction.setIcon({ path: extensionEnabled ? 'icon/icon16.png' : 'icon/icon16gray.png' });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) chrome.tabs.reload(tabs[0].id);
      });
      break;
    case Constants.commands.getImgSrcUrl:
      sendResponse(imgSrcUrl);
      break;
    case Constants.commands.setImgSrcUrl:
      imgSrcUrl = request.imgSrcUrl;
      sendResponse(imgSrcUrl);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) chrome.tabs.reload(tabs[0].id);
      });
      break;
  }
});
