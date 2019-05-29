import $ from 'jquery';

export interface PlantUmlContent {
  $text: JQuery<Node>;
  text: string;
}

export interface Finder {
  find(webPageUrl: string, $root: JQuery<Node>): PlantUmlContent[];
}

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

    const $texts = $("div[itemprop='text']");
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
