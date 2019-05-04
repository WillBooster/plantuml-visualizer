import $ from 'jquery';
import { Finder } from './Finder';
import { PlantUmlEncoder } from './PlantUmlEncoder';

export const Mutator = {
  registerOnClickEvents(finders: Finder[], webPageUrl: string) {
    for (let fi = 0; fi < finders.length; fi++) {
      const contents = finders[fi].find(webPageUrl);
      for (let ci = 0; ci < contents.length; ci++) {
        const $textArea = contents[ci].$textArea;
        const $imageArea = $('<img>', { src: PlantUmlEncoder.getImageUrl(contents[ci].text) });
        $imageArea.insertAfter($textArea);

        $textArea.on('click', function(e: JQuery.Event) {
          $(this).hide();
          $imageArea.show();
        });
        $imageArea.on('click', function(e: JQuery.Event) {
          $(this).hide();
          $textArea.show();
        });
        $textArea.hide();
        $imageArea.show();
      }
    }
  },
};
