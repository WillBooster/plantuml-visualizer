import { Finder, UmlContent } from './Finder';

export class RawFileFinder implements Finder {
  private readonly URL_REGEX = /^.*\.(plantuml|pu|puml)(\?.*)?$/;
  private readonly INCLUDE_REGEX = /!include\s+(.*\.(plantuml|pu|puml))/g;

  canFind(webPageUrl: string): boolean {
    return this.URL_REGEX.test(webPageUrl);
  }

  async find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlContent[]> {
    const $texts = $root.find('pre');
    const dirUrl = webPageUrl.replace(/\/[^/]*\.(plantuml|pu|puml)(\?.*)?$/, '');
    const result = [];
    for (let i = 0; i < Math.max($texts.length, 1); i++) {
      const $text = $texts.eq(i);
      let content = $text.text();
      if (content.indexOf('@startuml') < 0) continue;
      let match: RegExpExecArray | null = null;
      while ((match = this.INCLUDE_REGEX.exec(content))) {
        const includedFileTexts = await this.getIncludedFileTexts(`${dirUrl}/${match[1]}`);
        content = content.replace(match[0], ''.concat(...includedFileTexts));
      }
      result.push({ $text, text: content });
    }
    return result;
  }

  private async getIncludedFileTexts(fileUrl: string): Promise<string[]> {
    const response = await fetch(fileUrl);
    if (!response.ok) return [];
    const text = await response.text();
    return [text.replace(/@startuml/g, '').replace(/@enduml/g, '')];
  }
}
