import $ from 'jquery';
import { PlantUmlEncoder } from './PlantUmlEncoder';

// tslint:disable-next-line: export-name

abstract class UmlVisualizer {
  abstract replaceTextWithImage(): void;
}

export class CodeBlocksUmlVisualizer extends UmlVisualizer {
  private textAreasJQuery: JQuery<HTMLElement>;
  private imageTagJQueries: JQuery<HTMLElement>[];

  constructor() {
    super();
    this.textAreasJQuery = $("pre[lang='pu'],pre[lang='uml'],pre[lang='puml']");
    this.imageTagJQueries = [];
    for (let i = 0; i < this.textAreasJQuery.length; i++) {
      const codeBlockText = this.textAreasJQuery.eq(i).text();
      this.imageTagJQueries.push($('<img>', { src: PlantUmlEncoder.getImageUrl(codeBlockText) }));
    }
  }

  replaceTextWithImage(): void {
    for (let i = 0; i < this.textAreasJQuery.length; i++) {
      const textAreaJQuery = this.textAreasJQuery.eq(i);
      textAreaJQuery.replaceWith(this.imageTagJQueries[i]);
    }
  }
}

export class ViewedFileUmlVisualizer extends UmlVisualizer {
  private textAreaJQuery: JQuery<HTMLElement>;
  private imageTagJQuery: JQuery<HTMLElement>;

  constructor() {
    super();
    const viewedFilename = $('#blob-path > .final-path');
    if (viewedFilename.length == 0 || viewedFilename.text().match('(.*.pu)|(.*.puml)|(.*.plantuml)') == null) {
      this.textAreaJQuery = $();
      this.imageTagJQuery = $();
    } else {
      this.textAreaJQuery = $("div[itemprop='text']");
      this.imageTagJQuery = $('<img>', { src: PlantUmlEncoder.getImageUrl(this.getViewedFileText()) });
    }
  }

  replaceTextWithImage(): void {
    if (this.textAreaJQuery.length != 0) {
      this.textAreaJQuery.replaceWith(this.imageTagJQuery);
    }
  }

  getViewedFileText(): string {
    if (this.textAreaJQuery.length == 0) return '';

    let viewedFileText: string = '';
    const fileLines = this.textAreaJQuery.find('tr');
    for (let i = 0; i < fileLines.length; i++) {
      viewedFileText +=
        fileLines
          .eq(i)
          .find("[id^='LC'")
          .text() + '\n';
    }
    return viewedFileText;
  }
}
