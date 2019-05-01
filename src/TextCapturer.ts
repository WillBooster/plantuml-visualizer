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
