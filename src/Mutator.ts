import $ from 'jquery';
import { Finder } from './Finder';
import { ImageSrcPrefix, PlantUmlEncoder } from './PlantUmlEncoder';

export const Mutator = {
  embedPlantUmlImages(finders: Finder[], webPageUrl: string, $root: JQuery<Node>) {
    for (const finder of finders) {
      for (const content of finder.find(webPageUrl, $root)) {
        const $textArea = content.$textArea;

        // To avoid embedding an image multiple times
        const nextImgElement = <HTMLImageElement>$textArea.next()[0];
        if (nextImgElement && nextImgElement.src && nextImgElement.src.startsWith(ImageSrcPrefix)) {
          continue;
        }

        const $imageArea = $('<img>', { src: PlantUmlEncoder.getImageUrl(content.text) });
        $imageArea.insertAfter($textArea);
        $textArea.hide();
        $imageArea.show();

        $textArea.on('dblclick', function(e: JQuery.Event) {
          $(this).hide();
          $imageArea.show();
        });
        $imageArea.on('dblclick', function(e: JQuery.Event) {
          $(this).hide();
          $textArea.show();
        });
      }
    }
  },
};
