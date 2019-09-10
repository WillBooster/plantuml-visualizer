import $ from 'jquery';
import { DiffFinder, Finder } from './Finder';
import { ImageSrcPrefix, PlantUmlEncoder } from './PlantUmlEncoder';

export const Mutator = {
  async embedPlantUmlImages(finders: Finder[], webPageUrl: string, $root: JQuery<Node>) {
    for (const finder of finders) {
      for (const content of finder.find(webPageUrl, $root)) {
        const $text = content.$text;

        // To avoid embedding an image multiple times
        if (isAlreadyEmbedded($text)) continue;
        const $image = await textToImage(content.text);
        $image.insertAfter($text);

        $text.on('dblclick', () => {
          $text.hide();
          $image.show();
        });
        $image.on('dblclick', () => {
          $image.hide();
          $text.show();
        });
        $text.dblclick();
      }
    }
  },
};

export const DiffMutator = {
  async embedPlantUmlImages(diffFinders: DiffFinder[], webPageUrl: string, $root: JQuery<Node>) {
    for (const finder of diffFinders) {
      for (const content of await finder.find(webPageUrl, $root)) {
        const $diff = content.$diff;

        // To avoid embedding an image multiple times
        if (isAlreadyEmbedded($diff)) continue;
        const baseImages = await textsToImages(content.baseTexts, 'Nothing');
        const headImages = await textsToImages(content.headTexts, 'Deleted');

        for (const $image of baseImages) {
          $image.css('background-color', '#ffeef0');
        }
        for (const $image of headImages) {
          $image.css('background-color', '#e6ffed');
        }

        const $baseBranchMark = $(`<div>${content.baseBranchName}</div>`);
        const $headBranchMark = $(`<div>${content.headBranchName}</div>`);

        $baseBranchMark
          .css('padding', '4px 10px')
          .css('background-color', '#ffdce0')
          .css('color', 'rgba(27,31,35,.7)')
          .css('font-size', '12px');

        $headBranchMark
          .css('padding', '4px 10px')
          .css('background-color', '#cdffd8')
          .css('color', 'rgba(27,31,35,.7)')
          .css('font-size', '12px');

        $baseBranchMark.insertAfter($diff);
        baseImages[0].insertAfter($baseBranchMark);
        for (let i = 1; i < baseImages.length; i++) {
          baseImages[i].insertAfter(baseImages[i - 1]);
        }
        $headBranchMark.insertAfter(baseImages[baseImages.length - 1]);
        headImages[0].insertAfter($headBranchMark);
        for (let i = 1; i < headImages.length; i++) {
          headImages[i].insertAfter(headImages[i - 1]);
        }

        const images = baseImages.concat(headImages);
        $diff.on('dblclick', () => {
          $diff.hide();
          for (const $image of images) {
            $image.show();
          }
          $baseBranchMark.show();
          $headBranchMark.show();
        });
        for (const $image of images) {
          $image.on('dblclick', () => {
            for (const $image of images) {
              $image.hide();
            }
            $baseBranchMark.hide();
            $headBranchMark.hide();
            $diff.show();
          });
        }
        $diff.dblclick();
      }
    }
  },
};

function isAlreadyEmbedded($content: JQuery<Node>): boolean {
  const nextDivElement = $content.next()[0] as HTMLDivElement;
  if (!nextDivElement || nextDivElement.tagName != 'DIV') return false;
  const nextImgElement = nextDivElement.childNodes[0] as HTMLImageElement;
  return nextImgElement && nextImgElement.tagName == 'IMG' && nextImgElement.src.startsWith(ImageSrcPrefix);
}

async function textToImage(text: string): Promise<JQuery<HTMLElement>> {
  const $div = $('<div>')
    .css('overflow', 'auto')
    .css('padding', '4px 10px');
  const res = await fetch(PlantUmlEncoder.getImageUrl(text));
  const $svg = $.parseHTML(await res.text());
  return $div.append($svg);
}

async function textsToImages(texts: string[], noContentsMessage: string): Promise<JQuery<HTMLElement>[]> {
  if (texts.length == 0) {
    return [$(`<div>${noContentsMessage}</div>`)];
  }
  const ret = [];
  for (const text of texts) {
    ret.push(await textToImage(text));
  }
  return ret;
}
