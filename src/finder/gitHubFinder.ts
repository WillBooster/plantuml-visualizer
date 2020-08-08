import $ from 'jquery';
import { DiffFinder, Finder, UmlContent, UmlDiffContent } from './finder';

export class GitHubCodeBlockFinder implements Finder {
  private readonly URL_REGEX = /^https:\/\/github\.com/;

  canFind(webPageUrl: string): boolean {
    return this.URL_REGEX.test(webPageUrl);
  }

  async find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlContent[]> {
    const $texts = $root.find('pre');
    const result = [];
    for (const text of $texts) {
      const content = (text.textContent || '').trim();
      if (content.startsWith('@startuml') && content.endsWith('@enduml')) {
        result.push({ $text: $(text), text: content });
      }
    }
    return result;
  }
}

export class GitHubFileViewFinder implements Finder {
  private readonly URL_REGEX = /^https:\/\/github\.com\/.*\/.*\.(plantuml|pu|puml)(\?.*)?$/;
  private readonly INCLUDE_REGEX = /^\s*!include\s+(.*\.(plantuml|pu|puml))\s*$/;

  canFind(webPageUrl: string): boolean {
    return this.URL_REGEX.test(webPageUrl);
  }

  async find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlContent[]> {
    const $texts = $root.find("div[itemprop='text']");
    const dirUrl = webPageUrl.replace(/\/[^/]*\.(plantuml|pu|puml)(\?.*)?$/, '');
    const result = [];
    for (let i = 0; i < $texts.length; i++) {
      const $text = $texts.eq(i);
      let fileText = '';
      const $fileLines = $text.find('tr');
      for (let i = 0; i < $fileLines.length; i++) {
        const lineText = $fileLines.eq(i).find("[id^='LC'").text();
        const match = this.INCLUDE_REGEX.exec(lineText);
        if (match != null) {
          const includedFileText = await this.getIncludedFileText(`${dirUrl}/${match[1]}`);
          fileText += includedFileText || '';
        } else {
          fileText += lineText + '\n';
        }
      }
      result.push({ $text, text: fileText });
    }
    return result;
  }

  private async getIncludedFileText(fileUrl: string): Promise<string | null> {
    const response = await fetch(fileUrl);
    if (!response.ok) return null;
    const htmlString = await response.text();
    const $body = $(new DOMParser().parseFromString(htmlString, 'text/html')).find('body');
    const contents = await this.find(fileUrl, $body);
    return contents.map((content) => content.text.replace(/@startuml/g, '').replace(/@enduml/g, '')).join('\n');
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

  private getDiffs($root: JQuery<Node>): JQuery<Node>[] {
    const $diffs = $root.find("div[id^='diff-']");
    const diffs = [];
    for (let i = 0; i < $diffs.length; i++) {
      diffs.push($diffs.eq(i));
    }
    return diffs;
  }

  private getBaseHeadBranchNames($root: JQuery<Node>): [string, string] {
    const getBranchNameSelector = (baseOrHead: 'base' | 'head'): string =>
      `span.commit-ref.css-truncate.user-select-contain.expandable.${baseOrHead}-ref `;
    'span.css-truncate-target';
    const $baseRef = $root.find(getBranchNameSelector('base'));
    const $headRef = $root.find(getBranchNameSelector('head'));
    return [$baseRef.text(), $headRef.text()];
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
      (baseFilePath == '' && headFilePath == '') ||
      $diffBlock.length == 0 ||
      $diffBlock.find('div.data.highlight.empty').length > 0
    ) {
      return {
        $diff: $(),
        baseBranchName,
        headBranchName,
        baseTexts: [],
        headTexts: [],
      };
    }
    const fileUrls = [
      blobRoot + '/' + baseBranchName + '/' + baseFilePath,
      blobRoot + '/' + headBranchName + '/' + headFilePath,
    ];
    const [baseTexts, headTexts] = await Promise.all(fileUrls.map((fileUrl) => this.getTexts(fileUrl)));
    return {
      $diff: $diffBlock,
      baseBranchName,
      headBranchName,
      baseTexts,
      headTexts,
    };
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
      if (filePath.match(/^.*\.(plantuml|pu|puml)$/)) {
        filePaths.push(filePath);
        filePath = '';
      } else {
        filePath += separator;
      }
    }
    if (filePaths.length == 1) return [filePaths[0], filePaths[0]];
    if (filePaths.length == 2) return [filePaths[0], filePaths[1]];
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
