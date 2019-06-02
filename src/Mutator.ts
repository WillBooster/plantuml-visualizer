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
          $(this).hide();
          $image.show();
        });
        $image.on('dblclick', e => {
          $(this).hide();
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

        const baseImages = content.baseTexts.map(text => $('<img>', { src: PlantUmlEncoder.getImageUrl(text) }));
        const headImages = content.headTexts.map(text => $('<img>', { src: PlantUmlEncoder.getImageUrl(text) }));
        baseImages[0].insertAfter($diff);
        for (let i = 1; i < baseImages.length; i++) {
          baseImages[i].insertAfter(baseImages[i - 1]);
        }
        headImages[0].insertAfter(baseImages[baseImages.length - 1]);
        for (let i = 1; i < baseImages.length; i++) {
          headImages[i].insertAfter(headImages[i - 1]);
        }

        $diff.on('dblclick', e => {
          $(this).hide();
          for (const $image of baseImages) $image.show();
          for (const $image of headImages) $image.show();
        });
        for (const images of [baseImages, headImages]) {
          for (const $image of images) {
            $image.on('dblclick', e => {
              for (const $image of baseImages) $image.hide();
              for (const $image of headImages) $image.hide();
              $diff.show();
            });
          }
        }
        $diff.dblclick();
      }
    }
  },
};
