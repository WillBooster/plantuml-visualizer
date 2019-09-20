import $ from 'jquery';
import { GitHubCodeBlockFinder, GitHubFileBlockFinder, GitHubPullRequestDiffFinder } from './finder/GitHubFinder';
import { RawFileFinder } from './finder/RawFileFinder';
import { DescriptionMutator } from './mutator/DescriptionMutator';
import { Constants } from './Constants';
import { DiffFinder, Finder } from './finder/Finder';
import { DiffMutator } from './mutator/DiffMutator';

const allFinders = [new RawFileFinder(), new GitHubCodeBlockFinder(), new GitHubFileBlockFinder()];
const allDiffFinders = [new GitHubPullRequestDiffFinder()];
let enabledFinders: Finder[];
let enabledDiffFinders: DiffFinder[];
let lastUrl: string;

chrome.runtime.sendMessage({ command: Constants.toggleEnabled }, extensionEnabled => {
  if (extensionEnabled) apply();
});

let embedding = false;

function apply(): void {
  embedPlantUmlImages().finally();

  if (!Constants.urlRegexesToBeObserved.some(regex => regex.test(location.href))) {
    return;
  }

  const observer = new MutationObserver(async mutations => {
    const addedSomeNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
    if (addedSomeNodes) {
      await embedPlantUmlImages();
      embedding = false;
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

const sleep = (msec: number): Promise<void> => new Promise(resolve => setTimeout(resolve, msec));

async function embedPlantUmlImages(): Promise<void[]> {
  if (lastUrl === location.href && embedding) {
    return [];
  }

  embedding = true;
  if (lastUrl !== location.href) {
    lastUrl = location.href;
    enabledFinders = allFinders.filter(f => f.canFind(location.href));
    enabledDiffFinders = allDiffFinders.filter(f => f.canFind(location.href));
  } else {
    // Deal with re-rendering multiple times (e.g. it occurs when updating a GitHub issue)
    await sleep(1000);
  }
  return Promise.all([
    DescriptionMutator.embedPlantUmlImages(enabledFinders, location.href, $(document.body)),
    DiffMutator.embedPlantUmlImages(enabledDiffFinders, location.href, $(document.body)),
  ]);
}
