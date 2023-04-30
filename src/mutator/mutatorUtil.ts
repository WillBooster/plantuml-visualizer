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
