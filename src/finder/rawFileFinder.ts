import { Constants } from '../constants';

import { CodeFinder, UmlCodeContent } from './finder';

export class RawFileFinder implements CodeFinder {
  private readonly URL_REGEX = /^.*\.(plantuml|pu|puml)(\?.*)?$/;
  private readonly INCLUDE_REGEX = /!include\s+(.*\.(plantuml|pu|puml))/g;

  canFind(webPageUrl: string): boolean {
    return this.URL_REGEX.test(webPageUrl);
  }

  async find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlCodeContent[]> {
    const $texts = $root.find(`pre:not([${Constants.ignoreAttribute}])`);
    const dirUrl = webPageUrl.replace(/\/[^/]*\.(plantuml|pu|puml)(\?.*)?$/, '');
    const result = [];
    for (let i = 0; i < Math.max($texts.length, 1); i++) {
      const $text = $texts.eq(i);
      let content = $text.text();
      if (content.indexOf('@startuml') < 0) continue;
      let match: RegExpExecArray | null = null;
      while ((match = this.INCLUDE_REGEX.exec(content))) {
        const includedFileText = await this.getIncludedFileText(`${dirUrl}/${match[1]}`);
        content = content.replace(match[0], includedFileText || '');
      }
      result.push({ $text, text: content });
    }
    return result;
  }

  private async getIncludedFileText(fileUrl: string): Promise<string | null> {
    const response = await fetch(fileUrl);
    if (!response.ok) return null;
    const text = await response.text();
    return text.replace(/@startuml/g, '').replace(/@enduml/g, '');
  }
}
