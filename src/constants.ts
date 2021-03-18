export const Constants = {
  defaultConfig: {
    extensionEnabled: true,
    imgSrcUrl: 'https://willbooster-plantuml.herokuapp.com',
  },
  versionUmlText: ['@startuml', 'version', '@enduml'].join('\n'),
  ignoreAttribute: 'data-wb-ignore',
  urlRegexesToBeObserved: [/^https:\/\/github.com/],
  commands: {
    getExtensionEnabled: 'getExtensionEnabled',
    toggleExtensionEnabled: 'toggleExtensionEnabled',
    getImgSrcUrl: 'getImgSrcUrl',
    setImgSrcUrl: 'setImgSrcUrl',
  },
};
