import type { Config } from './config';
import { Constants } from './constants';

let config = { ...Constants.defaultConfig };

chrome.storage.sync.get((storage: Partial<Config>) => {
  if (storage.extensionEnabled !== undefined) config.extensionEnabled = storage.extensionEnabled;
  if (storage.allowedUrls !== undefined) config.allowedUrls = storage.allowedUrls;
  if (storage.deniedUrls !== undefined) config.deniedUrls = storage.deniedUrls;
  if (storage.pumlServerUrl !== undefined) config.pumlServerUrl = storage.pumlServerUrl;
  setIcon();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.command) {
    case Constants.commands.getConfig: {
      sendResponse(config);
      break;
    }
    case Constants.commands.getExtensionEnabled: {
      sendResponse(config.extensionEnabled);
      break;
    }
    case Constants.commands.getAllowedUrls: {
      sendResponse(config.allowedUrls);
      break;
    }
    case Constants.commands.getDeniedUrls: {
      sendResponse(config.deniedUrls);
      break;
    }
    case Constants.commands.getPumlServerUrl: {
      sendResponse(config.pumlServerUrl);
      break;
    }
    case Constants.commands.setConfig: {
      config = request.config;
      sendResponse(config);
      chrome.storage.sync.set(config);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) chrome.tabs.reload(tabs[0].id);
      });
      break;
    }
    case Constants.commands.toggleExtensionEnabled: {
      config.extensionEnabled = !config.extensionEnabled;
      sendResponse(config.extensionEnabled);
      void chrome.storage.sync.set({ extensionEnabled: config.extensionEnabled });
      setIcon();
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) void chrome.tabs.reload(tabs[0].id);
      });
      break;
    }
    case Constants.commands.setAllowedUrls: {
      config.allowedUrls = request.allowedUrls;
      sendResponse(config.allowedUrls);
      void chrome.storage.sync.set({ allowedUrls: config.allowedUrls });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) void chrome.tabs.reload(tabs[0].id);
      });
      break;
    }
    case Constants.commands.setDeniedUrls: {
      config.deniedUrls = request.deniedUrls;
      sendResponse(config.deniedUrls);
      void chrome.storage.sync.set({ deniedUrls: config.deniedUrls });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) void chrome.tabs.reload(tabs[0].id);
      });
      break;
    }
    case Constants.commands.setPumlServerUrl: {
      config.pumlServerUrl = request.pumlServerUrl;
      sendResponse(config.pumlServerUrl);
      void chrome.storage.sync.set({ pumlServerUrl: config.pumlServerUrl });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) void chrome.tabs.reload(tabs[0].id);
      });
      break;
    }
  }
});

function setIcon(): void {
  chrome.browserAction.setIcon({ path: config.extensionEnabled ? 'icon/icon16.png' : 'icon/icon16gray.png' }, () => {
    // do nothing
  });
}
