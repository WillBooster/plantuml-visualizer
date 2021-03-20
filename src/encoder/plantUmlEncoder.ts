import { deflate } from 'zlib.es';

import { Constants } from '../constants';

let pumlServerUrl = Constants.defaultConfig.pumlServerUrl;

chrome.runtime.sendMessage({ command: Constants.commands.getPumlServerUrl }, (url) => {
  pumlServerUrl = url;
});

export const PlantUmlEncoder = {
  getImageUrl(pumlContent: string, serverUrl: string = pumlServerUrl): string {
    const textEncoder = new TextEncoder();
    const encoded = encode64(deflate(textEncoder.encode(pumlContent)));
    return `${serverUrl}/svg/${encoded}`;
  },
};

function encode64(array: Uint8Array): string {
  const length = array.length - 3;
  let r = '';
  let i = 0;
  for (; i < length; i += 3) {
    r += append3bytes(array[i], array[i + 1], array[i + 2]);
  }
  if (length > -3) {
    r += append3bytes(array[i], array[i + 1] || 0, array[i + 2] || 0);
  }
  return r;
}

function append3bytes(code1: number, code2: number, code3: number): string {
  return (
    encode6bit(code1 >> 2) +
    encode6bit((code1 << 4) | (code2 >> 4)) +
    encode6bit((code2 << 2) | (code3 >> 6)) +
    encode6bit(code3)
  );
}

function encode6bit(code64: number): string {
  code64 &= 0x3f;
  if (code64 < 10) return String.fromCharCode(48 + code64);
  code64 -= 10;
  if (code64 < 26) return String.fromCharCode(65 + code64);
  code64 -= 26;
  if (code64 < 26) return String.fromCharCode(97 + code64);
  code64 -= 26;
  if (code64 === 0) return '-';
  if (code64 === 1) return '_';
  return '?';
}
