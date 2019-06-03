import $ from 'jquery';
import { Finder, DiffFinder } from './Finder';
import { ImageSrcPrefix, PlantUmlEncoder } from './PlantUmlEncoder';

export const Mutator = {
  embedPlantUmlImages(finders: Finder[], webPageUrl: string, $root: JQuery<Node>) {
    for (const finder of finders) {
      for (const content of finder.find(webPageUrl, $root)) {
        const $text = content.$text;

        // To avoid embedding an image multiple times
        const nextImgElement = <HTMLImageElement>$text.next()[0];
        if (nextImgElement && nextImgElement.src && nextImgElement.src.startsWith(ImageSrcPrefix)) {
          continue;
        }

        const $image = $('<img>', { src: PlantUmlEncoder.getImageUrl(content.text) });
        $image.insertAfter($text);

        $text.on('dblclick', e => {
          $text.hide();
          $image.show();
        });
        $image.on('dblclick', e => {
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
        const nextImgElement = <HTMLImageElement>$diff.next()[0];
        if (nextImgElement && nextImgElement.src && nextImgElement.src.startsWith(ImageSrcPrefix)) {
          continue;
        }

        const textToImage = (text: string) => $('<img>', { src: PlantUmlEncoder.getImageUrl(text) });
        const baseImages = content.baseTexts.map(textToImage);
        const headImages = content.headTexts.map(textToImage);

        baseImages[0].insertAfter($diff);
        for (let i = 1; i < baseImages.length; i++) {
          baseImages[i].insertAfter(baseImages[i - 1]);
        }
        headImages[0].insertAfter(baseImages[baseImages.length - 1]);
        for (let i = 1; i < baseImages.length; i++) {
          headImages[i].insertAfter(headImages[i - 1]);
        }

        const images = baseImages.concat(headImages);
        $diff.on('dblclick', e => {
          $diff.hide();
          for (const $image of images) $image.show();
        });
        for (const $image of images) {
          $image.on('dblclick', e => {
            for (const $image of images) $image.hide();
            $diff.show();
          });
        }
        $diff.dblclick();
      }
    }
  },
};
