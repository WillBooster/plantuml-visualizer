import $ from 'jquery';
import { Finder } from './Finder';
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
        $text.hide();
        $image.show();

        $text.on('dblclick', function(e: JQuery.Event) {
          $(this).hide();
          $image.show();
        });
        $image.on('dblclick', function(e: JQuery.Event) {
          $(this).hide();
          $text.show();
        });
      }
    }
  },
};
