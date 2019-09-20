import $ from 'jquery';
import { PlantUmlEncoder } from '../encoder/PlantUmlEncoder';

const attrNameForAvoidingDuplicates = 'data-puml-vis';

export function markAsAlreadyProcessed($content: JQuery<Node>): boolean {
  if ($content.attr(attrNameForAvoidingDuplicates) !== undefined) {
    return false;
  }
  $content.attr(attrNameForAvoidingDuplicates, '');
  return true;
}

export async function textToImage(text: string): Promise<JQuery<HTMLElement>> {
  const $div = $('<div>')
    .css('overflow', 'auto')
    .css('padding', '4px 10px');
  const res = await fetch(PlantUmlEncoder.getImageUrl(text));
  const encoded = `data:image/svg+xml,${encodeURIComponent(await res.text())}`;
  return $div.append($('<img>').attr('src', encoded));
}

export async function textsToImages(texts: string[], noContentsMessage: string): Promise<JQuery<HTMLElement>[]> {
  if (texts.length == 0) {
    return [$(`<div>${noContentsMessage}</div>`)];
  }
  const ret = [];
  for (const text of texts) {
    ret.push(await textToImage(text));
  }
  return ret;
}
