import $ from 'jquery';
import { GitHubCodeBlockFinder, GitHubFileBlockFinder, GitHubPullRequestDiffFinder } from './GitHubFinder';
import { RawFileFinder } from './RawFileFinder';
import { Mutator, DiffMutator } from './Mutator';
import { Constants } from './Constants';

chrome.runtime.sendMessage({ command: Constants.toggleEnabled }, extensionEnabled => {
  if (extensionEnabled) apply();
});

function apply(): void {
  const availableFinders = [new RawFileFinder(), new GitHubCodeBlockFinder(), new GitHubFileBlockFinder()];
  const availableDiffFinders = [new GitHubPullRequestDiffFinder()];

  const finders = availableFinders.filter(f => f.canFind(location.href));
  const diffFinders = availableDiffFinders.filter(f => f.canFind(location.href));
  if (finders.length + diffFinders.length === 0) return;

  Mutator.embedPlantUmlImages(finders, location.href, $(document.body));
  DiffMutator.embedPlantUmlImages(diffFinders, location.href, $(document.body));

  const observer = new MutationObserver(mutations => {
    const addedSomeNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
    if (addedSomeNodes) {
      Mutator.embedPlantUmlImages(finders, location.href, $(document.body));
      DiffMutator.embedPlantUmlImages(diffFinders, location.href, $(document.body));
    }
  });
  observer.observe(document.body, { childList: true });
}
