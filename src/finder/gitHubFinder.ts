import $ from 'jquery';

import { Constants } from '../constants';

import { DiffFinder, CodeFinder, UmlCodeContent, UmlDiffContent } from './finder';
import { extractSubIncludedText } from './finderUtil';

export class GitHubFileViewFinder implements CodeFinder {
  private readonly URL_REGEX = /^https:\/\/github\.com\/.*\/.*\.(plantuml|pu|puml|wsd)(\?.*)?$/;
  private readonly EXCLUDING_URL_REGEX = /^https:\/\/github\.com\/.*\/edit\/.*/;
  private readonly INCLUDE_REGEX = /^\s*!include\s+(.*\.(plantuml|pu|puml|wsd))\s*$/;
  private readonly INCLUDESUB_REGEX = /^\s*!includesub\s+(.*\.(plantuml|pu|puml|wsd))!(.*)\s*$/;

  canFind(webPageUrl: string): boolean {
    return this.URL_REGEX.test(webPageUrl) && !this.EXCLUDING_URL_REGEX.test(webPageUrl);
  }

  async find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlCodeContent[]> {
    const $texts = $root.find(`div[itemprop='text']:not([${Constants.ignoreAttribute}])`);
    const result = [];
    for (let i = 0; i < $texts.length; i++) {
      const $text = $texts.eq(i);
      const $fileLines = $text.find('tr');
      let fileText = [...Array($fileLines.length).keys()]
        .map((lineno) => $fileLines.eq(lineno).find("[id^='LC'").text() + '\n')
        .join('');
      fileText = await this.preprocessIncludeDirective(webPageUrl, fileText);
      fileText = await this.preprocessIncludesubDirective(webPageUrl, fileText);
      result.push({ $text, text: fileText });
    }
    return result;
  }

  private async preprocessIncludeDirective(webPageUrl: string, fileText: string): Promise<string> {
    const fileTextLines = fileText.split('\n');
    const dirUrl = webPageUrl.replace(/\/[^/]*\.(plantuml|pu|puml|wsd)(\?.*)?$/, '');

    const preprocessedLines = [];
    for (const line of fileTextLines) {
      const match = this.INCLUDE_REGEX.exec(line);
      if (!match) {
        preprocessedLines.push(line);
        continue;
      }

      const includedFileUrl = `${dirUrl}/${match[1]}`;
      const response = await fetch(includedFileUrl);
      if (!response.ok) continue;
      const htmlString = await response.text();
      const $body = $(new DOMParser().parseFromString(htmlString, 'text/html')).find('body');
      const fileTexts = await this.find(includedFileUrl, $body);
      const includedText = fileTexts
        .map((fileText) => fileText.text.replace(/@startuml/g, '').replace(/@enduml/g, ''))
        .join('\n');
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
      const htmlString = await response.text();
      const $body = $(new DOMParser().parseFromString(htmlString, 'text/html')).find('body');
      const fileTexts = await this.find(includedFileUrl, $body);
      const includedText = fileTexts.map((fileText) => extractSubIncludedText(fileText.text, match[3])).join('\n');
      preprocessedLines.push(includedText);
    }

    return preprocessedLines.join('\n');
  }
}

export class GitHubPullRequestDiffFinder implements DiffFinder {
  private readonly URL_REGEX = /^https:\/\/github\.com\/.*\/pull\/\d+\/files/;

  canFind(webPageUrl: string): boolean {
    return this.URL_REGEX.test(webPageUrl);
  }

  async find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlDiffContent[]> {
    const blobRoot = webPageUrl.replace(/pull\/\d+\/files.*/, 'blob');
    const [baseBranchName, headBranchName] = this.getBaseHeadBranchNames($root);
    const diffs = this.getDiffs($root);
    const result = await Promise.all(
      diffs.map(($diff) => this.getDiffContent(blobRoot, baseBranchName, headBranchName, $diff))
    );
    return result.filter((content) => content.$diff.length > 0);
  }

  private getBaseHeadBranchNames($root: JQuery<Node>): [string, string] {
    const getBranchNameSelector = (baseOrHead: 'base' | 'head'): string =>
      `span.commit-ref.css-truncate.user-select-contain.expandable.${baseOrHead}-ref span.css-truncate-target`;
    const $baseRef = $root.find(getBranchNameSelector('base'));
    const $headRef = $root.find(getBranchNameSelector('head'));
    return [$baseRef.text(), $headRef.text()];
  }

  private getDiffs($root: JQuery<Node>): JQuery<Node>[] {
    const $diffs = $root.find(`div[id^='diff-']:not([${Constants.ignoreAttribute}])`);
    return [...Array($diffs.length).keys()].map((i) => $diffs.eq(i));
  }

  private async getDiffContent(
    blobRoot: string,
    baseBranchName: string,
    headBranchName: string,
    $diff: JQuery<Node>
  ): Promise<UmlDiffContent> {
    const [baseFilePath, headFilePath] = this.getBaseHeadFilePaths($diff);
    const $diffBlock = $diff.find('div.js-file-content.Details-content--hidden');
    if (
      (!baseFilePath && !headFilePath) ||
      $diffBlock.length === 0 ||
      $diffBlock.find('div.data.highlight.empty').length > 0
    ) {
      return { $diff: $(), baseBranchName, headBranchName, baseTexts: [], headTexts: [] };
    }
    const fileUrls = [
      blobRoot + '/' + baseBranchName + '/' + baseFilePath,
      blobRoot + '/' + headBranchName + '/' + headFilePath,
    ];
    const [baseTexts, headTexts] = await Promise.all(fileUrls.map((fileUrl) => this.getTexts(fileUrl)));
    return { $diff: $diffBlock, baseBranchName, headBranchName, baseTexts, headTexts };
  }

  private getBaseHeadFilePaths($diff: JQuery<Node>): [string, string] {
    const title = $diff.find('div.file-info a').attr('title');
    if (!title) return ['', ''];
    const separator = ' → ';
    const fragments = title.split(separator);
    const filePaths = [];
    let filePath = '';
    for (const fragment of fragments) {
      filePath += fragment;
      if (filePath.match(/^.*\.(plantuml|pu|puml|wsd)$/)) {
        filePaths.push(filePath);
        filePath = '';
      } else {
        filePath += separator;
      }
    }
    if (filePaths.length === 1) return [filePaths[0], filePaths[0]];
    if (filePaths.length === 2) return [filePaths[0], filePaths[1]];
    return ['', ''];
  }

  private async getTexts(fileUrl: string): Promise<string[]> {
    const response = await fetch(fileUrl);
    if (!response.ok) return [];
    const htmlString = await response.text();
    const $body = $(new DOMParser().parseFromString(htmlString, 'text/html')).find('body');
    const fileBlockFinder = new GitHubFileViewFinder();
    const contents = await fileBlockFinder.find(fileUrl, $body);
    return contents.map((content) => content.text);
  }
}
