import type { Config } from './config';

export const Constants = {
  defaultConfig: {
    extensionEnabled: true,
    pumlServerUrl: 'https://willbooster-plantuml.herokuapp.com',
    deniedUrls: ['https://github.com/*/edit/*'],
  } as Config,
  versionUmlText: ['@startuml', 'version', '@enduml'].join('\n'),
  ignoreAttribute: 'data-wb-ignore',
  urlsToBeObserved: [/^https?:\/\/.+$/, /^file:\/\/.+$/],
  commands: {
    getConfig: 'getConfig',
    getExtensionEnabled: 'getExtensionEnabled',
    getDeniedUrls: 'getDeniedUrls',
    getPumlServerUrl: 'getPumlServerUrl',
    toggleExtensionEnabled: 'toggleExtensionEnabled',
    setDeniedUrls: 'setDeniedUrls',
    setPumlServerUrl: 'setPumlServerUrl',
  },
} as const;
