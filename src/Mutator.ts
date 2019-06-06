import $ from 'jquery';
import { Finder, DiffFinder } from './Finder';
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

        $text.on('dblclick', e => {
          $text.hide();
          $image.show();
        });
        $image.on('dblclick', e => {
          $image.hide();
          $text.show();
        });
        $text.dblclick();
      }
    }
  },
};

export const DiffMutator = {
  async embedPlantUmlImages(diffFinders: DiffFinder[], webPageUrl: string, $root: JQuery<Node>) {
    for (const finder of diffFinders) {
      for (const content of await finder.find(webPageUrl, $root)) {
        const $diff = content.$diff;

        // To avoid embedding an image multiple times
        const nextImgElement = <HTMLImageElement>$diff.next()[0];
        if (nextImgElement && nextImgElement.src && nextImgElement.src.startsWith(ImageSrcPrefix)) {
          continue;
        }

        const textsToImageTags = (texts: string[]) =>
          texts.length > 0
            ? texts.map(text => $('<img>', { src: PlantUmlEncoder.getImageUrl(text) }))
            : [$('<div>No PlantUML</div>')];
        const baseImageTags = textsToImageTags(content.baseTexts);
        const headImageTags = textsToImageTags(content.headTexts);

        // tslint:disable-next-line:no-jquery-raw-elements
        const $baseBranchMark = $(`<div>${content.baseBranchName}</div>`);
        // tslint:disable-next-line:no-jquery-raw-elements
        const $headBranchMark = $(`<div>${content.headBranchName}</div>`);

        $baseBranchMark.insertAfter($diff);
        baseImageTags[0].insertAfter($baseBranchMark);
        for (let i = 1; i < baseImageTags.length; i++) {
          baseImageTags[i].insertAfter(baseImageTags[i - 1]);
        }
        $headBranchMark.insertAfter(baseImageTags[baseImageTags.length - 1]);
        headImageTags[0].insertAfter($headBranchMark);
        for (let i = 1; i < headImageTags.length; i++) {
          headImageTags[i].insertAfter(headImageTags[i - 1]);
        }

        const imageTags = baseImageTags.concat(headImageTags);
        $diff.on('dblclick', e => {
          $diff.hide();
          for (const $imageTag of imageTags) $imageTag.show();
          $baseBranchMark.show();
          $headBranchMark.show();
        });
        for (const $image of imageTags) {
          $image.on('dblclick', e => {
            for (const $imageTag of imageTags) $imageTag.hide();
            $baseBranchMark.hide();
            $headBranchMark.hide();
            $diff.show();
          });
        }
        $diff.dblclick();
      }
    }
  },
};
