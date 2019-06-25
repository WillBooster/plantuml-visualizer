import { UmlContent, Finder } from './Finder';

export class RawFileFinder implements Finder {
  private readonly URL_REGEX = /^.*\.(plantuml|pu|puml)$/;

  canFind(webPageUrl: string): boolean {
    return this.URL_REGEX.test(webPageUrl);
  }

  find(webPageUrl: string, $root: JQuery<Node>): UmlContent[] {
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
