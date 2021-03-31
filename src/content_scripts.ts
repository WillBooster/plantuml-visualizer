import $ from 'jquery';

import { Constants } from './constants';
import { CodeBlockFinder } from './finder/codeBlockFinder';
import { DiffFinder, CodeFinder } from './finder/finder';
import { GitHubFileViewFinder, GitHubPullRequestDiffFinder } from './finder/gitHubFinder';
import { DescriptionMutator } from './mutator/descriptionMutator';
import { DiffMutator } from './mutator/diffMutator';

const sleep = (msec: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, msec));

const allCodeFinders = [new CodeBlockFinder(), new GitHubFileViewFinder()];
const allDiffFinders = [new GitHubPullRequestDiffFinder()];
let enabledFinders: CodeFinder[];
let enabledDiffFinders: DiffFinder[];
let lastUrl: string;
let embedding = false;

main();

function main(): void {
  chrome.runtime.sendMessage({ command: Constants.commands.getExtensionEnabled }, (extensionEnabled) => {
    if (extensionEnabled) apply();
  });
}

function apply(): void {
  embedPlantUmlImages().finally();

  if (!Constants.urlRegexesToBeObserved.some((regex) => regex.test(location.href))) {
    return;
  }

  const observer = new MutationObserver(async (mutations) => {
    const addedSomeNodes = mutations.some((mutation) => mutation.addedNodes.length > 0);
    if (addedSomeNodes) {
      await embedPlantUmlImages();
      embedding = false;
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

async function embedPlantUmlImages(): Promise<void[]> {
  if (lastUrl === location.href && embedding) {
    return [];
  }

  embedding = true;
  if (lastUrl !== location.href) {
    lastUrl = location.href;
    enabledFinders = allCodeFinders.filter((f) => f.canFind(location.href));
    enabledDiffFinders = allDiffFinders.filter((f) => f.canFind(location.href));
  } else {
    // Deal with re-rendering multiple times (e.g. it occurs when updating a GitHub issue)
    await sleep(1000);
  }
  return Promise.all([
    DescriptionMutator.embedPlantUmlImages(enabledFinders, location.href, $(document.body)),
    DiffMutator.embedPlantUmlImages(enabledDiffFinders, location.href, $(document.body)),
  ]);
}
