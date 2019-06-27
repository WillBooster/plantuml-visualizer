import $ from 'jquery';
import { GitHubCodeBlockFinder, GitHubFileBlockFinder, GitHubPullRequestDiffFinder } from './GitHubFinder';
import { RawFileFinder } from './RawFileFinder';
import { Mutator, DiffMutator } from './Mutator';
import { Constants } from './Constants';

chrome.runtime.sendMessage({ command: Constants.toggleEnabled }, extensionEnabled => {
  if (extensionEnabled) apply();
});

function apply(): void {
  const allFinders = [new RawFileFinder(), new GitHubCodeBlockFinder(), new GitHubFileBlockFinder()];
  const allDiffFinders = [new GitHubPullRequestDiffFinder()];

  const enabledFinders = allFinders.filter(f => f.canFind(location.href));
  const enabledDiffFinders = allDiffFinders.filter(f => f.canFind(location.href));
  if (enabledFinders.length + enabledDiffFinders.length === 0) return;

  Mutator.embedPlantUmlImages(enabledFinders, location.href, $(document.body));
  DiffMutator.embedPlantUmlImages(enabledDiffFinders, location.href, $(document.body));

  const observer = new MutationObserver(mutations => {
    const addedSomeNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
    if (addedSomeNodes) {
      Mutator.embedPlantUmlImages(enabledFinders, location.href, $(document.body));
      DiffMutator.embedPlantUmlImages(enabledDiffFinders, location.href, $(document.body));
    }
  });
  observer.observe(document.body, { childList: true });
}
