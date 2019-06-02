import $ from 'jquery';
import { PlantUmlContent, Finder } from './Finder';
import { async } from 'q';

export class GitHubCodeBlockFinder implements Finder {
  async find(webPageUrl: string, $root: JQuery<Node>): Promise<PlantUmlContent[]> {
    if (webPageUrl.match('https://github\\.com.*') == null) return [];

    const $texts = $root.find("pre[lang='pu'],pre[lang='uml'],pre[lang='puml']");
    const result = [];
    for (let i = 0; i < $texts.length; i++) {
      const $text = $texts.eq(i);
      result.push({ $text, texts: [$text.text()] });
    }
    return result;
  }
}

export class GitHubFileBlockFinder implements Finder {
  async find(webPageUrl: string, $root: JQuery<Node>): Promise<PlantUmlContent[]> {
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
      result.push({ $text, texts: [fileText] });
    }
    return result;
  }
}

interface DiffRoots {
  base: string;
  head: string;
}

export class GitHubPullRequestDiffFinder implements Finder {
  async find(webPageUrl: string, $root: JQuery<Node>): Promise<PlantUmlContent[]> {
    if (webPageUrl.match('https://github\\.com/.*/pull/\\d+/files') == null) return [];
    const diffRoots = this.getDiffRoots(webPageUrl, $root);
    const $diffs = $root.find("div[id^='diff-']");
    const diffArray = [];
    for (let i = 0; i < $diffs.length; i++) {
      diffArray.push($diffs.eq(i));
    }
    const result = await Promise.all(diffArray.map($diff => this.getDiffContent(diffRoots, $diff)));
    return result.filter(content => content.texts.length > 0);
  }

  private getDiffRoots(webPageUrl: string, $root: JQuery<Node>): DiffRoots {
    const blobUrl = webPageUrl.replace(/pull\/\d+\/files/, 'blob');
    const tableObjectTagName = "div[class='TableObject-item TableObject-item--primary']";
    const baseRefTagName = "span[class='commit-ref css-truncate user-select-contain expandable base-ref']";
    const headRefTagName = "span[class='commit-ref css-truncate user-select-contain expandable head-ref']";
    const $baseRef = $root.find(tableObjectTagName + ' ' + baseRefTagName);
    const $headRef = $root.find(tableObjectTagName + ' ' + headRefTagName);
    return { base: blobUrl + '/' + $baseRef.text(), head: blobUrl + '/' + $headRef.text() };
  }

  private async getDiffContent(diffRoots: DiffRoots, $diff: JQuery<Node>): Promise<PlantUmlContent> {
    const filePath = $diff.find("div[class='file-info'] a").text();
    const $diffBlock = $diff.find("div[class='data highlight js-blob-wrapper ']");
    if (filePath.match('(.*\\.pu)|(.*\\.puml)|(.*\\.plantuml)') == null || $diffBlock.length == 0) {
      return { $text: $diffBlock, texts: [] };
    }
    const textsArray = await Promise.all([
      this.getTexts(diffRoots.base + '/' + filePath),
      this.getTexts(diffRoots.head + '/' + filePath),
    ]);
    return { $text: $diffBlock, texts: Array.prototype.concat.apply([], textsArray) };
  }

  private async getTexts(fileUrl: string): Promise<string[]> {
    const response = await fetch(fileUrl);
    const htmlString = await response.text();
    const $body = $(new DOMParser().parseFromString(htmlString, 'text/html')).find('body');
    const contents = await new GitHubFileBlockFinder().find(fileUrl, $body);
    return Array.prototype.concat.apply([], contents.map(content => content.texts));
  }
}
