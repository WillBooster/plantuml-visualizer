import $ from 'jquery';
import { GitHubCodeBlockFinder, GitHubFileBlockFinder, GitHubPullRequestDiffFinder } from './GitHubFinder';
import { RawFileFinder } from './RawFileFinder';
import { Mutator, DiffMutator } from './Mutator';
import { Constants } from './Constants';
import { DiffFinder, Finder } from './Finder';

const allFinders = [new RawFileFinder(), new GitHubCodeBlockFinder(), new GitHubFileBlockFinder()];
const allDiffFinders = [new GitHubPullRequestDiffFinder()];
let enabledFinders: Finder[];
let enabledDiffFinders: DiffFinder[];
let lastUrl: string;

chrome.runtime.sendMessage({ command: Constants.toggleEnabled }, extensionEnabled => {
  if (extensionEnabled) apply();
});

function apply(): void {
  embedPlantUmlImages();

  if (!Constants.urlRegexesShouldBeObserved.some(regex => regex.test(location.href))) {
    return;
  }

  const observer = new MutationObserver(mutations => {
    const addedSomeNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
    if (addedSomeNodes) {
      embedPlantUmlImages();
    }
  });
  observer.observe(document.body, { childList: true });
}

function embedPlantUmlImages(): void {
  if (lastUrl !== location.href) {
    lastUrl = location.href;
    enabledFinders = allFinders.filter(f => f.canFind(location.href));
    enabledDiffFinders = allDiffFinders.filter(f => f.canFind(location.href));
  }
  Mutator.embedPlantUmlImages(enabledFinders, location.href, $(document.body));
  DiffMutator.embedPlantUmlImages(enabledDiffFinders, location.href, $(document.body));
}
