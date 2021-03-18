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

export function setDblclickHandlers($before: JQuery<Node>, $after: JQuery<Node>): void {
  $before.off('dblclick');
  $before.on('dblclick', () => {
    $before.hide();
    $after.show();
  });
  $after.off('dblclick');
  $after.on('dblclick', () => {
    $after.hide();
    $before.show();
  });
  $before.trigger('dblclick');
}
