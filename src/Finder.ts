import $ from 'jquery';

enum WebpageType {
  GitHub,
  Others,
}

export interface PlantUmlContent {
  queryElement: JQuery<HTMLElement>;
  text: string;
}

export abstract class Finder {
  _webpageType: WebpageType;
  get webpageType(): WebpageType {
    return this._webpageType;
  }

  constructor() {
    this._webpageType = WebpageType.Others;
  }
  abstract find(): PlantUmlContent[];
}

export class CodeBlocksFinder extends Finder {
  constructor(webpageUrl: string) {
    super();
    if (webpageUrl.match('https://github\\.com.*') != null) {
      this._webpageType = WebpageType.GitHub;
    }
  }
  find(): PlantUmlContent[] {
    switch (this._webpageType) {
      case WebpageType.GitHub: {
        const textAreasJQuery = $("pre[lang='pu'],pre[lang='uml'],pre[lang='puml']");
        const result = [];
        for (let i = 0; i < textAreasJQuery.length; i++) {
          result.push({ queryElement: textAreasJQuery.eq(i), text: textAreasJQuery.eq(i).text() });
        }
        return result;
      }
      case WebpageType.Others: {
        return [];
      }
    }
  }
}

export class FileBlocksFinder extends Finder {
  constructor(webpageUrl: string) {
    super();
    if (webpageUrl.match('https://github\\.com/.*/(.*\\.pu)|(.*\\.puml)|(.*\\.plantuml)') != null) {
      this._webpageType = WebpageType.GitHub;
    }
  }
  find(): PlantUmlContent[] {
    switch (this._webpageType) {
      case WebpageType.GitHub: {
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
      case WebpageType.Others: {
        return [];
      }
    }
  }
}

export const activeFinders: Finder[] = [];
