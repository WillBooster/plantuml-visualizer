export interface Config {
  extensionEnabled: boolean;
  pumlServerUrl: string;
  allowedUrls: string[];
  deniedUrls: string[];
}

export function urlToRegExp(deniedUrl: string): RegExp {
  return new RegExp(
    '^' +
      deniedUrl
        .split('*')
        .map((str) => str.replaceAll(/([!$()*+./:=?[\\\]^{|}])/g, '\\$1'))
        .join('.*') +
      '$'
  );
}
