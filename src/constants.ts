import type { Config } from './config';

export const Constants = {
  defaultConfig: {
    extensionEnabled: true,
    pumlServerUrl: 'https://willbooster-plantuml.herokuapp.com',
    deniedUrls: ['https://plantuml.com*', 'https://github.com/*/edit/*'],
  } as Config,
  // allowList is defined in manifest.json as content_scripts.matches
  denyList: [/^https:\/\/github\.com\/.*\/edit\/.*/],
  versionUmlText: ['@startuml', 'version', '@enduml'].join('\n'),
  ignoreAttribute: 'data-wb-ignore',
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
