import $ from 'jquery';
import { Finder } from './Finder';
import { PlantUmlEncoder } from './PlantUmlEncoder';

export const Mutator = {
  registrateOnClickEvents(finders: Finder[], webpageUrl: string) {
    for (let fi = 0; fi < finders.length; fi++) {
      const contents = finders[fi].find(webpageUrl);
      for (let ci = 0; ci < contents.length; ci++) {
        const textElement = contents[ci].queryElement;
        const imageElement = $('<img>', { src: PlantUmlEncoder.getImageUrl(contents[ci].text) });
        imageElement.insertAfter(textElement);

        textElement.click(function() {
          $(this).hide();
          imageElement.show();
        });
        imageElement.click(function() {
          $(this).hide();
          textElement.show();
        });
        textElement.hide();
        imageElement.show();
      }
    }
  },
};
