import type { CodeFinder } from '../finder/finder';

import { markAsIgnore, setDblclickHandlers, textToImage } from './mutatorUtil';

class DescriptionMutator {
  async embedPlantUmlImages(finders: CodeFinder[], webPageUrl: string, $root: JQuery<Node>): Promise<void> {
    await Promise.all(
      finders.map(async (finder) => {
        const contents = await finder.findContents(webPageUrl, $root);
        for (const content of contents) {
          // Skip if no PlantUML descriptions exist
          if (content.text.length === 0) continue;

          const $text = content.$text;

          // To avoid embedding an image multiple times
          let $image: JQuery<Node>;
          if (markAsIgnore($text)) {
            $image = await textToImage(content.text);
            markAsIgnore($image);
            $image.insertAfter($text);
          } else {
            $image = $text.next();
          }

          setDblclickHandlers($text, $image);
        }
      })
    );
  }
}

export const descriptionMutator = new DescriptionMutator();
