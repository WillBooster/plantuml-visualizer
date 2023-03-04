import $ from 'jquery';

import type { DiffFinder } from '../finder/finder';

import { markAsIgnore, setDblclickHandlers, textsToImages } from './mutatorUtil';

class DiffMutator {
  async embedPlantUmlImages(diffFinders: DiffFinder[], webPageUrl: string, $root: JQuery<Node>): Promise<void> {
    await Promise.all(
      diffFinders.map(async (diffFinder) => {
        const contents = await diffFinder.findContents(webPageUrl, $root);
        for (const content of contents) {
          // Skip if no PlantUML descriptions exist
          if (content.baseTexts.length === 0 && content.headTexts.length === 0) continue;

          const $diffText = content.$diff;

          // To avoid embedding an image multiple times
          let $idffImage: JQuery<Node>;
          if (markAsIgnore($diffText)) {
            $idffImage = $(`<div></div>`);

            const $baseBranchMark = $(`<div>${content.baseBranchName}</div>`);
            const $headBranchMark = $(`<div>${content.headBranchName}</div>`);

            $baseBranchMark
              .css('padding', '4px 10px')
              .css('background-color', '#ffdce0')
              .css('color', 'rgba(27,31,35,.7)')
              .css('font-size', '12px');

            $headBranchMark
              .css('padding', '4px 10px')
              .css('background-color', '#cdffd8')
              .css('color', 'rgba(27,31,35,.7)')
              .css('font-size', '12px');

            const [baseImages, headImages] = await Promise.all([
              textsToImages(content.baseTexts, 'Nothing'),
              textsToImages(content.headTexts, 'Deleted'),
            ]);

            for (const $image of baseImages) {
              $image.css('background-color', '#ffeef0');
            }
            for (const $image of headImages) {
              $image.css('background-color', '#e6ffed');
            }

            $idffImage.append($baseBranchMark);
            baseImages[0].insertAfter($baseBranchMark);
            for (let i = 1; i < baseImages.length; i++) {
              baseImages[i].insertAfter(baseImages[i - 1]);
            }
            $headBranchMark.insertAfter(baseImages[baseImages.length - 1]);
            headImages[0].insertAfter($headBranchMark);
            for (let i = 1; i < headImages.length; i++) {
              headImages[i].insertAfter(headImages[i - 1]);
            }
            markAsIgnore($idffImage);
            $idffImage.insertAfter($diffText);
          } else {
            $idffImage = $diffText.next();
          }

          setDblclickHandlers($diffText, $idffImage);
        }
      })
    );
  }
}

export const diffMutator = new DiffMutator();
