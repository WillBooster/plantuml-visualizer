import { Constants } from './constants';

const config = { ...Constants.defaultConfig };

chrome.storage.sync.get((storage) => {
  if (storage.extensionEnabled !== undefined) config.extensionEnabled = storage.extensionEnabled;
  if (storage.imgSrcUrl !== undefined) config.imgSrcUrl = storage.imgSrcUrl;
  chrome.browserAction.setIcon({ path: config.extensionEnabled ? 'icon/icon16.png' : 'icon/icon16gray.png' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.command) {
    case Constants.commands.getExtensionEnabled:
      sendResponse(config.extensionEnabled);
      break;
    case Constants.commands.getImgSrcUrl:
      sendResponse(config.imgSrcUrl);
      break;
    case Constants.commands.toggleExtensionEnabled:
      config.extensionEnabled = !config.extensionEnabled;
      sendResponse(config.extensionEnabled);
      chrome.storage.sync.set({ extensionEnabled: config.extensionEnabled });
      chrome.browserAction.setIcon({ path: config.extensionEnabled ? 'icon/icon16.png' : 'icon/icon16gray.png' });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) chrome.tabs.reload(tabs[0].id);
      });
      break;
    case Constants.commands.setImgSrcUrl:
      config.imgSrcUrl = request.imgSrcUrl;
      sendResponse(config.imgSrcUrl);
      chrome.storage.sync.set({ imgSrcUrl: config.imgSrcUrl });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) chrome.tabs.reload(tabs[0].id);
      });
      break;
  }
});
