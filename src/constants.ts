import type { Config } from './config';

export const Constants = {
  defaultConfig: {
    extensionEnabled: true,
    pumlServerUrl: 'https://willbooster-plantuml.herokuapp.com',
    allowedUrls: [
      'https://github.com/*',
      'https://raw.githubusercontent.com/*',
      'https://gitlab.com/*',
      'https://gist.github.com/*',
      'file:///*/*',
    ],
    deniedUrls: ['https://plantuml.com*', 'https://github.com/*/edit/*'],
  } as Config,
  versionUmlText: ['@startuml', 'version', '@enduml'].join('\n'),
  ignoreAttribute: 'data-wb-ignore',
  commands: {
    getConfig: 'getConfig',
    getExtensionEnabled: 'getExtensionEnabled',
    getAllowedUrls: 'getAllowedUrls',
    getDeniedUrls: 'getDeniedUrls',
    getPumlServerUrl: 'getPumlServerUrl',
    toggleExtensionEnabled: 'toggleExtensionEnabled',
    setAllowedUrls: 'setAllowedUrls',
    setDeniedUrls: 'setDeniedUrls',
    setPumlServerUrl: 'setPumlServerUrl',
  },
} as const;
