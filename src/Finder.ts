import $ from 'jquery';

export interface PlantUmlContent {
  queryElement: JQuery<HTMLElement>;
  text: string;
}

export abstract class Finder {
  abstract find(webpageUrl: string): PlantUmlContent[];
}

export class GitHubCodeBlockFinder extends Finder {
  find(webpageUrl: string): PlantUmlContent[] {
    if (webpageUrl.match('https://github\\.com.*') == null) return [];

    const textAreasJQuery = $("pre[lang='pu'],pre[lang='uml'],pre[lang='puml']");
    const result = [];
    for (let i = 0; i < textAreasJQuery.length; i++) {
      result.push({ queryElement: textAreasJQuery.eq(i), text: textAreasJQuery.eq(i).text() });
    }
    return result;
  }
}

export class GitHubFileBlockFinder extends Finder {
  find(webpageUrl: string): PlantUmlContent[] {
    if (webpageUrl.match('https://github\\.com/.*/(.*\\.pu)|(.*\\.puml)|(.*\\.plantuml)') == null) return [];

    const textAreasJQuery = $("div[itemprop='text']");
    const result = [];
    for (let i = 0; i < textAreasJQuery.length; i++) {
      const textAreaJQuery = textAreasJQuery.eq(i);
      let viewedFileText: string = '';
      const fileLines = textAreaJQuery.find('tr');
      for (let i = 0; i < fileLines.length; i++) {
        viewedFileText +=
          fileLines
            .eq(i)
            .find("[id^='LC'")
            .text() + '\n';
      }
      result.push({ queryElement: textAreaJQuery, text: viewedFileText });
    }
    return result;
  }
}
