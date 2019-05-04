import $ from 'jquery';
import { Finder } from './Finder';
import { PlantUmlEncoder } from './PlantUmlEncoder';

export const Mutator = {
  registrateOnClickEvents(finders: Finder[], webpageUrl: string) {
    for (let fi = 0; fi < finders.length; fi++) {
      const contents = finders[fi].find(webpageUrl);
      for (let ci = 0; ci < contents.length; ci++) {
        const $textArea = contents[ci].$textArea;
        const $imageArea = $('<img>', { src: PlantUmlEncoder.getImageUrl(contents[ci].text) });
        $imageArea.insertAfter($textArea);

        $textArea.click(function() {
          $(this).hide();
          $imageArea.show();
        });
        $imageArea.click(function() {
          $(this).hide();
          $textArea.show();
        });
        $textArea.hide();
        $imageArea.show();
      }
    }
  },
};
