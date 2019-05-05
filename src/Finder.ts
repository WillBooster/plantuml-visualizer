import $ from 'jquery';

export interface PlantUmlContent {
  $textArea: JQuery<Node>;
  text: string;
}

export interface Finder {
  find(webPageUrl: string, $root: JQuery<Node>): PlantUmlContent[];
}

export class GitHubCodeBlockFinder implements Finder {
  find(webPageUrl: string, $root: JQuery<Node>): PlantUmlContent[] {
    if (webPageUrl.match('https://github\\.com.*') == null) return [];

    const $textAreas = $root.find("pre[lang='pu'],pre[lang='uml'],pre[lang='puml']");
    const result = [];
    for (let i = 0; i < $textAreas.length; i++) {
      const $textArea = $textAreas.eq(i);
      result.push({ $textArea, text: $textArea.text() });
    }
    return result;
  }
}

export class GitHubFileBlockFinder implements Finder {
  find(webPageUrl: string, $root: JQuery<Node>): PlantUmlContent[] {
    if (webPageUrl.match('https://github\\.com/.*/(.*\\.pu)|(.*\\.puml)|(.*\\.plantuml)') == null) return [];

    const $textAreas = $("div[itemprop='text']");
    const result = [];
    for (let i = 0; i < $textAreas.length; i++) {
      const $textArea = $textAreas.eq(i);
      let fileText = '';
      const $fileLines = $textArea.find('tr');
      for (let i = 0; i < $fileLines.length; i++) {
        fileText +=
          $fileLines
            .eq(i)
            .find("[id^='LC'")
            .text() + '\n';
      }
      result.push({ $textArea, text: fileText });
    }
    return result;
  }
}
