import $ from 'jquery';

import { INCLUDE_REGEX, INCLUDESUB_REGEX } from '../../directiveRegexes';
import type { CodeFinder, UmlCodeContent } from '../finder';
import { extractSubIncludedText } from '../finderUtil';

export class GitHubFileViewFinder implements CodeFinder {
  private readonly URL_REGEX = /^https:\/\/github\.com\/.*\/.*\.(plantuml|pu|puml|wsd)(\?.*)?$/;

  canFind(webPageUrl: string): boolean {
    return this.URL_REGEX.test(webPageUrl);
  }

  async findContents(webPageUrl: string, $root: JQuery<Node>): Promise<UmlCodeContent[]> {
    const result = [];

    // the div we want to replace with an image only has a generated class name ("eRkHwF")
    // -> trying to use .react-code-file-contents from the descendant div 3 levels down
    const $text = $root.find(`div.react-code-file-contents`).parent().parent().parent().first();

    // In case DOM has already been processed by react
    // a textarea has appeared containing the full file source
    const $textarea = $text.find('textarea#read-only-cursor-text-area');
    let fileText = $textarea.text();

    fileText = await this.preprocessIncludeDirective(webPageUrl, fileText);
    fileText = await this.preprocessIncludeSubDirective(webPageUrl, fileText);
    result.push({ $text, text: fileText });

    return result;
  }

  private async preprocessIncludeDirective(webPageUrl: string, fileText: string): Promise<string> {
    const fileTextLines = fileText.split('\n');
    const dirUrl = webPageUrl.replace(/\/[^/]*\.(plantuml|pu|puml|wsd)(\?.*)?$/, '');

    const preprocessedLines = [];
    for (const line of fileTextLines) {
      const match = INCLUDE_REGEX.exec(line);
      if (!match) {
        preprocessedLines.push(line);
        continue;
      }

      const includedFileUrl = `${dirUrl}/${match[1]}`;
      // enforce text/html response to prevent github from replying with a json
      const headers = { Accept: 'text/html' };
      const response = await fetch(includedFileUrl, { headers });
      if (!response.ok) {
        preprocessedLines.push(line);
        continue;
      }
      const htmlString = await response.text();
      const $body = $(new DOMParser().parseFromString(htmlString, 'text/html')).find('body');
      const fileTexts = await this.findContents(includedFileUrl, $body);
      const includedText = fileTexts
        .map((fileText) => fileText.text.replaceAll('@startuml', '').replaceAll('@enduml', ''))
        .join('\n');
      preprocessedLines.push(includedText);
    }

    return preprocessedLines.join('\n');
  }

  private async preprocessIncludeSubDirective(webPageUrl: string, content: string): Promise<string> {
    const contentLines = content.split('\n');
    const dirUrl = webPageUrl.replace(/\/[^/]*\.(plantuml|pu|puml|wsd)(\?.*)?$/, '');

    const preprocessedLines = [];
    for (const line of contentLines) {
      const match = INCLUDESUB_REGEX.exec(line);
      if (!match) {
        preprocessedLines.push(line);
        continue;
      }

      const includedFileUrl = `${dirUrl}/${match[1]}`;
      // enforce text/html response to prevent github from replying with a json
      const headers = { Accept: 'text/html' };
      const response = await fetch(includedFileUrl, { headers });
      if (!response.ok) {
        preprocessedLines.push(line);
        continue;
      }
      const htmlString = await response.text();
      const $body = $(new DOMParser().parseFromString(htmlString, 'text/html')).find('body');
      const fileTexts = await this.findContents(includedFileUrl, $body);
      const includedText = fileTexts.map((fileText) => extractSubIncludedText(fileText.text, match[3])).join('\n');
      preprocessedLines.push(includedText);
    }

    return preprocessedLines.join('\n');
  }
}
