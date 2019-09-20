import { Finder } from '../finder/Finder';
import { markAsAlreadyProcessed, textToImage } from './MutatorUtil';

export const DescriptionMutator = {
  async embedPlantUmlImages(finders: Finder[], webPageUrl: string, $root: JQuery<Node>) {
    for (const finder of finders) {
      for (const content of finder.find(webPageUrl, $root)) {
        const $text = content.$text;

        // To avoid embedding an image multiple times
        if (!markAsAlreadyProcessed($text)) continue;
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
