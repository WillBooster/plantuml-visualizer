import $ from 'jquery';
import { PlantUmlContent, Finder } from './Finder';

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

export class GitHubPullRequestDiffFinder implements Finder {
  find(webPageUrl: string, $root: JQuery<Node>): PlantUmlContent[] {
    if (webPageUrl.match('https://github\\.com/.*/pull/\\d+/files') == null) return [];
    const diffRepoRoot = this.getDiffRepoRoot(webPageUrl, $root);
    const result = [];
    const $diffs = $root.find("div[id^='diff-']");
    for (let i = 0; i < $diffs.length; i++) {
      const $diff = $diffs.eq(i);
      const filePath = $diff.find("div[class='file-info'] a").text();
      const $fileDiffBlock = $diff.find("div[class='data highlight js-blob-wrapper ']");
      if (filePath.match('(.*\\.pu)|(.*\\.puml)|(.*\\.plantuml)') == null || $fileDiffBlock.length == 0) continue;
      let diffText = '';
      const baseUrl = diffRepoRoot.base + '/' + filePath;
      this.getUmlText(baseUrl).then(baseText => {
        diffText += baseText;
      });
      const headUrl = diffRepoRoot.head + '/' + filePath;
      this.getUmlText(headUrl).then(headText => {
        diffText += headText;
      });
      result.push({ $text: $fileDiffBlock, text: diffText });
    }
    return result;
  }

  private getDiffRepoRoot(webPageUrl: string, $root: JQuery<Node>) {
    const blobUrl = webPageUrl.replace(/pull\/\d+\/files/, 'blob');
    const tableObjectTagName = "div[class='TableObject-item TableObject-item--primary']";
    const baseRefTagName = "span[class='commit-ref css-truncate user-select-contain expandable base-ref']";
    const headRefTagName = "span[class='commit-ref css-truncate user-select-contain expandable head-ref']";
    const $baseRef = $root.find(tableObjectTagName + ' ' + baseRefTagName);
    const $headRef = $root.find(tableObjectTagName + ' ' + headRefTagName);
    return {
      base: blobUrl + '/' + $baseRef.text(),
      head: blobUrl + '/' + $headRef.text(),
    };
  }

  private async getUmlText(fileBlockUrl: string): Promise<string> {
    const response = await fetch(fileBlockUrl);
    const htmlString = await response.text();
    const contents = new GitHubFileBlockFinder().find(fileBlockUrl, $(htmlString).find('body'));
    let umlText = '';
    for (const content of contents) {
      umlText += content.text;
    }
    return umlText;
  }
}
