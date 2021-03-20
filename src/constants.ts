export interface Config {
  extensionEnabled: boolean;
  pumlServerUrl: string;
}

export const Constants = {
  defaultConfig: {
    extensionEnabled: true,
    pumlServerUrl: 'https://willbooster-plantuml.herokuapp.com',
  } as Config,
  versionUmlText: ['@startuml', 'version', '@enduml'].join('\n'),
  ignoreAttribute: 'data-wb-ignore',
  urlRegexesToBeObserved: [/^https:\/\/github.com/],
  commands: {
    getConfig: 'getConfig',
    getExtensionEnabled: 'getExtensionEnabled',
    toggleExtensionEnabled: 'toggleExtensionEnabled',
    getPumlServerUrl: 'getPumlServerUrl',
    setPumlServerUrl: 'setPumlServerUrl',
  },
} as const;
