import { Finder } from '../finder/finder';
import { markAsAlreadyProcessed, textToImage } from './mutatorUtil';

export const DescriptionMutator = {
  async embedPlantUmlImages(finders: Finder[], webPageUrl: string, $root: JQuery<Node>) {
    await Promise.all(
      finders.map(async (finder) => {
        const contents = await finder.find(webPageUrl, $root);
        for (const content of contents) {
          // Skip if no PlantUML descriptions exist
          if (!content.text.length) continue;

          const $text = content.$text;

          // To avoid embedding an image multiple times
          let $image: JQuery<Node>;
          if (markAsAlreadyProcessed($text)) {
            $image = await textToImage(content.text);
            $image.insertAfter($text);
          } else {
            $image = $text.next();
          }

          $text.off('dblclick');
          $text.on('dblclick', () => {
            $text.hide();
            $image.show();
          });
          $image.off('dblclick');
          $image.on('dblclick', () => {
            $image.hide();
            $text.show();
          });
          $text.trigger('dblclick');
        }
      })
    );
  },
};
