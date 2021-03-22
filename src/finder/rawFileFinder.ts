import { Constants } from '../constants';

import { CodeFinder, UmlCodeContent } from './finder';
import { extractSubIncludedText } from './finderUtil';

export class RawFileFinder implements CodeFinder {
  private readonly URL_REGEX = /^.*\.(plantuml|pu|puml|wsd)(\?.*)?$/;
  private readonly INCLUDE_REGEX = /^\s*!include\s+(.*\.(plantuml|pu|puml|wsd))\s*$/;
  private readonly INCLUDESUB_REGEX = /^\s*!includesub\s+(.*\.(plantuml|pu|puml|wsd))!(.*)\s*$/;

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
      content = await this.preprocessIncludesubDirective(webPageUrl, content);
      result.push({ $text, text: content });
    }
    return result;
  }

  private async preprocessIncludeDirective(webPageUrl: string, content: string): Promise<string> {
    const contentLines = content.split('\n');
    const dirUrl = webPageUrl.replace(/\/[^/]*\.(plantuml|pu|puml|wsd)(\?.*)?$/, '');

    const preprocessedLines = [];
    for (const line of contentLines) {
      const match = this.INCLUDE_REGEX.exec(line);
      if (!match) {
        preprocessedLines.push(line);
        continue;
      }

      const includedFileUrl = `${dirUrl}/${match[1]}`;
      const response = await fetch(includedFileUrl);
      if (!response.ok) continue;
      let text = await response.text();
      text = await this.preprocessIncludeDirective(includedFileUrl, text);
      text = await this.preprocessIncludesubDirective(includedFileUrl, text);
      const includedText = text.replace(/@startuml/g, '').replace(/@enduml/g, '');
      preprocessedLines.push(includedText);
    }

    return preprocessedLines.join('\n');
  }

  private async preprocessIncludesubDirective(webPageUrl: string, content: string): Promise<string> {
    const contentLines = content.split('\n');
    const dirUrl = webPageUrl.replace(/\/[^/]*\.(plantuml|pu|puml|wsd)(\?.*)?$/, '');

    const preprocessedLines = [];
    for (const line of contentLines) {
      const match = this.INCLUDESUB_REGEX.exec(line);
      if (!match) {
        preprocessedLines.push(line);
        continue;
      }

      const includedFileUrl = `${dirUrl}/${match[1]}`;
      const response = await fetch(includedFileUrl);
      if (!response.ok) continue;
      let text = await response.text();
      text = await this.preprocessIncludeDirective(includedFileUrl, text);
      text = await this.preprocessIncludesubDirective(includedFileUrl, text);
      const includedText = extractSubIncludedText(text, match[3]);
      preprocessedLines.push(includedText);
    }

    return preprocessedLines.join('\n');
  }
}
