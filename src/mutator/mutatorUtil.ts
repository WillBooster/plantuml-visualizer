import $ from 'jquery';

import { Constants } from '../constants';
import { PlantUmlEncoder } from '../encoder/plantUmlEncoder';

export function markAsIgnore($content: JQuery<Node>): boolean {
  if ($content.attr(Constants.ignoreAttribute) !== undefined) {
    return false;
  }
  $content.attr(Constants.ignoreAttribute, '');
  return true;
}

async function digestMessage(message: string): Promise<string> {
  // see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
  const hashArray = [...new Uint8Array(hashBuffer)]; // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string

  return hashHex;
}

export async function markRenderRequested($text: JQuery<Node>, text: string): Promise<void> {
  const checksum = await digestMessage(text);
  $text.attr(Constants.checksumAttribute, checksum);
}

export async function isRerenderNeeded($text: JQuery<Node>, text: string): Promise<boolean | undefined> {
  const checksumFromImage = $text.attr(Constants.checksumAttribute);
  const checksum = await digestMessage(text);

  if (checksumFromImage === undefined) {
    return undefined;
  }

  return checksumFromImage !== checksum;
}

export async function textToImage(text: string): Promise<JQuery<HTMLElement>> {
  const $div = $('<div>').css('overflow', 'auto').css('padding', '4px 10px');
  const res = await fetch(PlantUmlEncoder.getImageUrl(text));
  const encoded = `data:image/svg+xml,${encodeURIComponent(await res.text())}`;
  return $div.append($('<img>').attr('src', encoded));
}

export async function textsToImages(texts: string[], noContentsMessage: string): Promise<JQuery<HTMLElement>[]> {
  if (texts.length === 0) {
    return [$(`<div>${noContentsMessage}</div>`)];
  }
  const ret = [];
  for (const text of texts) {
    ret.push(await textToImage(text));
  }
  return ret;
}

export function setDblclickHandlers($text: JQuery<Node>, $image: JQuery<Node>): void {
  $text.attr('data-testid', Constants.textTestIdAttribute);
  $image.attr('data-testid', Constants.imageTestIdAttribute);

  $text.off('dblclick');
  $text.on('dblclick', () => {
    $text.hide();
    $image.show();
  });
  $image.off('dblclick');
  $image.on('dblclick', () => {
    $image.hide();
    $text.show();
  });
  $text.trigger('dblclick');
}
