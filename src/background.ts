import { Constants } from './constants';

let extensionEnabled = true;
let imgSrcUrl = Constants.defaultImgSrcUrl;

chrome.storage.sync.get((storage) => {
  if (storage.extensionEnabled !== undefined) {
    extensionEnabled = storage.extensionEnabled;
  }
  if (storage.imgSrcUrl !== undefined) {
    imgSrcUrl = storage.imgSrcUrl;
  }
  chrome.browserAction.setIcon({ path: extensionEnabled ? 'icon/icon16.png' : 'icon/icon16gray.png' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.command) {
    case Constants.commands.getExtensionEnabled:
      sendResponse(extensionEnabled);
      break;
    case Constants.commands.toggleExtensionEnabled:
      extensionEnabled = !extensionEnabled;
      sendResponse(extensionEnabled);
      chrome.storage.sync.set({ extensionEnabled });
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
      chrome.storage.sync.set({ imgSrcUrl });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) chrome.tabs.reload(tabs[0].id);
      });
      break;
  }
});
