import $ from 'jquery';
import { UmlContent, Finder } from './Finder';

export class GenericFinder implements Finder {
  find(webPageUrl: string, $root: JQuery<Node>): UmlContent[] {
    if (webPageUrl.match('.*/(.*\\.pu)|(.*\\.puml)|(.*\\.plantuml)') == null) return [];
    const $texts = $root.find('pre');
    const result = [];
    for (let i = 0; i < Math.max($texts.length, 1); i++) {
      const $text = $texts.eq(i);
      const content = $text.text();
      if (content.indexOf('@startuml') > -1) result.push({ $text, text: content });
    }
    return result;
  }
}
