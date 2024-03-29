import $ from 'jquery';

import type { Config } from './config';
import { urlToRegExp } from './config';
import { Constants } from './constants';
import { CodeBlockFinder } from './finder/codeBlockFinder';
import type { CodeFinder, DiffFinder } from './finder/finder';
import { GitHubFileViewFinder } from './finder/github/gitHubFileViewFinder';
import { GitHubPullRequestDiffFinder } from './finder/github/gitHubPullRequestDiffFinder';
import { descriptionMutator } from './mutator/descriptionMutator';
import { diffMutator } from './mutator/diffMutator';

const sleep = (msec: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, msec));

const allCodeFinders = [new CodeBlockFinder(), new GitHubFileViewFinder()] as const;
const allDiffFinders = [new GitHubPullRequestDiffFinder()] as const;
let enabledFinders: CodeFinder[];
let enabledDiffFinders: DiffFinder[];
let lastUrl: string;
let embedding = false;

main();

function main(): void {
  chrome.runtime.sendMessage({ command: Constants.commands.getConfig }, (config: Config) => {
    if (
      config.extensionEnabled &&
      config.allowedUrls.some((url) => urlToRegExp(url).test(location.href)) &&
      !config.deniedUrls.some((url) => urlToRegExp(url).test(location.href))
    ) {
      apply();
    }
  });
}

function apply(): void {
  embedPlantUmlImages().finally();

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
  if (lastUrl === location.href && embedding) return [];

  embedding = true;
  if (lastUrl === location.href) {
    // Deal with re-rendering multiple times (e.g. it occurs when updating a GitHub issue)
    await sleep(1000);
  } else {
    lastUrl = location.href;
    enabledFinders = allCodeFinders.filter((f) => f.canFind(location.href));
    enabledDiffFinders = allDiffFinders.filter((f) => f.canFind(location.href));
  }
  return Promise.all([
    descriptionMutator.embedPlantUmlImages(enabledFinders, location.href, $(document.body)),
    diffMutator.embedPlantUmlImages(enabledDiffFinders, location.href, $(document.body)),
  ]);
}
