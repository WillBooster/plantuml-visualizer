import $ from 'jquery';
import { Finder, DiffFinder } from './Finder';
import { ImageSrcPrefix, PlantUmlEncoder } from './PlantUmlEncoder';

export const Mutator = {
  embedPlantUmlImages(finders: Finder[], webPageUrl: string, $root: JQuery<Node>) {
    for (const finder of finders) {
      for (const content of finder.find(webPageUrl, $root)) {
        const $text = content.$text;

        // To avoid embedding an image multiple times
        const nextImgElement = $text.next()[0] as HTMLImageElement;
        if (nextImgElement && nextImgElement.src && nextImgElement.src.startsWith(ImageSrcPrefix)) {
          continue;
        }

        const $image = textToImage(content.text);
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
        const nextImgElement = $diff.next()[0] as HTMLImageElement;
        if (nextImgElement && nextImgElement.src && nextImgElement.src.startsWith(ImageSrcPrefix)) {
          continue;
        }
        const textsToImages = (texts: string[], noContentsMessage: string): JQuery<HTMLElement>[] =>
          texts.length > 0 ? texts.map(textToImage) : [$(`<div>${noContentsMessage}</div>`)];
        const baseImages = textsToImages(content.baseTexts, 'Nothing');
        const headImages = textsToImages(content.headTexts, 'Deleted');

        const $baseBranchMark = $(`<div>${content.baseBranchName}</div>`);
        const $headBranchMark = $(`<div>${content.headBranchName}</div>`);

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
          for (const $image of images) $image.show();
          $baseBranchMark.show();
          $headBranchMark.show();
        });
        for (const $image of images) {
          $image.on('dblclick', () => {
            for (const $image of images) $image.hide();
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

function textToImage(text: string): JQuery<HTMLElement> {
  const $div = $('<div>').css('overflow', 'auto');
  const $img = $('<img>', { src: PlantUmlEncoder.getImageUrl(text) });
  return $div.append($img);
}
