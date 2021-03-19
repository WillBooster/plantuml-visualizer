import { Constants } from '../constants';

import { CodeFinder, UmlCodeContent } from './finder';

export class RawFileFinder implements CodeFinder {
  private readonly URL_REGEX = /^.*\.(plantuml|pu|puml|wsd)(\?.*)?$/;
  private readonly INCLUDE_REGEX = /!include\s+(.*\.(plantuml|pu|puml|wsd))/g;

  canFind(webPageUrl: string): boolean {
    return this.URL_REGEX.test(webPageUrl);
  }

  async find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlCodeContent[]> {
    const $texts = $root.find(`pre:not([${Constants.ignoreAttribute}])`);
    const result = [];
    for (let i = 0; i < $texts.length; i++) {
      const $text = $texts.eq(i);
      let content = $text.text();
      if (content.indexOf('@startuml') < 0 || content.indexOf('@enduml') < 0) continue;
      content = await this.preprocessIncludeDirective(webPageUrl, content);
      result.push({ $text, text: content });
    }
    return result;
  }

  private async preprocessIncludeDirective(webPageUrl: string, content: string): Promise<string> {
    const dirUrl = webPageUrl.replace(/\/[^/]*\.(plantuml|pu|puml|wsd)(\?.*)?$/, '');
    let match: RegExpExecArray | null = null;

    while ((match = this.INCLUDE_REGEX.exec(content))) {
      const includedText = await (async () => {
        const includedFileUrl = `${dirUrl}/${match[1]}`;
        const response = await fetch(includedFileUrl);
        if (!response.ok) return '';
        const text = await response.text();
        return text.replace(/@startuml/g, '').replace(/@enduml/g, '');
      })();
      content = content.replace(match[0], includedText);
    }

    return content;
  }
}
