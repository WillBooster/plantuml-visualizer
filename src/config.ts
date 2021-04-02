export interface Config {
  extensionEnabled: boolean;
  pumlServerUrl: string;
  deniedUrls: string[];
}

export function deniedUrlToRegExp(deniedUrl: string): RegExp {
  return new RegExp(
    '^' +
      deniedUrl
        .split('*')
        .map((str) => str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1'))
        .join('.*') +
      '$'
  );
}
