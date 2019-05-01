import $ from 'jquery';

// tslint:disable-next-line: export-name
export function getCodeBlockTexts(): string[] {
  const codeBlocks = $("pre[lang='pu'],pre[lang='uml'],pre[lang='puml']");

  const codeBlockTexts: string[] = [];
  for (let i = 0; i < codeBlocks.length; i++) {
    codeBlockTexts.push(codeBlocks.eq(i).text());
  }
  return codeBlockTexts;
}

export function getViewedFileText(): string {
  const viewedFilename = $('#blob-path > .final-path');
  if (viewedFilename.length == 0 || viewedFilename.text().match('(.*.pu)|(.*.puml)|(.*.plantuml)') == null) {
    return '';
  }
  var viewedFileText: string = '';
  const fileLines = $("div[itemprop='text'] tr");
  for (var i = 0; i < fileLines.length; i++) {
    viewedFileText +=
      fileLines
        .eq(i)
        .find("[id^='LC'")
        .text() + '\n';
  }
  return viewedFileText;
}
