import $ from 'jquery';
import { UmlContent, Finder, UmlDiffContent, DiffFinder } from './Finder';

export class GitHubCodeBlockFinder implements Finder {
  find(webPageUrl: string, $root: JQuery<Node>): UmlContent[] {
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
  find(webPageUrl: string, $root: JQuery<Node>): UmlContent[] {
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
  async find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlDiffContent[]> {
    if (webPageUrl.match('https://github\\.com/.*/pull/\\d+/files.*') == null) return [];
    const blobRoot = webPageUrl.replace(/pull\/\d+\/files.*/, 'blob');
    const branchNames = this.getBaseHeadBranchNames($root);
    const diffs = this.getDiffs($root);
    const result = await Promise.all(diffs.map($diff => this.getDiffContent(blobRoot, branchNames, $diff)));
    return result.filter(content => content.$diff.length > 0);
  }

  private getDiffs($root: JQuery<Node>): JQuery<Node>[] {
    const $diffs = $root.find("div[id^='diff-']");
    const diffs = [];
    for (let i = 0; i < $diffs.length; i++) {
      diffs.push($diffs.eq(i));
    }
    return diffs;
  }

  private getBaseHeadBranchNames($root: JQuery<Node>): string[] {
    const tableObjectTagName = 'div.TableObject-item.TableObject-item--primary';
    const getTagName = (baseOrHead: string) =>
      `span.commit-ref.css-truncate.user-select-contain.expandable.${baseOrHead}-ref`;
    const $baseRef = $root.find(tableObjectTagName + ' ' + getTagName('base'));
    const $headRef = $root.find(tableObjectTagName + ' ' + getTagName('head'));
    return [$baseRef.text(), $headRef.text()];
  }

  private async getDiffContent(blobRoot: string, branchNames: string[], $diff: JQuery<Node>): Promise<UmlDiffContent> {
    const filePath = $diff.find('div.file-info a').text();
    const $diffBlock = $diff.find('div.data.highlight.js-blob-wrapper');
    if (filePath.match('(.*\\.pu)|(.*\\.puml)|(.*\\.plantuml)') == null || $diffBlock.length == 0) {
      return { $diff: $(), baseTexts: [], headTexts: [] };
    }
    const fileUrls = branchNames.map(branchName => blobRoot + '/' + branchName + '/' + filePath);
    const baseHeadTexts = await Promise.all(fileUrls.map(fileUrl => this.getTexts(fileUrl)));
    return { $diff: $diffBlock, baseTexts: baseHeadTexts[0], headTexts: baseHeadTexts[1] };
  }

  private async getTexts(fileUrl: string): Promise<string[]> {
    const response = await fetch(fileUrl);
    const htmlString = await response.text();
    const $body = $(new DOMParser().parseFromString(htmlString, 'text/html')).find('body');
    const contents = new GitHubFileBlockFinder().find(fileUrl, $body);
    return contents.map(content => content.text);
  }
}
