export interface Config {
  extensionEnabled: boolean;
  pumlServerUrl: string;
  deniedUrlRegexes: string[];
}

export const Constants = {
  defaultConfig: {
    extensionEnabled: true,
    pumlServerUrl: 'https://willbooster-plantuml.herokuapp.com',
    deniedUrlRegexes: ['https://github\\.com/.*/edit/.*'],
  } as Config,
  versionUmlText: ['@startuml', 'version', '@enduml'].join('\n'),
  ignoreAttribute: 'data-wb-ignore',
  urlRegexesToBeObserved: [/^https?:\/\/.+$/, /^file:\/\/.+$/],
  commands: {
    getConfig: 'getConfig',
    getExtensionEnabled: 'getExtensionEnabled',
    getDeniedUrlRegexes: 'getDeniedUrlRegexes',
    getPumlServerUrl: 'getPumlServerUrl',
    toggleExtensionEnabled: 'toggleExtensionEnabled',
    setDeniedUrlRegexes: 'setDeniedUrlRegexes',
    setPumlServerUrl: 'setPumlServerUrl',
  },
} as const;
