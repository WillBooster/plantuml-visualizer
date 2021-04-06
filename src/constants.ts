export interface Config {
  extensionEnabled: boolean;
  pumlServerUrl: string;
}

export const Constants = {
  defaultConfig: {
    extensionEnabled: true,
    pumlServerUrl: 'https://willbooster-plantuml.herokuapp.com',
  } as Config,
  // allowList is defined in manifest.json as content_scripts.matches
  denyList: [/^https:\/\/github\.com\/.*\/edit\/.*/],
  versionUmlText: ['@startuml', 'version', '@enduml'].join('\n'),
  ignoreAttribute: 'data-wb-ignore',
  commands: {
    getConfig: 'getConfig',
    getExtensionEnabled: 'getExtensionEnabled',
    toggleExtensionEnabled: 'toggleExtensionEnabled',
    getPumlServerUrl: 'getPumlServerUrl',
    setPumlServerUrl: 'setPumlServerUrl',
  },
} as const;
