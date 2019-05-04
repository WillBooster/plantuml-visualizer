import $ from 'jquery';

export interface PlantUmlContent {
  $textArea: JQuery<HTMLElement>;
  text: string;
}

export abstract class Finder {
  abstract find(webPageUrl: string): PlantUmlContent[];
}

export class GitHubCodeBlockFinder extends Finder {
  find(webPageUrl: string): PlantUmlContent[] {
    if (webPageUrl.match('https://github\\.com.*') == null) return [];

    const $textAreas = $("pre[lang='pu'],pre[lang='uml'],pre[lang='puml']");
    const result = [];
    for (let i = 0; i < $textAreas.length; i++) {
      result.push({ $textArea: $textAreas.eq(i), text: $textAreas.eq(i).text() });
    }
    return result;
  }
}

export class GitHubFileBlockFinder extends Finder {
  find(webPageUrl: string): PlantUmlContent[] {
    if (webPageUrl.match('https://github\\.com/.*/(.*\\.pu)|(.*\\.puml)|(.*\\.plantuml)') == null) return [];

    const $textAreas = $("div[itemprop='text']");
    const result = [];
    for (let i = 0; i < $textAreas.length; i++) {
      const $textArea = $textAreas.eq(i);
      let fileText: string = '';
      const $fileLines = $textArea.find('tr');
      for (let i = 0; i < $fileLines.length; i++) {
        fileText +=
          $fileLines
            .eq(i)
            .find("[id^='LC'")
            .text() + '\n';
      }
      result.push({ $textArea: $textArea, text: fileText });
    }
    return result;
  }
}
