import pako from 'pako';

export const ImageSrcPrefix = 'https://www.plantuml.com/plantuml/img/';

export const PlantUmlEncoder = {
  getImageUrl(umlString: string) {
    const encoded = encode64(pako.deflateRaw(umlString, { level: 9, to: 'string' }));
    return `${ImageSrcPrefix}${encoded}`;
  },
};

function encode64(data: string) {
  const length = data.length;
  data += '\0\0'; // tslint:disable-line:no-octal-literal
  let r = '';
  for (let i = 0; i < length; i += 3) {
    r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2));
  }
  return r;
}

function append3bytes(code1: number, code2: number, code3: number) {
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
  if (code64 == 0) return '-';
  if (code64 == 1) return '_';
  return '?';
}
