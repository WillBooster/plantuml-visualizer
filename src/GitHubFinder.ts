import $ from 'jquery';
import { PlantUmlContent, Finder, PlantUmlDiffContent, DiffFinder } from './Finder';

export class GitHubCodeBlockFinder implements Finder {
  find(webPageUrl: string, $root: JQuery<Node>): PlantUmlContent[] {
    if (webPageUrl.match('https://github\\.com.*') == null) return [];

    const $texts = $root.find("pre[lang='pu'],pre[lang='uml'],pre[lang='puml']");
    const result = [];
    for (let i = 0; i < $texts.length; i++) {
      const $text = $texts.eq(i);
      result.push({ $text, text: $text.text() });
    }
    return result;
  }
}

export class GitHubFileBlockFinder implements Finder {
  find(webPageUrl: string, $root: JQuery<Node>): PlantUmlContent[] {
    if (webPageUrl.match('https://github\\.com/.*/(.*\\.pu)|(.*\\.puml)|(.*\\.plantuml)') == null) return [];
    const $texts = $root.find("div[itemprop='text']");
    const result = [];
    for (let i = 0; i < $texts.length; i++) {
      const $text = $texts.eq(i);
      let fileText = '';
      const $fileLines = $text.find('tr');
      for (let i = 0; i < $fileLines.length; i++) {
        fileText +=
          $fileLines
            .eq(i)
            .find("[id^='LC'")
            .text() + '\n';
      }
      result.push({ $text, text: fileText });
    }
    return result;
  }
}

export class GitHubPullRequestDiffFinder implements DiffFinder {
  async find(webPageUrl: string, $root: JQuery<Node>): Promise<PlantUmlDiffContent[]> {
    if (webPageUrl.match('https://github\\.com/.*/pull/\\d+/files.*') == null) return [];
    const baseHeadRoot = this.getBaseHeadRoot(webPageUrl, $root);
    const $diffs = $root.find("div[id^='diff-']");
    const diffArray = [];
    for (let i = 0; i < $diffs.length; i++) {
      diffArray.push($diffs.eq(i));
    }
    const result = await Promise.all(diffArray.map($diff => this.getDiffContent(baseHeadRoot, $diff)));
    return result.filter(content => content.$diff.length > 0);
  }

  private getBaseHeadRoot(webPageUrl: string, $root: JQuery<Node>): string[] {
    const blobUrl = webPageUrl.replace(/pull\/\d+\/files.*/, 'blob');
    const tableObjectTagName = "div[class='TableObject-item TableObject-item--primary']";
    const baseRefTagName = "span[class='commit-ref css-truncate user-select-contain expandable base-ref']";
    const headRefTagName = "span[class='commit-ref css-truncate user-select-contain expandable head-ref']";
    const $baseRef = $root.find(tableObjectTagName + ' ' + baseRefTagName);
    const $headRef = $root.find(tableObjectTagName + ' ' + headRefTagName);
    return [blobUrl + '/' + $baseRef.text(), blobUrl + '/' + $headRef.text()];
  }

  private async getDiffContent(baseHeadRoot: string[], $diff: JQuery<Node>): Promise<PlantUmlDiffContent> {
    const filePath = $diff.find("div[class='file-info'] a").text();
    const $diffBlock = $diff.find("div[class='data highlight js-blob-wrapper ']");
    if (filePath.match('(.*\\.pu)|(.*\\.puml)|(.*\\.plantuml)') == null || $diffBlock.length == 0) {
      return { $diff: $(), baseTexts: [], headTexts: [] };
    }
    const baseHeadTexts = await Promise.all(baseHeadRoot.map(root => this.getTexts(root + '/' + filePath)));
    return { $diff: $diffBlock, baseTexts: baseHeadTexts[0], headTexts: baseHeadTexts[1] };
  }

  private async getTexts(fileUrl: string): Promise<string[]> {
    const response = await fetch(fileUrl);
    const htmlString = await response.text();
    const $body = $(new DOMParser().parseFromString(htmlString, 'text/html')).find('body');
    const contents = await new GitHubFileBlockFinder().find(fileUrl, $body);
    return contents.map(content => content.text);
  }
}
