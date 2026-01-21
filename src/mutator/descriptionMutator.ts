import type { CodeFinder } from '../finder/finder';

import { markAsIgnore, isRerenderNeeded, setDblclickHandlers, textToImage, markRenderRequested } from './mutatorUtil';

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
          let doRender = true;

          if (!markAsIgnore($text)) {
            doRender = false;

            // rerender image if text changed
            if (await isRerenderNeeded($text, content.text)) doRender = true;
          }

          if (doRender) {
            // avoid triggering multiple asynchronuous image render requests
            markRenderRequested($text, content.text);

            const $newImage = await textToImage(content.text);
            markAsIgnore($newImage);

            const $image = $text.next();
            $newImage.insertAfter($text);
            $image.remove();

            setDblclickHandlers($text, $newImage);
          }
        }
      })
    );
  }
}

export const descriptionMutator = new DescriptionMutator();
