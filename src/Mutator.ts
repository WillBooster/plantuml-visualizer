import $ from 'jquery';
import { Finder } from './Finder';
import { ImageSrcPrefix, PlantUmlEncoder } from './PlantUmlEncoder';

export const Mutator = {
  async embedPlantUmlImages(finders: Finder[], webPageUrl: string, $root: JQuery<Node>) {
    for (const finder of finders) {
      const contents = await finder.find(webPageUrl, $root);
      for (const content of contents) {
        const $text = content.$text;

        // To avoid embedding an image multiple times
        const nextImgElement = <HTMLImageElement>$text.next()[0];
        if (nextImgElement && nextImgElement.src && nextImgElement.src.startsWith(ImageSrcPrefix)) {
          continue;
        }

        const $images = content.texts.map(text => $('<img>', { src: PlantUmlEncoder.getImageUrl(text) }));
        for (const $image of $images) $image.insertAfter($text);
        $text.hide();
        for (const $image of $images) $image.show();

        $text.on('dblclick', e => {
          $text.hide();
          for (const $image of $images) $image.show();
        });
        for (const $image of $images) {
          $image.on('dblclick', e => {
            for (const $image of $images) $image.hide();
            $text.show();
          });
        }
      }
    }
  },
};
